// @ts-nocheck
import { BigNumberish } from "ethers";
import { CLUSTER_STATE } from "./Constant";
import { GroupSlot } from "./GroupSlot";
import { Rule } from "./Rule";
import { TokenSlot } from "./TokenSlot";
import { RuleSlot } from "./RuleSlot";
import { Attribute } from "./Attribute";
import { getLogger, ILogger } from "../util";

let log: ILogger = getLogger();

export class Cluster {
  clusterId: BigNumberish = 0; // get from chain ,this > 0

  contractMaxRuleSlotIndex: number = -1; // id to flag groupSlot[]
  _contractMaxRuleSlotIndex: number = -1; // tmp

  deployerList: string[] = [];//first register usage
  adminList: string[] = [];//first register usage
  description: string;//first register usage

  groupSlotList: GroupSlot[] = [];//contract use
  ruleSlotBound: number[] = [];//contract use
  ruleList: Rule[] = [];//contract use
  attrList: Attribute[] = [];
  attrStateList: BigNumberish[] = [];

  handlerVersionNameMap: Map = new Map();//memory use

  handlerUniqueList: string[] = [];

  ruleSlotList: RuleSlot[] = [];//GroupSlot[][] = []; //memory use

  state: CLUSTER_STATE;//first register usage

  delayTimestamp: BigNumberish = 0;//first register usage
  delayBlockNumber: BigNumberish = 0;//first register usage

  constructor(deployer: string, admin: string, description: string, delayTimestamp: BigNumberish, delayBlockNumber: BigNumberish) {
    if(deployer)
      this.deployerList.push(deployer.toLowerCase());
    if(admin)
      this.adminList.push(admin.toLowerCase());
    this.description = description;
    this.delayTimestamp = delayTimestamp;
    this.delayBlockNumber = delayBlockNumber;
    this.state = CLUSTER_STATE.ENABLED;
  }

  addDeployerList(deployerList: string[]) {
    for(let i = 0;i < deployerList.length; ++i){
      this.deployerList.push(deployerList[i].toLowerCase());
    }
  }

  addAdminList(adminList: string[]) {
    for(let i = 0;i < adminList.length; ++i){
      this.adminList.push(adminList[i].toLowerCase());
    }
  }

  public addRule(rule: Rule) {
    rule.check();
    this.ruleList.push(rule);
  }

  public addRuleHandler(ruleSlotIndexInput: BigNumberish,
                        ruleSlotIndexOutput: BigNumberish,
                        totalCount: BigNumberish,
                        delayTimestamp: BigNumberish,
                        delayBlockNumber: BigNumberish,
                        clusterHandlerAreaAddress: string,
                        preHandlerList: string[],
                        processHandlerList: string[],
                        postHandlerList: string[]) {
    let rule: Rule = new Rule(ruleSlotIndexInput, ruleSlotIndexOutput, totalCount, delayTimestamp, delayBlockNumber);
    for (let i = 0; i < preHandlerList.length; ++i) {
      rule.addPreHandler(clusterHandlerAreaAddress, preHandlerList[i]);
    }

    for (let i = 0; i < processHandlerList.length; ++i) {
      rule.addProcessHandler(clusterHandlerAreaAddress, processHandlerList[i]);
    }

    for (let i = 0; i < postHandlerList.length; ++i) {
      rule.addPostHandler(clusterHandlerAreaAddress, postHandlerList[i]);
    }

    this.ruleList.push(rule);
  }

  public addRuleSlot(ruleSlot: RuleSlot) {
    if (ruleSlot.ruleSlotIndex <= this.contractMaxRuleSlotIndex) {
      throw Error("must ruleSlotIndex > contractMaxRuleSlotIndex");
    }

    let groupSlotIndexMap = new Map();
    for (let i = 0; i < ruleSlot.groupSlotList.length; ++i) {
      let branch = ruleSlot.groupSlotList[i].branch;
      if (branch) {
        let exist = groupSlotIndexMap.get(branch);
        if (!exist) {
          groupSlotIndexMap.set(branch, true);
        } else {
          throw Error("ruleSlotIndex " + ruleSlot.ruleSlotIndex + " groupSlot branch " + branch + " repeated");
        }
      }
    }
    this.ruleSlotList.push(ruleSlot);
  }

