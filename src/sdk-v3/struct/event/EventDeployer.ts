// @ts-nocheck

import { BigNumberish, ContractReceipt } from "ethers";
import { getLogger, ILogger } from "../../util/Log";
import { Event } from "./Event";

let log: ILogger = getLogger();

export class EventDeployer extends Event{
  name: string = "EventDeployer";
  contractAddress: string;
  deployer: string;
  deployerNonce: BigNumberish;
  caller: string;

  copy(event) {
    let obj = event;
    if (event.eventLog)
      obj = event.eventLog;

    this.contractAddress = obj.contractAddress;
    this.deployer = obj.deployer;
    this.deployerNonce = obj.deployerNonce;
    this.caller = obj.caller;
  }

  public printEvent(name) {
    log.info(`event-${name}-EventDeployer`,
      "caller", this.caller,
      "contractAddress", this.contractAddress,
      "deployer", this.deployer,
      "deployerNonce", this.deployerNonce.toString()
    );
  }
}
