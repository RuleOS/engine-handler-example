/*
 * @Author: syf
 * @Date: 2024-11-25 19:54:38
 * @LastEditors: syf
 * @LastEditTime: 2024-11-27 10:52:03
 * @Description: 
 * @FilePath: /engine-handler-example/src/sdk-v3/handler/TRedPacketHandler.ts
 */
//@ts-nocheck
import { BaseHandler } from "./BaseHandler";

import { Contract } from "../../chain/contract";
import { HANDLER_STATE } from "../struct";
import {
  ProxyIntakeAdmin
} from "../../../engine-typechain";
import { getLogger, ILogger } from "../util";
import {BytesLike, Signer, utils} from "ethers";
import { Engine } from "../Engine";
import {ProxyIntake} from "../../../engine-typechain";
import {LRedPacketHandler} from "./load/LRedPacketHandler";
import {RedPacketHandler} from "../../../typechain/RedPacketHandler";
let log: ILogger = getLogger();

export class TRedPacketHandler extends LRedPacketHandler{

  constructor(owner:Signer,engine:Engine,folder:string) {
    super(owner,engine,folder);
    this.name = "RedPacketHandler";
    this.folder = folder;
  }

  public async load(folder?:string):TRedPacketHandler{
    if(!folder){
      folder = this.folder;
    }

    let chainId = await this.owner.getChainId();
    let handlerProxy = <RedPacketHandler>await Contract.getByDeployment(chainId, "RedPacketHandler", this.owner, { folder: folder }, true);
    console.log("load redPacket handler",handlerProxy.address)
    this.handler = handlerProxy;
    this.address = handlerProxy.address;

    return this;
  }

  /**
   *
   * @param folder
   * @param override rewrite deployment file in folder
   * @param overrides gasLimit
   */
  public async deploy(folder?:string,override?:boolean,overrides?:{}):TRedPacketHandler{
    if(!folder){
      folder = this.folder;
    }

    if(!overrides){
      overrides = this.overrides();
    }
    let redPacketHandler=<RedPacketHandler>await Contract.deployProxy("RedPacketHandler", this.owner, [overrides], { folder: folder, override: override },this.engine.proxyIntakeAdmin.address);

    let tx = await this.engine.clusterHandlerArea.add("RedPacket", "RedPacket", redPacketHandler.address, overrides);
    await tx.wait();
    tx = await this.engine.clusterHandlerArea.updateState(redPacketHandler.address, HANDLER_STATE.ACCEPTED);
    await tx.wait();
    await redPacketHandler.setEngineAreaList(this.engine.getEngineAreaList());
    let hs = (await this.engine.clusterHandlerArea.get(redPacketHandler.address));
    log.debug("add RedPacketHandler", "state", hs[1].state);

    this.handler = redPacketHandler;
    this.address = redPacketHandler.address;
    console.log("RedPacketHandler address:"+redPacketHandler.address)
    return this;
  }

  public async upgrade(folder?: string = undefined) {
    if(!folder){
      folder = this.folder;
    }

    let chainId = await this.owner.getChainId();
    let overrides = { gasLimit: 8000000 };
    let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", this.owner, { folder: folder }));

    let handlerProxy = <ProxyIntake>(await Contract.getByDeployment(chainId, "RedPacketHandler", this.owner, { folder: folder }, true));
    let redPacketHandler=<RedPacketHandler>await Contract.deploy("RedPacketHandler", this.owner, [overrides], { folder: folder, override: override });

    await handlerProxy.setEngineAreaList(this.engine.getEngineAreaList());


    let tx = await proxyIntakeAdmin.upgradeTo(handlerProxy.address, redPacketHandler.address);
    await tx.wait();

  }



}
