// @ts-nocheck

import { BigNumberish, BytesLike } from "ethers";
import { TokenSlot } from "./TokenSlot";
import { TokenTemplate } from "./TokenTemplate";
import { SDK_CHECK } from "./Constant";
import { Helper } from "../util";

export class GroupSlot {
  tokenSlotList: TokenSlot[] = [];

  branch: BigNumberish;
  poolToken: string;

  handlerList: string[] = [];
  argsList: BytesLike[] = [];
  argsValueList: object[] = [];

  id: number;//flag to which groupSlot[]

  constructor(poolToken: string, branch: BigNumberish, handlerList: [] = [], argsList: BytesLike[] = []) {
    this.branch = branch;
    this.poolToken = poolToken;
    this.handlerList = handlerList;
    this.argsList = argsList;
  }

  addArgs(handler: string, args: any) {
    this.handlerList.push(handler);
    this.argsList.push(Helper.rlp(args));
  }

  async copyFromContract(groupSlot: GroupSlot) {
    this.branch = groupSlot.branch;
    this.poolToken = groupSlot.poolToken;
    this.args = groupSlot.args;
    this.id = groupSlot.id;
    for (let i = 0; i < groupSlot.tokenSlotList.length; ++i) {
      let tokenSlot = new TokenSlot();
      await tokenSlot.copyFromContract(groupSlot.tokenSlotList[i]);
      this.tokenSlotList.push(tokenSlot);
    }
  }

  public addTokenSlot(tokenSlot: TokenSlot) {
    this.tokenSlotList.push(tokenSlot);
  }

  public addTokenSlotInBranch(tokenTemplate: TokenTemplate, ioAddress: string, branch: BigNumberish, durationBegin: BigNumberish, durationEnd: BigNumberish) {
    let tokenSlot: TokenSlot = new TokenSlot(tokenTemplate);
    tokenSlot.addBranchTimestamp(ioAddress, branch, durationBegin, durationEnd);
    this.tokenSlotList.push(tokenSlot);
  }

}
