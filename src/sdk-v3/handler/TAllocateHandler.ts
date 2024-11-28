//@ts-nocheck
import { Contract } from "../../chain/contract";
import { HANDLER_STATE } from "../struct";
import { AllocateHandler, IHandler, ProxyIntakeAdmin } from "../../../engine-typechain";
import { getLogger, ILogger } from "../util";
import { Signer } from "ethers";
import { Engine } from "../Engine";
import { LAllocateHandler } from "./load";

let log: ILogger = getLogger();

export class TAllocateHandler extends LAllocateHandler {

  constructor(owner: Signer, engine: Engine, folder: string) {
    super(owner, engine, folder);
    this.name = "AllocateHandler";
  }

  public async load(folder?: string): TAllocateHandler {
    if (!folder) {
      folder = this.folder;
    }

    let chainId = await this.owner.getChainId();
    let handlerProxy = <AllocateHandler>await Contract.getByDeployment(chainId, "AllocateHandler", this.owner, { folder: folder }, true);
    this.handler = handlerProxy;
    this.address = handlerProxy.address;
    this.folder = folder;

    return this;
  }


  /**
   *
   * @param folder
   * @param override rewrite deployment file in folder
   * @param overrides gasLimit
   */
  public async deploy(folder?: string, override?: boolean, overrides?: {}): TAllocateHandler {
    if (!folder) {
      folder = this.folder;
    }

    if (!overrides) {
      overrides = this.overrides();
    }

    let handlerLib = await Contract.deploy("AllocateHandlerLib", this.owner, [overrides], { folder: folder, override: override });

    let handlerProxy = <IHandler>await Contract.deployProxyWithLib(
      "AllocateHandler",
      {
        "contracts/V3/handler/AllocateHandlerLib.sol:AllocateHandlerLib": handlerLib.address
      },
      this.owner,
      [overrides],
      { folder: folder, override: override },
      this.engine.proxyIntakeAdmin.address);

    await handlerProxy.setEngineAreaList(this.engine.getEngineAreaList());

    let tx = await this.engine.clusterHandlerArea.add("Allocate", "Allocate", handlerProxy.address, overrides);
    await tx.wait();
    tx = await this.engine.clusterHandlerArea.updateState(handlerProxy.address, HANDLER_STATE.ACCEPTED);
    await tx.wait();
    let hs = await this.engine.clusterHandlerArea.get(handlerProxy.address);
    log.debug("add allocateHandler", "state", hs[1].state);

    this.handler = handlerProxy;
    this.address = handlerProxy.address;

    return this;
  }

  public async upgrade(folder?: string = undefined) {
    if (!folder) {
      folder = this.folder;
    }

    let chainId = await this.owner.getChainId();
    let overrides = { gasLimit: 8000000 };
    let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", this.owner, { folder: folder }));
    let allocateHandlerProxy = <ProxyIntake>(await Contract.getByDeployment(chainId, "AllocateHandler", this.owner, { folder: folder }, true));

    let allocateHandlerLib = <AllocateHandlerLib>await Contract.deploy("AllocateHandlerLib", this.owner, [overrides], { folder: folder });
    let allocateHandler = <AllocateHandler>await Contract.deployWithLib("AllocateHandler",
      {
        "contracts/V3/handler/AllocateHandlerLib.sol:AllocateHandlerLib": allocateHandlerLib.address
      },
      this.owner, [overrides], { folder: folder });

    log.debug("----------------------------- allocateHandlerProxy before impl", await proxyIntakeAdmin.getProxyImplementation(allocateHandlerProxy.address), "owner", await proxyIntakeAdmin.owner());

    let tx = await proxyIntakeAdmin.upgradeTo(allocateHandlerProxy.address, allocateHandler.address);
    await tx.wait();

    log.debug("----------------------------- allocateHandlerProxy after impl", await proxyIntakeAdmin.getProxyImplementation(allocateHandlerProxy.address), "owner", await proxyIntakeAdmin.owner());
    return allocateHandler.address;
  }

}
