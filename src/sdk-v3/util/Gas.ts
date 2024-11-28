// @ts-nocheck
import { ContractReceipt, Signer } from "ethers";
import { Helper } from "./Helper";
import * as chainHub from "@ruleos/chain-hub";
import { getLogger, ILogger } from "./Log";

let BN = chainHub.Util.BN;
let log: ILogger = getLogger();

export class Gas {

  public static async estimateGasTx(user: Signer, contractInstance: any, funcName: string, args: [], overrides: {}) {
    let estimateGas = overrides.gasLimit;
    try {
      estimateGas = await contractInstance.connect(user).estimateGas[funcName](...args, overrides);
      overrides.gasLimit = estimateGas;
    } catch (e) {
      log.error("estimateGasTx fail", funcName);
    }

    return await contractInstance.connect(user)[funcName](...args, overrides);
  }

  public static async estimateGasTxReceipt(user: Signer, contractInstance: any, funcName: string, args: [], overrides: {}):Promise<ContractReceipt> {
    let estimateGas = overrides.gasLimit;
    let callData = contractInstance.interface.encodeFunctionData(funcName, [ ...args ])

    let tx = await contractInstance.connect(user)[funcName](...args, overrides);
    let txReceipt:ContractReceipt = await tx.wait();
    Helper.printTx(funcName, txReceipt, estimateGas);
    return txReceipt;
  }

}
