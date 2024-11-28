// @ts-nocheck

import { BigNumberish } from "ethers";
import { ERC } from "../Constant";
import { getLogger, ILogger } from "../../util/Log";
import { Event } from "./Event";

let log: ILogger = getLogger();


export const TransferEventList = ["Transfer", "TransferSingle", "TransferBatch"];

export let filterTransferEvent = function(receipt) {

};

export class EventTransfer extends Event{
  name: string = "EventTransfer";
  from: string;//burn
  to: string;//mint

  token: string;
  erc: number;
  id: BigNumberish;
  amount: BigNumberish;

  constructor(token: string, erc: number, from: string, to: string, id: BigNumberish, amount: BigNumberish) {
    super();
    this.token = token;
    this.erc = erc;
    this.from = from;
    this.to = to;
    this.id = id;
    this.amount = amount;
  }

  copy(event) {
    this.name = event.name;
    this.erc = event.erc;
    this.from = event.from;
    this.to = event.to;
    this.id = event.id;
    this.amount = event.amount;
  }

  public printEvent(name) {
    log.info(`event-${name}-EventTransfer`,
      "token", this.token,
      "erc", ERC[this.erc],
      "from", this.from,
      "to", this.to,
      "id", this.id.toString(),
      "amount", this.amount.toString()
    );
  }
}
