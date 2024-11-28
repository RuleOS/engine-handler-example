//@ts-nocheck
import { PGroupSlotInput } from ".";
import { Type } from "class-transformer";
import { GroupSlot } from "..";
import "reflect-metadata";

export class PGroupSlotOutput extends PGroupSlotInput {
  @Type(() => PGroupSlotInput)
  groupSlotListInput: PGroupSlotInput[] = [];

  public toGroupSlot(): GroupSlot {
    let groupSlot = super.toGroupSlot();
    delete groupSlot.groupSlotListInput;
    return groupSlot;
  }
}
