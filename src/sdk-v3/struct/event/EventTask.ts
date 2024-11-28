// @ts-nocheck

import { BigNumberish } from "ethers";
import { TASK_STATE } from "../Constant";
import { EventTransfer } from "./EventTransfer";
import { getLogger, ILogger } from "../../util";
import { Event } from "./Event";

let log: ILogger = getLogger();

export class EventTask extends Event{
  name: string = "EventTask";
  hash: string;
  caller: string;
  clusterArea: string;
  clusterId: BigNumberish;
  stateCounter: string;
  taskId: BigNumberish;
  taskState: BigNumberish;
  round: BigNumberish;
  ioBranch: BigNumberish;//input or output groupSlotBranch

  eventTransferList: EventTransfer[] = [];

  copy(event) {
    let obj = event;
    if (event.eventLog)
      obj = event.eventLog;

    this.caller = obj.caller;
    this.clusterArea = obj.clusterArea;
    this.clusterId = obj.clusterId;
    this.stateCounter = obj.stateCounter;
    this.taskId = obj.taskId;
    this.taskState = obj.taskState;
    this.round = obj.round;
    this.ioBranch = obj.ioBranch;
  }

  public printEvent(name) {
    log.info(`event-${name}-EventTask`,
      "caller", this.caller,
      "clusterArea", this.clusterArea,
      "clusterId", this.clusterId,
      "stateCounter", this.stateCounter,
      "taskId", this.taskId,
      "taskState", TASK_STATE[this.taskState],
      "round", this.round,
      this.taskState != TASK_STATE.CLAIMED ? "inputBranch" : "outputBranch", this.ioBranch
    );

    for (let i = 0; i < this.eventTransferList.length; ++i) {
      this.eventTransferList[i].printEvent(name);
    }
  }
}