  public addAttribute(attr: Attribute) {
    for (let i = 0; i < this.attrList.length; ++i) {
      if (this.attrList[i].attrId == attr.attrId) {
        throw Error("attrId duplicate");
      }
    }
    this.attrList.push(attr);
    this.attrStateList.push(attr.state);
  }

  public async init() {
    log.debug("init cluster");
    //process ruleSlotList
    let ruleSlotIndexMap = new Map();
    let ruleSlotIndexArray = [];

    let ruleSlotList = [];
    for (let i = 0; i < this.ruleSlotList.length; ++i) {
      let ruleSlot = this.ruleSlotList[i];
      if (ruleSlot.ruleSlotIndex <= this.contractMaxRuleSlotIndex) {
        continue;
      }

      ruleSlotList.push(ruleSlot);

      let count = ruleSlotIndexMap.get(ruleSlot.ruleSlotIndex);
      if (count == undefined) {
        ruleSlotIndexMap.set(ruleSlot.ruleSlotIndex, 0);
        ruleSlotIndexArray.push(ruleSlot.ruleSlotIndex);
      } else {
        ruleSlotIndexMap.set(ruleSlot.ruleSlotIndex, count + 1);
        throw Error(ruleSlot.ruleSlotIndex + " ruleSlotIndex repeated!");
      }
    }

    if (ruleSlotIndexArray.length > 0) {
      ruleSlotIndexArray.sort(((a, b) => (a - b)));
      if (ruleSlotIndexArray[0] != this.contractMaxRuleSlotIndex + 1) {
        throw Error("ruleSlotIndex is not subsequent to the Contract rear ");
      }

      let span = ruleSlotIndexArray[ruleSlotIndexArray.length - 1] - ruleSlotIndexArray[0];
      if (span + 1 != ruleSlotIndexArray.length) {
        throw Error("ruleSlotList index not continuous");
      }
    }

    this.ruleSlotList = ruleSlotList;
    this.groupSlotList = [];
    this.ruleSlotBound = [];

    for (let n = 0; n < ruleSlotIndexArray.length; ++n) {
      let ruleSlotIndex = ruleSlotIndexArray[n];
      for (let i = 0; i < this.ruleSlotList.length; ++i) {
        let ruleSlot = this.ruleSlotList[i];
        if (ruleSlot.ruleSlotIndex == ruleSlotIndex) {
          this.groupSlotList.push(...ruleSlot.groupSlotList);

          let startBound = 0;
          if (this.ruleSlotBound.length > 0) {
            startBound = this.ruleSlotBound[this.ruleSlotBound.length - 1];
          }

          this.ruleSlotBound.push(startBound + ruleSlot.groupSlotList.length);
          break;
        }
      }
    }
    this.contractMaxRuleSlotIndex = this.contractMaxRuleSlotIndex + this.ruleSlotList.length;

    //init
    for (let i = 0; i < this.groupSlotList.length; ++i) {
      for (let j = 0; j < this.groupSlotList[i].tokenSlotList.length; ++j) {
        this.groupSlotList[i].tokenSlotList[j].bitEncode();
      }
    }

    let ruleList = [];
    for (let i = 0; i < this.ruleList.length; ++i) {
      let rule = this.ruleList[i];
      if (rule.fromContract != undefined && rule.fromContract) {
        continue;
      }
      this.ruleList[i].init();

      ruleList.push(rule);
    }
    this.ruleList = ruleList;
    //init unique handler

    for (let i = 0; i < this.ruleList.length; ++i) {
      let rule: Rule = this.ruleList[i];
      [{
        list: rule.preHandlerList,
        poolList: rule.preHandlerPoolList
      }, {
        list: rule.processHandlerList,
        poolList: rule.processHandlerPoolList
      }, {
        list: rule.postHandlerList,
        poolList: rule.postHandlerPoolList
      }].forEach(handler => {
        for (let i = 0; i < handler.list.length; ++i) {
          if (!this.handlerUniqueList.includes(handler.list[i])) {
            this.handlerUniqueList.push(handler.poolList[i]);
            this.handlerUniqueList.push(handler.list[i]);
          }
        }
      });
    }
  }

