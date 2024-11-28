/*
 * @Author: syf
 * @Date: 2024-11-25 17:15:16
 * @LastEditors: syf
 * @LastEditTime: 2024-11-26 16:32:30
 * @Description: 
 * @FilePath: /engine-handler-example/src/sdk-v3/struct/protocol/PFlow.ts
 */
//@ts-nocheck
import { PFlowCommand } from "./PFlowCommand";
import { Type } from "class-transformer";

export class PFlow {

  name:string | undefined;

  @Type(() => PFlowCommand)
  commandList: PFlowCommand[] = [];

}
