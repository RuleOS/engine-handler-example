//@ts-nocheck

import { BigNumberish } from "ethers";
import { Attribute } from "../Attribute";
import { PRule } from "./PRule";
import { plainToInstance, Type } from "class-transformer";
import { Cluster } from "../Cluster";

export class PCluster {
  contractMaxRuleSlotIndex: number = -1; // id to flag groupSlot[]

  chainId: BigNumberish = 0;
  clusterId: BigNumberish = 1;
  delayTimestamp: BigNumberish = 0;
  delayBlockNumber: BigNumberish = 0;
  deployerList: string[] = [];//["0xE1625667F3435B3dC4d6a0A9Bcf3438E1E2098B5"],
  adminList: string[] = [];//["0xE1625667F3435B3dC4d6a0A9Bcf3438E1E2098B5"],
  description: string = "";
  state: BigNumberish = 1;
  attrList: Attribute[] = [];
  attrStateList: BigNumberish[] = [];

  @Type(() => PRule)
  ruleList: PRule[] = [];

  public static load(protocolJson: object) {
    return plainToInstance(PCluster, protocolJson);
  }

  public toCluster(): Cluster {
    let cluster = plainToInstance(Cluster, this);
    cluster.ruleList = [];
    return this.toRules(cluster);
  }

  public toRules(cluster: Cluster): Cluster {
    let maxRuleSlotIndex = cluster.contractMaxRuleSlotIndex;
    cluster.contractMaxRuleSlotIndex = -1;
    cluster._contractMaxRuleSlotIndex = maxRuleSlotIndex;
    this.ruleList.forEach(pRule => pRule.toRule(cluster));
    cluster.contractMaxRuleSlotIndex = maxRuleSlotIndex;
    return cluster;
  }
}
