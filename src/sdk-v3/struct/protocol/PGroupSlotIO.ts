//@ts-nocheck

import { PGroupSlotInput, PGroupSlotOutput } from ".";
import { Type } from "class-transformer";
import { GroupSlot, Rule } from "..";

export class PGroupSlotIO {

  @Type(() => PGroupSlotInput)
  groupSlotListInput: PGroupSlotInput[] = [];

  @Type(() => PGroupSlotOutput)
  groupSlotListOutput: PGroupSlotOutput[] = [];

  public toGroupSlot(rule: Rule) {
    this.toInputGroupSlotList(rule);
    this.toOutputGroupSlotList(rule);
  }

  public toInputGroupSlotList(rule: Rule): void {
    this.groupSlotListInput.forEach(pGroupSlot => {
      if (!rule._inputGroupSlotMap.get(pGroupSlot.branch)) {
        rule._inputGroupSlotMap.set(pGroupSlot.branch, pGroupSlot.toGroupSlot());
      }
    });
  }

  public toOutputGroupSlotList(rule: Rule): void {
    this.groupSlotListOutput.forEach(pGroupSlot => {
      let outBranch = pGroupSlot.branch;
      if (!rule._outGroupSlotMap.get(outBranch)) {
        rule._outGroupSlotMap.set(outBranch, pGroupSlot.toGroupSlot());
      }

      for (let i = 0; i < pGroupSlot.groupSlotListInput.length; i++) {
        let inputGroupSlot = <GroupSlot>rule._inputGroupSlotMap.get(this.groupSlotListInput[i].branch);
        if (inputGroupSlot.tokenSlotList?.length > 0 && !inputGroupSlot.tokenSlotList[0].branchList.includes(outBranch)) {
          let pGroupSlotInput = pGroupSlot.groupSlotListInput[i];
          for (let j = 0; j < pGroupSlotInput.tokenSlotList.length; j++) {
            let pTokenSlot = pGroupSlotInput.tokenSlotList[j];
            pTokenSlot.tokenIO.toTokenSlotBranch(inputGroupSlot.tokenSlotList[j], outBranch);
          }
        }
      }
    });
  }
}
