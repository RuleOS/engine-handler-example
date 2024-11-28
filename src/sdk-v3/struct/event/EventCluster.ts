// @ts-nocheck

import { BigNumberish, ContractReceipt } from "ethers";
import { EVENT_CLUSTER } from "../Constant";
import { getLogger, ILogger } from "../../util/Log";
import { Event } from "./Event";

let log: ILogger = getLogger();

export class EventCluster extends Event{
  name: string = "EventCluster";
  caller: string;
  regType: EVENT_CLUSTER;
  clusterId: BigNumberish;
  ruleSlotIndex1: BigNumberish;
  ruleSlotIndex2: BigNumberish;

  copy(event) {
    let obj = event;
    if (event.eventLog)
      obj = event.eventLog;

    this.caller = obj.caller;
    this.regType = EVENT_CLUSTER[obj.regType];
    this.clusterId = obj.clusterId;
    this.ruleSlotIndex1 = obj.ruleSlotIndex1;
    this.ruleSlotIndex2 = obj.ruleSlotIndex2;
  }

  public printEvent(name) {
    log.info(`event-${name}-EventCluster`,
      "caller", this.caller,
      "regType", this.regType,
      "clusterId", this.clusterId,
      "ruleSlotIndex1", this.ruleSlotIndex1,
      "ruleSlotIndex2", this.ruleSlotIndex2
    );
  }
}
