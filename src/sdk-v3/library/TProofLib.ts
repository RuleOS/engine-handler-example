/*
 * @Author: syf
 * @Date: 2024-11-25 17:15:16
 * @LastEditors: syf
 * @LastEditTime: 2024-11-27 16:07:14
 * @Description: 
 * @FilePath: /engine-handler-example/src/sdk-v3/library/TProofLib.ts
 */
//@ts-nocheck
import { Contract } from "../../chain/contract";
import { ProxyIntakeAdmin } from "../../../engine-typechain";
import { getLogger, ILogger } from "../util";
import { Signer } from "ethers";
import { Engine } from "../Engine";
import { BaseLib } from "./BaseLib";
import { ProofLib } from  "../../../engine-typechain";

let log: ILogger = getLogger();

export class TProofLib extends BaseLib{

  constructor(owner: Signer, engine: Engine, folder: string) {
    super(owner, engine, folder);
    this.name = "ProofLib";
  }

  public async load(folder?: string): TProofLib {
    if (!folder) {
      folder = this.folder;
    }

    let chainId = await this.owner.getChainId();
    let handlerProxy = <ProofLib>await Contract.getByDeployment(chainId, "ProofLib", this.owner, { folder: folder }, true);
    this.lib = handlerProxy;
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
  public async deploy(folder?: string, override?: boolean, overrides?: {}): TProofLib {
    if (!folder) {
      folder = this.folder;
    }

    if (!overrides) {
      overrides = this.overrides();
    }

    let libProxy = await Contract.deployProxyWithLib(
      "ProofLib",
      {
      },
      this.owner,
      [overrides],
      { folder: folder, override: override },

      this.engine.proxyIntakeAdmin.address);


    this.lib = libProxy;
    this.address = libProxy.address;

    return this;
  }

  public async upgrade(folder?: string = undefined) {
    if (!folder) {
      folder = this.folder;
    }

    let chainId = await this.owner.getChainId();
    let overrides = { gasLimit: 8000000 };
    let proxyIntakeAdmin = <ProxyIntakeAdmin>(await Contract.getByDeployment(chainId, "ProxyIntakeAdmin", this.owner, { folder: folder }));
    let proofLibProxy = <ProxyIntake>(await Contract.getByDeployment(chainId, "ProofLib", this.owner, { folder: folder }, true));

    let proofLib = <ProofLib>await Contract.deployWithLib("ProofLib",
      {
      },
      this.owner, [overrides], { folder: folder });

    log.debug("----------------------------- proofLibProxy before impl", await proxyIntakeAdmin.getProxyImplementation(proofLibProxy.address), "owner", await proxyIntakeAdmin.owner());

    let tx = await proxyIntakeAdmin.upgradeTo(proofLibProxy.address, proofLib.address);
    await tx.wait();

    log.debug("----------------------------- proofLibProxy after impl", await proxyIntakeAdmin.getProxyImplementation(proofLibProxy.address), "owner", await proxyIntakeAdmin.owner());
    return allocateHandler.address;
  }

}