  public print() {
    log.debug();
    log.debug("cluster-json", JSON.stringify(this));
    log.debugln("cluster"
      , "deployerList", this.deployerList
      , "adminList", this.adminList
      , "description", this.description
      , "groupSlotList", this.groupSlotList.length
      , "ruleSlotBound", this.ruleSlotBound.length
      , "ruleList", this.ruleList.length
      , "ruleSlotList", this.ruleSlotList.length
      , "delayTimestamp", this.delayTimestamp
      , "delayBlockNumber", this.delayBlockNumber
      , "state", this.state, "(0 DISABLED 1 ENABLED 2 WAITING)");

    // rules
    for (let i = 0; i < this.ruleList.length; ++i) {
      let rule: Rule = this.ruleList[i];
      log.debugln(`rule ruleSlotIndex ${rule.ruleSlotIndexInput}->rule.ruleSlotIndexOutput`,
        "state(0 DISABLED 1 ENABLED 2 WAITING)", rule.state,
        "count", `${rule.leftCount}/${rule.totalCount}`,
        "durationType", rule.durationType,
        "delayTimestamp", rule.delayTimestamp,
        "delayBlockNumber", rule.delayBlockNumber);
      let handlers = [
        { type: "pre", list: rule.preHandlerList, poolList: rule.preHandlerPoolList },
        { type: "process", list: rule.processHandlerList, poolList: rule.processHandlerPoolList },
        { type: "post", list: rule.postHandlerList, poolList: rule.postHandlerPoolList }
      ];
      handlers.forEach(handler => {
        for (let j = 0; j < handler.list.length; ++j) {
          let _handler = this.handlerVersionNameMap.get(handler.list[j]);
          log.debug(`rule handler-${handler.type}-${j}`
            , "name", `${_handler.name}(${_handler.version.toString()})`
            , "address", handler.list[j]
            , "poolAddress", handler.poolList[j]);
        }
      });

      this.printRuleSlotIndex(rule.ruleSlotIndexInput);
      this.printRuleSlotIndex(rule.ruleSlotIndexOutput);
    }
  }

  public printRuleSlotIndex(ruleSlotIndex) {
    for (let i = 0; i < this.ruleSlotList.length; ++i) {
      let ruleSlot = this.ruleSlotList[i];
      if (ruleSlot.ruleSlotIndex == ruleSlotIndex) {
        for (let j = 0; j < ruleSlot.groupSlotList.length; ++j) {
          let groupSlot: GroupSlot = ruleSlot.groupSlotList[j];
          let ijStr = `ruleSlotIndex:${ruleSlot.ruleSlotIndex} groupSlot:${groupSlot.branch}`;
          log.debug(ijStr, "poolToken", groupSlot.poolToken, "args", groupSlot.argsValueList);
          for (let k = 0; k < groupSlot.tokenSlotList.length; ++k) {
            let tokenSlot: TokenSlot = groupSlot.tokenSlotList[k];
            let ijkStr = `ruleSlotIndex:${ruleSlot.ruleSlotIndex} groupSlot:${groupSlot.branch} tokenSlot:${k}`;
            log.debugln(ijkStr + "-tokenTemplate"
              , "desc", tokenSlot.tokenTemplate.desc()
              , "idRequired", tokenSlot.tokenTemplate.idRequired.toString()
              , "amountRequired", tokenSlot.tokenTemplate.amountRequired.toString());
            for (let n = 0; n < tokenSlot.tokenTemplate.attributeRangeList.length; ++n) {
              console.log(ijkStr, "--- tokenTemplate------attributeRangeList " + n, tokenSlot.tokenTemplate.attributeRangeList[n].desc());
            }
            for (let n = 0; n < tokenSlot.ioAddressList.length; ++n) {
              log.debugln(`ioAddress-${n},rule:${tokenSlot.rule} ruleSlotIndex:${ruleSlot.ruleSlotIndex} groupSlot:${groupSlot.branch} tokenSlot:${k} branch:${tokenSlot.branchList[n].toString()}`
                , "ioAddress", tokenSlot.ioAddressList[n]
                , "durationType", tokenSlot.durationTypeList[n].toString()
                , "durationBegin", tokenSlot.durationBeginList[n].toString()
                , "durationEnd", tokenSlot.durationEndList[n].toString()
                , "ioType", tokenSlot.ioTypeList[n].toString()
                , "business", tokenSlot.businessList[n].toString());
            }
          }
        }
        break;
      }
    }
  }

}
