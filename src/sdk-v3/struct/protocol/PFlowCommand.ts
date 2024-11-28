//@ts-nocheck
import { PFlowCommandArg } from "./PFlowCommandArg";
import { PFlowCommandHandler } from "./PFlowCommandHandler";
import { Type } from "class-transformer";

export enum PFlowCommandControl {
  Out=-1,
  Ignore=0
}

export enum PFlowCommandType {
  Input="input",
  Execute="execute",
  Claim="claim"
}

export class PFlowCommand {

  command:PFlowCommandType;//"input",
  branch:number;// 1,
  taskId:PFlowCommandControl;// 0,//-1

  @Type(() => PFlowCommandArg)
  multiple: PFlowCommandArg;

  @Type(() => PFlowCommandHandler)
  handlerList:PFlowCommandHandler[] = [];

}
