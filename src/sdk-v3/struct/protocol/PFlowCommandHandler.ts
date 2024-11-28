//@ts-nocheck
import { PFlowCommandArg } from "./PFlowCommandArg";
import { Type } from "class-transformer";


export class PFlowCommandHandler {

  handler: string | undefined;//"0x6940d4e026d41d2310293B426370B0B19c906867",

  @Type(() => PFlowCommandArg)
  args:PFlowCommandArg[] = [];

}
