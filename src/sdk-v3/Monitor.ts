// @ts-nocheck
import { Signer, utils } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import { Tx } from "@ruleos/chain-hub";
import { IEngine } from "../../engine-typechain";
import { MONITOR_TYPE } from "./struct/Constant";
import { Token } from "./struct/Token";
import { Engine, IClusterAreaJson, IEngineJson } from "./Engine";
import { writeFile } from "../../task/file";

export class Monitor {

  network: string;
  chainId: number;

  owner: Signer;
  hubChain: chainHub.Chain;
  hubContract: chainHub.Contract;

  address: string;
  engine: Engine;

  constructor() {
  }

  static async create(owner: Signer, engine: IEngine) {
    let monitor = new Monitor();
    monitor.owner = owner;

    monitor.network = await monitor.owner.provider.connection.url;
    monitor.chainId = await monitor.owner.getChainId();

    monitor.hubChain = new chainHub.Chain(monitor.network);
    monitor.hubContract = new chainHub.Contract(monitor.network);

    monitor.engine = engine;
    return monitor;
  }

  async genFunCode(folder) {

    let instanceList = [
      this.engine.engine, "engine",
      this.engine.clusterArea, "clusterArea",
      this.engine.stateCounter, "stateCounter",
      this.engine.clusterHandlerArea, "clusterHandlerArea",
      this.engine.erc20, "erc20",
      this.engine.erc1155, "erc1155",
      this.engine.erc721, "erc721"
    ];

    let res = {};

    for (let s = 0; s < instanceList.length; s += 2) {
      let map = new Map();
      for (let i = 0; i < instanceList[s].interface.fragments.length; ++i) {
        let funFrament = instanceList[s].interface.fragments[i];
        let funcDesc = funFrament.format();
        let code = utils.keccak256(utils.toUtf8Bytes(funcDesc));
        map.set(funcDesc, code);
      }
      res[instanceList[s + 1]] = Object.fromEntries(map);
    }

    writeFile(this.chainId, folder, "_FuncEncode", res);

  }

  async txListDecode(type: number, hashList: []) {
    for (let i = 0; i < hashList.length; ++i) {
      console.log("----- hash", i);
      try {
        await this.txDecode(type, hashList[i]);
      } catch (e) {

      }

    }
  }

  async txDecode(type: number, hash: string) {

    let abiJson = {};
    if (type == MONITOR_TYPE.ENGINE) {
      abiJson = IEngineJson;
    } else if (type == MONITOR_TYPE.CLUSTER) {
      abiJson = IClusterAreaJson;
    }

    let txSum = await Tx.getTx(this.network, this.owner, abiJson, hash, true);
    let tx = txSum[0];
    let receipt = txSum[1];

    console.log();
    console.log("----- engineTx");
    console.log("----- hash", tx.hash);
    console.log("----- from", tx.from, "to", tx.to, "value", tx.value.toString(), "nonce", tx.nonce, "blockNumber", receipt.blockNumber);
    console.log("----- gasPrice", tx.gasPriceValue, "gasLimit", tx.gasLimitValue, "gasUsed", receipt.gasUsed.toString());

    console.log("----- inputMethod", tx.inputMethod);
    console.log("----- inputArgs", JSON.stringify(tx.inputArgs));

    if (tx.inputArgs.inTokenList != undefined) {
      for (let i = 0; i < tx.inputArgs.inTokenList.length; ++i) {
        let inToken = tx.inputArgs.inTokenList[i];
        let token: Token = Token.newERC(inToken[0], inToken[1], inToken[2], inToken[3]);
        console.log("----- inToken ", token.desc());
      }
    }

    for (let i = 0; i < receipt.logs.length; ++i) {
      let log = receipt.logs[i];
      console.log("----- event", log.address, JSON.stringify(log.eventDecode));
      // console.log("----- event",log.event);
    }

    console.log();

    return tx;
  }


}
