/*
 * @Author: syf
 * @Date: 2024-11-27 16:14:04
 * @LastEditors: syf
 * @LastEditTime: 2024-11-27 16:46:43
 * @Description: 
 * @FilePath: /engine-handler-example/src/sdk-v3/handler/load/LAllocateHandler.ts
 */
//@ts-nocheck
import { BaseHandler } from "../BaseHandler";

import { Message, Rule, RuleSlot } from "../../struct";
import { AllocateHandler, AllocateHandler__factory } from "../../../../typechain/";
import { getLogger, ILogger } from "../../util";
import { Signer } from "ethers";
import { Engine } from "../../Engine";

let log: ILogger = getLogger();

export class LAllocateHandler extends BaseHandler {

  constructor(owner: Signer, engine: Engine, folder: string) {
    super(owner, engine, folder);
    this.name = "AllocateHandler";
  }

  /**
   *
   * @param address : proxy address
   */
  public async load(address?: string): LAllocateHandler {

    this.handler = <AllocateHandler>await AllocateHandler__factory.connect(address, this.owner);
    this.address = address;
    this.folder = "";

    return this;
  }

  public async checkCluster(event: string, rule: Rule, ruleSlotInput: RuleSlot, ruleSlotOutput: RuleSlot): Message[] {

    console.log("------ LAllocateHandler checkCluster");
    return [];
  }

}
