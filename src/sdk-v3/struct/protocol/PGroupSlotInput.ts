//@ts-nocheck
import { BigNumberish } from "ethers";
import { plainToInstance, Type } from "class-transformer";
import { GroupSlot } from "..";
import { PHandler, PTokenSlot } from ".";
import "reflect-metadata";

export class PGroupSlotInput {
  branch: BigNumberish;// 1,
  @Type(() => PHandler)
  handlerList: PHandler[] = [];
  poolToken: string;// "0x187bdf2f44896e7E2678902Ba32819Bd84bBf9D8",

  @Type(() => PTokenSlot)
  tokenSlotList: PTokenSlot[] = [];

  public toGroupSlot(): GroupSlot {
    let groupSlot = plainToInstance(GroupSlot, this);
    groupSlot.handlerList = [];
    groupSlot.argsList = [];
    this.handlerList.forEach(handler => handler.convert(groupSlot.handlerList, groupSlot.argsList));
    groupSlot.tokenSlotList = this.tokenSlotList.map(pTokenSlot => pTokenSlot.toTokenSlot());
    return groupSlot;
  }
}
