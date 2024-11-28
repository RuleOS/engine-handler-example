//@ts-nocheck
import { BigNumberish } from "ethers";
import { PGroupSlotIO, PHandler } from ".";
import { plainToInstance, Type } from "class-transformer";
import { Cluster, Rule, RuleSlot } from "..";
import { PFlow } from "./PFlow";
import { PState } from "./PState";

export class PRule {
  ruleSlotIndexInput: BigNumberish;//0
  ruleSlotIndexOutput: BigNumberish;//1;
  state: BigNumberish;//1,
  totalCount: BigNumberish;//100,
  durationType: BigNumberish;//0,
  delayTimestamp: BigNumberish;//0,
  delayBlockNumber: BigNumberish;//0,
  snippet: string;// 0x0000000000000000000000000000000000000000,
  @Type(() => PHandler)
  preHandlerList: PHandler[] = [];
  @Type(() => PHandler)
  processHandlerList: PHandler[] = [];
  @Type(() => PHandler)
  postHandlerList: PHandler[] = [];

  @Type(() => PGroupSlotIO)
  groupSlotIOList: PGroupSlotIO[] = [];

  @Type(() => PState)
  executionStateList:PState[] = [];

  @Type(() => PFlow)
  executionFlowList:PFlow[] = [];

  public toRule(cluster: Cluster): Rule {
    let rule = plainToInstance(Rule, this);
    delete rule.groupSlotIOList;

    rule.preHandlerList = [];
    rule.processHandlerList = [];
    rule.postHandlerList = [];
    this.preHandlerList.forEach(handler => handler.convert(rule.preHandlerList, rule.preHandlerArgsList, rule.preHandlerPoolList));
    this.processHandlerList.forEach(handler => handler.convert(rule.processHandlerList, rule.processHandlerArgsList, rule.processHandlerPoolList));
    this.postHandlerList.forEach(handler => handler.convert(rule.postHandlerList, rule.postHandlerArgsList, rule.postHandlerPoolList));

    this.toRuleSlot(cluster, rule);
    cluster.addRule(rule);
    return rule;
  }

  public toRuleSlot(cluster: Cluster, rule: Rule) {
    this.groupSlotIOList.forEach(groupSlotIO => groupSlotIO.toGroupSlot(rule));
    if (rule.ruleSlotIndexInput == 0) {
      rule.ruleSlotIndexInput = ++cluster._contractMaxRuleSlotIndex;
    }
    if (rule.ruleSlotIndexOutput == 0) {
      rule.ruleSlotIndexOutput = ++cluster._contractMaxRuleSlotIndex;
    }
    cluster.addRuleSlot(new RuleSlot(rule.ruleSlotIndexInput, Array.from(rule._inputGroupSlotMap.values())));
    cluster.addRuleSlot(new RuleSlot(rule.ruleSlotIndexOutput, Array.from(rule._outGroupSlotMap.values())));
  }

}
