//@ts-nocheck
import { PFlowCommandArg } from "./PFlowCommandArg";
import { PFlowCommandHandler } from "./PFlowCommandHandler";
import { Type } from "class-transformer";


export class PState {

  name:string;//"State1",
  func:string;
  handlerName:string;//
  handlerAddress:string;
  branch:number;//0,
  taskId:number;//0,
  cmd:number;//0,
  args:PFlowCommandArg[];
  roundList:[];
  hashList:[];
  response:any;

}
