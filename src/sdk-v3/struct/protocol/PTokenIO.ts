//@ts-nocheck

import { BigNumberish } from "ethers";
import { AttributeRange, TokenSlot } from "..";

export class PTokenIO {
  durationType: BigNumberish;// 0,
  durationBegin: BigNumberish;// 0,
  durationEnd: BigNumberish;// 0,
  ioType: BigNumberish;// 0,
  ioAddress: string;// "0x0000000000000000000000000000000000000002",
  business: BigNumberish;// 1,
  mountingTokenSlotIndex: BigNumberish;// 0,
  allocationId: BigNumberish;// 0,
  attributeRangeList: AttributeRange[] = [];

  public toTokenSlotBranch(tokenSlot: TokenSlot, branch: BigNumberish) {
    if (this.ioType == undefined) {
      return;
    }
    tokenSlot.addBranch(this.ioAddress, this.durationType, branch, this.ioType);
    tokenSlot.addDuration(this.durationBegin, this.durationEnd);
    tokenSlot.addBusiness(this.business);
    tokenSlot.addMountingTokenSlotIndex(this.mountingTokenSlotIndex);
    tokenSlot.addAttributeRangeList(this.attributeRangeList);
    tokenSlot.addAllocationId(this.allocationId);
  }
}
