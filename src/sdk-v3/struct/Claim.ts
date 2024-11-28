// @ts-nocheck


import { BigNumberish } from "ethers";

export class Claim {

  engine:string;
  clusterArea:string;
  clusterId:BigNumberish;
  stateCounter:string;
  taskId:BigNumberish;
  claimer:string;
  io:BigNumberish;
  round:BigNumberish;
  branch:BigNumberish;
  tokenSlotIndex:BigNumberish;

}


export class ClaimIOState {
  claimedAdded:number = 0;
  checked:number = 0;
  unclaimed:number = 0;
  claimed:number = 0;
  claimable:number = 0;
  timeout:number = 0;
  exception:number = 0;
  total:number = 0;
}

export class ClaimIO {
  taskId:number;
  parentTaskId:number;

  tokenInputCount:ClaimIOState = new ClaimIOState();
  tokenOutputCount:ClaimIOState = new ClaimIOState();

  round:number;
  outputGroupSlotBranch:number;
  inputTokenList: [];
  outputTokenList: [];
}
