// @ts-nocheck
import { Signer } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import { Multicall } from "../../engine-typechain";
import MultiCallJson from "../../artifacts/contracts/V3/util/Multicall.sol/Multicall.json";

export class MultiFunc {
  instance: object;
  funName: string;
  funArgsList: [];

  constructor(instance: object, funName: string, funArgsList: []) {
    this.instance = instance;
    this.funName = funName;
    this.funArgsList = funArgsList;
  }
}

export class MultiCall {
  multiCall: Multicall;
  address: string;
  owner: Signer;

  hubChain: chainHub.Chain;
  hubContract: chainHub.Contract;

  constructor(owner: Signer) {
    this.owner = owner;
    this.hubChain = new chainHub.Chain("", [owner]);
    this.hubContract = new chainHub.Contract("");

    this.hubChain.jsonProvider = owner.provider
    this.hubContract.jsonProvider = owner.provider
  }

  public async load(multiCallAddress: string) {
    if (multiCallAddress == undefined || multiCallAddress == "") {
      this.multiCall = <Multicall>await this.hubContract.deployContractByAbiJson(this.owner, MultiCallJson, []);
      console.log("multiCall deploy at", this.multiCall.address);
    } else {
      this.multiCall = <Multicall>await this.hubContract.getContractByAbiJson(this.owner, multiCallAddress, MultiCallJson, { name: "MultiCall" });
    }
    this.address = this.multiCall.address;
  }

  public async call(funcList: MultiFunc[]) {
    if (funcList.length == 0) {
      return [];
    }

    let calls = [];
    for (let i = 0; i < funcList.length; ++i) {
      let instance = funcList[i].instance;
      let funName = funcList[i].funName;
      let funArgsList = funcList[i].funArgsList;
      let encode = instance.interface.encodeFunctionData(funName, funArgsList);
      calls.push({ target: instance.address, callData: encode });
    }
    let result = await this.multiCall.callStatic.aggregate(calls);

    let decodeList = [];
    for (let i = 0; i < result.returnData.length; ++i) {
      let instance = funcList[i].instance;
      let funName = funcList[i].funName;
      let funArgsList = funcList[i].funArgsList;
      let resDecode = instance.interface.decodeFunctionResult(funName, result.returnData[i]);

      decodeList.push(resDecode);
    }
    return decodeList;
  }

}
