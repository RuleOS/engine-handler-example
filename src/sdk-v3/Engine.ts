// @ts-nocheck
import { BigNumber, BigNumberish, BytesLike, Signer, utils } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import {
  AllocateHandler,
  AllocateLayerHandler,
  AllocateLimitHandler,
  EngineView,
  IClusterArea,
  IClusterArea__factory,
  IClusterAttributeArea,
  IClusterAttributeArea__factory,
  IClusterAttributeAreaToken,
  IClusterAttributeAreaToken__factory,
  IClusterHandlerArea,
  IClusterHandlerArea__factory,
  IClusterMountingArea,
  IClusterMountingArea__factory,
  IClusterRuleArea,
  IClusterRuleArea__factory,
  IClusterRuleAreaHandler,
  IClusterRuleAreaHandler__factory,
  IEngine,
  IEngine__factory,
  IEngineView__factory,
  IERC1155,
  IERC1155__factory,
  IERC20,
  IERC20__factory,
  IERC721,
  IERC721__factory,
  IHandler,
  IHandler__factory,
  IStateCounter,
  IStateCounter__factory,
  MineHandler,
  PoolContract,
  PoolContract__factory,
  PoolFee,
  PoolToken,
  PoolToken__factory,
  ProxyIntakeAdmin,
  ProxyIntakeAdmin__factory,
  RandomGenerator,
  RandomGenerator__factory,
  RestrictHandler,
  WhiteListHandler
} from "../../engine-typechain";
import * as engineCheck from "./EngineCheck";
import {
  APPROVE,
  Attribute,
  ATTRIBUTE_SUB_SUM_MODE,
  AttributeOpt,
  AttributeOptState,
  Claim,
  CLAIM_STATE,
  ClaimIO,
  Cluster,
  ERC,
  EventCluster,
  EventDeployer,
  EventTask,
  EventTransfer,
  GroupSlot,
  IO,
  MessageListInput,
  Rule,
  RULE_STATE,
  RuleSlot,
  SDK_CHECK,
  SELF_ADDRESS,
  Task,
  TASK_STATE,
  Token,
  TOKEN_TEMPLATE_AMOUNT_REQUIRED,
  TOKEN_TEMPLATE_ID_REQUIRED,
  TOKEN_TEMPLATE_TYPE,
  TokenAttributeList,
  TokenMounting,
  TokenSlot,
  TokenTemplate,
  ZERO_ADDRESS
} from "./struct";
import { Gas, getLogger, Helper, ILogger, RLP } from "./util";
import { MultiCall, MultiFunc } from "./MultiCall";
import { EngineUtil } from "./EngineUtil";
import { Handler, HandlerState } from "./Handler";
import { Event } from "./struct/event/Event";

let rlp = require("rlp");
let BN = chainHub.Util.BN;
let D18 = chainHub.Util.D18;
let log: ILogger = getLogger();

export interface Callback {
  (name: string, state: number, event: string): void;
}

export class Engine {
  owner: Signer;
  network: string;
  chainId: number;

  hubChain: chainHub.Chain;
  hubContract: chainHub.Contract;

  erc20: IERC20;
  erc721: IERC721;
  erc1155: IERC1155;

  address: string;
  engine: IEngine;
  engineView: EngineView;
  clusterHandlerArea: IClusterHandlerArea;
  clusterArea: IClusterArea;
  clusterRuleArea: IClusterRuleArea;
  clusterRuleAreaHandler: IClusterRuleAreaHandler;
  clusterAttributeArea: IClusterAttributeArea;
  clusterAttributeAreaToken: IClusterAttributeAreaToken;
  clusterMountingArea: IClusterMountingArea;
  stateCounter: IStateCounter;
  poolFee: PoolFee;

  proxyIntakeAdmin: ProxyIntakeAdmin;

  poolTokenInput: PoolToken;//temp poolToken
  poolTokenMint: PoolToken;//system mint
  poolTokenTransfer: PoolToken;//system transfer
  poolContract: PoolContract;
  randomGenerator: RandomGenerator;

  handler:Handler;

  multiCall: MultiCall;

  constructor(owner: Signer) {
    this.owner = owner;
    this.handler = new Handler(this.owner,this);
  }

  public async load(proxyIntakeAdminAddress: string,
                    clusterHandlerAreaProxyAddress: string,
                    clusterAreaProxyAddress: string,
                    clusterRuleAreaProxyAddress: string,
                    clusterRuleAreaHandlerProxyAddress: string,
                    clusterAttributeAreaProxyAddress: string,
                    clusterAttributeAreaTokenProxyAddress: string,
                    clusterMountingAreaProxyAddress: string,
                    stateCounterProxyAddress: string,
                    poolFeeProxyAddress: string,
                    engineProxyAddress: string,
                    engineViewAddress: string,
                    poolContractAddress: string,
                    randomGeneratorAddress: string,
                    poolTokenInputAddress: string,
                    poolTokenMintAddress: string,
                    poolTokenTransferAddress: string) {

    this.network = "";
    this.chainId = await this.owner.getChainId();

    this.hubChain = new chainHub.Chain(this.network, [this.owner]);
    this.hubContract = new chainHub.Contract(this.network);

    this.proxyIntakeAdmin = await ProxyIntakeAdmin__factory.connect(proxyIntakeAdminAddress, this.owner);

    this.clusterHandlerArea = <IClusterHandlerArea>await IClusterHandlerArea__factory.connect(clusterHandlerAreaProxyAddress, this.owner);
    this.clusterArea = <IClusterArea>await IClusterArea__factory.connect(clusterAreaProxyAddress, this.owner);
    this.clusterRuleArea = <IClusterRuleArea>await IClusterRuleArea__factory.connect(clusterRuleAreaProxyAddress, this.owner);
    this.clusterRuleAreaHandler = <IClusterRuleAreaHandler>await IClusterRuleAreaHandler__factory.connect(clusterRuleAreaHandlerProxyAddress, this.owner);
    this.clusterAttributeArea = <IClusterAttributeArea>await IClusterAttributeArea__factory.connect(clusterAttributeAreaProxyAddress, this.owner);
    this.clusterAttributeAreaToken = <IClusterAttributeAreaToken>await IClusterAttributeAreaToken__factory.connect(clusterAttributeAreaTokenProxyAddress, this.owner);
    this.clusterMountingArea = <IClusterMountingArea>await IClusterMountingArea__factory.connect(clusterMountingAreaProxyAddress, this.owner);
    this.stateCounter = <IStateCounter>await IStateCounter__factory.connect(stateCounterProxyAddress, this.owner);
    this.poolFee = <IStateCounter>await IStateCounter__factory.connect(poolFeeProxyAddress, this.owner);
    this.engine = <IEngine>await IEngine__factory.connect(engineProxyAddress, this.owner);
    this.engineView = <IEngineView>await IEngineView__factory.connect(engineViewAddress, this.owner);
    this.poolContract = <PoolContract>await PoolContract__factory.connect(poolContractAddress, this.owner);
    this.randomGenerator = <RandomGenerator>await RandomGenerator__factory.connect(randomGeneratorAddress, this.owner);
    this.poolTokenInput = <PoolToken>await PoolToken__factory.connect(poolTokenInputAddress, this.owner);
    this.poolTokenTransfer = <PoolToken>await PoolToken__factory.connect(poolTokenTransferAddress, this.owner);
    this.poolTokenMint = <PoolToken>await PoolToken__factory.connect(poolTokenMintAddress, this.owner);

    this.erc20 = <IERC20>await IERC20__factory.connect(ZERO_ADDRESS, this.owner);
    this.erc721 = <IERC721>await IERC721__factory.connect(ZERO_ADDRESS, this.owner);
    this.erc1155 = <IERC1155>await IERC1155__factory.connect(ZERO_ADDRESS, this.owner);

    this.address = engineProxyAddress;
  }

  public getEngineAreaList():string[]{

    let areaList:string[] = [];
    areaList.push(this.engine.address);
    areaList.push(this.randomGenerator.address);
    areaList.push(this.clusterRuleArea.address);
    areaList.push(this.clusterRuleAreaHandler.address);
    areaList.push(this.clusterAttributeArea.address);
    areaList.push(this.clusterAttributeAreaToken.address);
    areaList.push(this.clusterMountingArea.address);

    return areaList;
  }

  private async getContractFromList(name, contractList: []) {
    for (let i = 0; i < contractList.length; ++i) {
      if (contractList[i].name == name) {
        let contract = contractList[i];
        return await this.hubContract.getContractByAbiJson(this.owner, contract.contractAddress, contract, { name: contract.name });
      }
    }

    // name had better has "Proxy" at the rear
    for (let i = 0; i < contractList.length; ++i) {
      if (contractList[i].name == "ProxyIntake-" + name) {
        let proxyContract = contractList[i];
        let oriName = name.replace("Proxy", "");
        for (let j = 0; j < contractList.length; ++j) {
          if (contractList[j].name == oriName) {
            let oriContract = contractList[j];
            proxyContract.abi = oriContract.abi;

            return await this.hubContract.getContractByAbiJson(this.owner, proxyContract.contractAddress, proxyContract, { name: proxyContract.name });
          }
        }
      }
    }
    return null;
  }

  // contract { abi:"[]",bytecode:"",name:"" }
  public async loadByContractList(contractList: any[]) {

    this.network = "";
    this.chainId = await this.owner.getChainId();

    this.hubChain = new chainHub.Chain(this.network, [this.owner]);
    this.hubContract = new chainHub.Contract(this.network);

    this.proxyIntakeAdmin = <ProxyIntakeAdmin>await this.getContractFromList("ProxyIntakeAdmin", contractList);
    this.clusterHandlerArea = <IClusterHandlerArea>await this.getContractFromList("ClusterHandlerAreaProxy", contractList);
    this.clusterArea = <IClusterArea>await this.getContractFromList("ClusterAreaProxy", contractList);
    this.clusterRuleArea = <IClusterRuleArea>await this.getContractFromList("ClusterRuleAreaProxy", contractList);
    this.clusterRuleAreaHandler = <IClusterRuleAreaHandler>await this.getContractFromList("ClusterRuleAreaHandlerProxy", contractList);
    this.clusterAttributeArea = <IClusterRuleAreaHandler>await this.getContractFromList("ClusterAttributeAreaProxy", contractList);
    this.clusterAttributeAreaToken = <IClusterAttributeAreaToken>await this.getContractFromList("ClusterAttributeAreaTokenProxy", contractList);
    this.clusterMountingArea = <IClusterMountingArea>await this.getContractFromList("ClusterMountingAreaProxy", contractList);
    this.stateCounter = <IStateCounter>await this.getContractFromList("StateCounterProxy", contractList);
    this.poolFee = <PoolFee>await this.getContractFromList("PoolFeeProxy", contractList);
    this.engine = <IEngine>await this.getContractFromList("EngineProxy", contractList);

    this.engineView = <IEngineView>await this.getContractFromList("EngineView", contractList);
    this.poolContract = <PoolContract>await this.getContractFromList("PoolContract", contractList);
    this.randomGenerator = <RandomGenerator>await this.getContractFromList("RandomGenerator", contractList);
    this.poolTokenInput = <PoolToken>await this.getContractFromList("PoolToken-Input", contractList);
    this.poolTokenTransfer = <PoolToken>await this.getContractFromList("PoolToken-Transfer", contractList);
    this.poolTokenMint = <PoolToken>await this.getContractFromList("PoolToken-Mint", contractList);

    this.address = this.engine.address;

    this.erc20 = <IERC20>IERC20__factory.connect(ZERO_ADDRESS, this.owner);
    this.erc721 = <IERC721>IERC721__factory.connect(ZERO_ADDRESS, this.owner);
    this.erc1155 = <IERC1155>IERC1155__factory.connect(ZERO_ADDRESS, this.owner);
  }

  // contract { abi:"[]",bytecode:"",name:"" }
  public async loadHandlerByContractList(contractList: any[]) {

    this.whiteListHandler = <WhiteListHandler>await this.getContractFromList("WhiteListHandlerProxy", contractList);
    this.whiteListHandlerAddress = this.whiteListHandler.address;

    this.allocateHandler = <AllocateHandler>await this.getContractFromList("AllocateHandlerProxy", contractList);
    this.allocateHandlerAddress = this.allocateHandler.address;

    this.allocateLayerHandler = <AllocateLayerHandler>await this.getContractFromList("AllocateLayerHandlerProxy", contractList);
    this.allocateLayerHandlerAddress = this.allocateLayerHandler.address;

    this.restrictHandler = <RestrictHandler>await this.getContractFromList("RestrictHandlerProxy", contractList);
    this.restrictHandlerAddress = this.restrictHandler.address;

    this.mineHandler = <MineHandler>await this.getContractFromList("MineHandlerProxy", contractList);
    this.mineHandlerAddress = this.mineHandler.address;

    this.allocateLimitHandler = <AllocateLimitHandler>await this.getContractFromList("AllocateLimitHandlerProxy", contractList);
    this.allocateLimitHandlerAddress = this.allocateLimitHandler.address;
  }


  public static async create(owner: Signer, contracts) {
    let engine = new Engine(owner);
    await engine.load(
      contracts.proxyIntakeAdminAddress,
      contracts.clusterHandlerAreaProxyAddress,
      contracts.clusterAreaProxyAddress,
      contracts.clusterRuleAreaProxyAddress,
      contracts.clusterRuleAreaHandlerProxyAddress,
      contracts.clusterAttributeAreaProxyAddress,
      contracts.clusterAttributeAreaTokenProxyAddress,
      contracts.clusterMountingAreaProxyAddress,
      contracts.stateCounterProxyAddress,
      contracts.poolFeeProxyAddress,
      contracts.engineProxyAddress,
      contracts.engineViewAddress,
      contracts.poolContractAddress,
      contracts.randomGeneratorAddress,
      contracts.poolTokenInputAddress,
      contracts.poolTokenMintAddress,
      contracts.poolTokenTransferAddress);

    engine.multiCall = await EngineUtil.loadMultiCall(owner);
    return engine;
  }

  public static async createByContractList(owner: Signer, contractList: any[]) {
    let engine = new Engine(owner);
    await engine.loadByContractList(contractList);
    await engine.loadHandlerByContractList(contractList);

    engine.multiCall = await EngineUtil.loadMultiCall(owner);
    return engine;
  }

  //HA: handler typechain
  public HH(handlerName:string):IHandler {
    return this.handler.handler(handlerName);
  }

  //HA: handler address
  public HA(handlerName:string):string{
    return this.handler.address(handlerName);
  }

  //HS: handler state
  public async HS(handlerName:string,params:HandlerState,log?:boolean):string{
    return this.handler.state(handlerName, params, log);
  }


  public async pauseEngine(channel: BigNumberish):Promise<Event> {
    log.debug("pauseEngine", "channel", channel);
    let tx = await this.engine.connect(this.owner).pause(channel, true);
    let receipt = await tx.wait();

    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async unpauseEngine(channel: BigNumberish):Promise<Event> {
    log.debug("unpauseEngine", "channel", channel);
    let tx = await this.engine.connect(this.owner).pause(channel, false);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async pauseCluster(channel: BigNumberish):Promise<Event> {
    log.debug("pauseCluster", "channel", channel);
    let tx = await this.clusterArea.connect(this.owner).pause(channel, true);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async unpauseCluster(channel: BigNumberish):Promise<Event> {
    log.debug("unpauseCluster", "channel", channel);
    let tx = await this.clusterArea.connect(this.owner).pause(channel, false);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async regDeployer(deployer: string, nonce: number):Promise<EventDeployer> {
    log.debug("regDeployer", "deployer", deployer, "nonce", nonce);
    let tx = await this.poolContract.regDeployer(deployer, BN(nonce));
    let receipt = await tx.wait();
    Helper.printTx("regDeployer", receipt);

    let eventDeployerList = await this.hubContract.decodeEvent(this.poolContract, receipt, "EventDeployer");
    if (eventDeployerList.length == 0) {
      eventDeployerList = await this.hubContract.decodeEvent(this.poolContract, receipt, "EventDeployerExist");
    }

    let event = new EventDeployer();
    event.copy(eventDeployerList[eventDeployerList.length - 1]);
    event.printEvent("regDeployer");
    event.receipt = receipt;
    return event;
  }

  public async regCluster(cluster: Cluster, value: BigNumberish = 0):Promise<EventCluster> {
    log.info("---------- regCluster");
    let overrides = {
      gasLimit: 15000000,
      value: value
    };
    log.debug("cluster-json", JSON.stringify(cluster));
    let tx = await this.clusterArea.connect(this.owner).regCluster(cluster, overrides);
    let receipt = await tx.wait();
    Helper.printTx("regCluster", receipt);

    let eventClusterList = await this.hubContract.decodeEvent(this.clusterArea, receipt, "EventCluster");

    let event = new EventCluster();
    event.copy(eventClusterList[eventClusterList.length - 1]);
    event.printEvent("regCluster");
    event.receipt = receipt;
    return event;
  }

  public async regRule(cluster: Cluster, value: BigNumberish = 0):Promise<EventCluster> {
    await cluster.init();

    log.info("---------- regRule");
    let overrides = {
      gasLimit: 15000000,
      value: value
    };
    log.debug("cluster-json", JSON.stringify(cluster));
    let tx = await this.clusterArea.connect(this.owner).regRule(cluster, overrides);
    let receipt = await tx.wait();
    Helper.printTx("regRule", receipt);

    let eventClusterList = await this.hubContract.decodeEvent(this.clusterArea, receipt, "EventCluster");

    let event = new EventCluster();
    event.copy(eventClusterList[eventClusterList.length - 1]);
    event.printEvent("regRule");
    event.receipt = receipt;
    return event;
  }

  public async addRule(clusterId: BigNumberish, cluster: Cluster, value: BigNumberish = 0):Promise<EventCluster> {
    await cluster.init();

    log.info("---------- addRule");
    let overrides = {
      gasLimit: 15000000,
      value: value
    };
    log.debug(JSON.stringify(cluster));
    let tx = await this.clusterArea.connect(this.owner).addRule(clusterId, cluster, overrides);
    let receipt = await tx.wait();
    Helper.printTx("regRule", receipt);

    let eventClusterList = await this.hubContract.decodeEvent(this.clusterArea, receipt, "EventCluster");

    let event = new EventCluster();
    event.copy(eventClusterList[eventClusterList.length - 1]);
    event.printEvent("regRule");
    event.receipt = receipt;
    return event;
  }

  public async updateGroupSlotList(clusterId, ruleSlotList: RuleSlot[], value: BigNumberish = 0):Promise<EventCluster> {
    log.debug("updateGroupSlotList", "length", ruleSlotList.length);

    let overrides = {
      gasLimit: 15000000,
      value: value
    };

    for (let i = 0; i < ruleSlotList.length; ++i) {
      let ruleSlot = ruleSlotList[i];
      if (ruleSlot.groupSlotList.length != ruleSlot.groupSlotOptList.length) {
        throw Error("ruleSlot.groupSlotList.length != ruleSlot.groupSlotOptList.length");
      }
    }

    let tx = await this.clusterRuleArea.connect(this.owner).updateGroupSlotList(clusterId, ruleSlotList, overrides);
    let receipt = await tx.wait();
    Helper.printTx("updateGroupSlotList", receipt);

    let eventClusterList = await this.hubContract.decodeEvent(this.clusterRuleArea, receipt, "EventClusterRule");

    let event = new EventCluster();
    event.copy(eventClusterList[eventClusterList.length - 1]);
    event.printEvent("updateGroupSlotList");
    event.receipt = receipt;
    return event;
  }

  public async updateRuleList(clusterId, ruleList: Rule[], value: BigNumberish = 0):Promise<EventCluster> {
    log.debug("updateRuleList", "length", ruleList.length);
    let overrides = {
      gasLimit: 15000000,
      value: value
    };

    for (let i = 0; i < ruleList.length; ++i) {
      let rule = ruleList[i];
      rule.state = RULE_STATE.UPDATE;
      rule.init();
    }
    let tx = await this.clusterRuleArea.connect(this.owner).updateRuleList(clusterId, ruleList, overrides);
    let receipt = await tx.wait();
    Helper.printTx("updateRuleList", receipt);

    let eventClusterList = await this.hubContract.decodeEvent(this.clusterRuleArea, receipt, "EventClusterRule");
    let event = new EventCluster();
    event.copy(eventClusterList[eventClusterList.length - 1]);
    event.printEvent("updateRuleList");
    event.receipt = receipt;
    return event;
  }

  public async updateHandlerList(clusterId, ruleList: Rule[], value: BigNumberish = 0):Promise<EventCluster>{
    log.debug("updateHandlerList", "length", ruleList.length);
    let overrides = {
      gasLimit: 15000000,
      value: value
    };

    for (let i = 0; i < ruleList.length; ++i) {
      let rule = ruleList[i];
      rule.state = RULE_STATE.UPDATE;
      rule.init();
    }
    let tx = await this.clusterRuleAreaHandler.connect(this.owner).updateHandlerList(clusterId, ruleList, overrides);
    let receipt = await tx.wait();
    Helper.printTx("updateHandlerList", receipt);

    let eventClusterList = await this.hubContract.decodeEvent(this.clusterRuleAreaHandler, receipt, "EventClusterHandler");
    let event = new EventCluster();
    event.copy(eventClusterList[eventClusterList.length - 1]);
    event.printEvent("updateHandlerList");
    event.receipt = receipt;
    return event;
  }

  public async updateHandlerArgs(clusterId: BigNumberish, ruleSlotIndexInput: BigNumberish, ruleSlotIndexOutput: BigNumberish, handler: string, cmd: BigNumberish, args: [] = []):Promise<Event> {
    let overrides = {
      gasLimit: 6000000
    };

    let receipt = await Gas.estimateGasTxReceipt(
      this.owner,
      this.clusterRuleAreaHandler,
      "updateHandlerArgs",
      [clusterId, ruleSlotIndexInput, ruleSlotIndexOutput, cmd, handler, Helper.rlp(args)],
      overrides);
    Helper.printTx("updateHandlerArgs", receipt);
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async input(clusterId: BigNumberish,
                     ruleSlotIndexInput: BigNumberish,
                     ruleSlotIndexOutput: BigNumberish,
                     groupInputBranch: BigNumberish,
                     taskId: BigNumberish,
                     multiple: BigNumberish,
                     inTokenList: Token[],
                     args: []): EventTask {
    this.checkArgs(args);

    if (SDK_CHECK) {
      let clusterIdSetIndexBranchHash: BytesLike = utils.keccak256(utils.defaultAbiCoder.encode(
        ["uint32", "uint8", "uint16"],
        [clusterId, ruleSlotIndexInput, groupInputBranch]));

      let ret = await this.clusterRuleArea.getGroupSlot(clusterId, ruleSlotIndexInput, groupInputBranch);

      if (!ret[0]) {
        throw Error("groupInputBranch doesn't exist");
      }
    }

    let coinTotal: BigNumber = BN(0);
    for (let i = 0; i < inTokenList.length; ++i) {
      let inToken: Token = inTokenList[i];
      if (inToken.erc == ERC.COIN) {
        coinTotal = coinTotal.add(inToken.amount).mul(multiple).div(10000);
      }
    }

    let overridesEstimate = {
      value: coinTotal,
      // gasLimit: 3000000
    };

    let txInputReceipt = await Gas.estimateGasTxReceipt(
      this.owner,
      this.engine,
      "input",
      [this.clusterArea.address, clusterId, ruleSlotIndexInput, ruleSlotIndexOutput, groupInputBranch, this.stateCounter.address, taskId, multiple, inTokenList, Helper.rlp(args)],
      overridesEstimate);

    let eventTransferList = await this.processErcEvent(txInputReceipt);

    let eventTaskList = await this.hubContract.decodeEvent(this.engine, txInputReceipt, "EventTask");

    if (taskId > 0) {
      for (let i = eventTaskList.length -1; i >= eventTaskList.length; --i) {
        let eventTask = eventTaskList[i];
        if (eventTask.taskId != taskId) {
          let event = new EventTask();
          event.hash = txInputReceipt.transactionHash;
          event.copy(eventTask);
          event.eventTransferList = eventTransferList;
          event.printEvent("input");
          event.receipt = txInputReceipt;
          return event;
        }
      }
    }

    let event = new EventTask();
    event.hash = txInputReceipt.transactionHash;
    event.copy(eventTaskList[eventTaskList.length - 1]);
    event.eventTransferList = eventTransferList;
    event.printEvent("input");
    event.receipt = txInputReceipt;
    return event;
  }


  public checkArgs(args: []) {
    if (!Array.isArray(args)) {
      throw new Error("error args");
    }
    if (args.length > 0) {
      for (const arg of args) {
        if (!Array.isArray(arg) || arg.length < 2) {
          throw new Error("error args");
        }
      }
    }
  }

  public async execute(taskId: BigNumberish, args: [], roundList: BigNumberish[] = [], value: BigNumberish = 0): EventTask {
    log.info("---------- execute");
    this.checkArgs(args);

    let overridesEstimate = {
      gasLimit: 6000000,
      value: value
    };

    let exeReceipt = await Gas.estimateGasTxReceipt(
      this.owner,
      this.engine,
      "execute",
      [this.stateCounter.address, taskId, Helper.rlp(args), roundList],
      overridesEstimate);

    let eventTransferList = await this.processErcEvent(exeReceipt);

    let eventTaskList = await this.hubContract.decodeEvent(this.engine, exeReceipt, "EventTask");

    let event = new EventTask();
    event.hash = exeReceipt.transactionHash;
    if (eventTaskList.length > 0) {
      event.copy(eventTaskList[eventTaskList.length - 1]);
      event.eventTransferList = eventTransferList;
      event.printEvent("execute");
    }
    event.receipt = exeReceipt;
    return event;

  }

  public async claim(taskId: BigNumberish,args: [], roundList: BigNumberish[]): EventTask {
    log.info("---------- claim");

    let overrides = {
      // gasLimit: 3000000
    };

    let claimReceipt = await Gas.estimateGasTxReceipt(
      this.owner,
      this.engine,
      "claim",
      [this.stateCounter.address, taskId, Helper.rlp(args), roundList],
      overrides);

    let eventTransferList = await this.processErcEvent(claimReceipt);

    let eventTaskList = await this.hubContract.decodeEvent(this.engine, claimReceipt, "EventTask");

    let event = new EventTask();
    event.hash = claimReceipt.transactionHash;
    if (eventTaskList.length > 0) {
      event.copy(eventTaskList[eventTaskList.length - 1]);
    } else {
      event.taskId = taskId;
    }
    event.eventTransferList = eventTransferList;
    event.printEvent("claim");
    event.receipt = claimReceipt;
    return event;
  }

  public static decodeProcessArgs(args:string){

    let handlerList = [];

    let arr =  Helper.rlpDecode(args);

    for(let h = 0; h < arr.length; ++h){
      let handlerArgs = {};
      handlerArgs["args"] = {}

      for(let i=0; i < arr[h].length; ++i){
        let ele = arr[h][i];
        if (Array.isArray(ele)) {
          let argVal = RLP.from(ele);
          handlerArgs["args"][argVal.name] = argVal.value;
        }
        else {
          handlerArgs["handler"] = "0x" + ele.toString("hex");
        }
      }

      handlerList.push(handlerArgs);
    }

    return handlerList;
  }

  public async claimAddress(taskId: BigNumberish,args:[], outAddress: string, roundList: BigNumberish[]): EventTask {
    log.info("---------- claim");

    let overrides = {
      // gasLimit: 3000000
    };

    let claimAddressReceipt = await Gas.estimateGasTxReceipt(
      this.owner,
      this.engine,
      "claimAddress",
      [this.stateCounter.address, taskId,Helper.rlp(args),outAddress, roundList],
      overrides);

    let eventTransferList = await this.processErcEvent(claimAddressReceipt);

    let eventTaskList = await this.hubContract.decodeEvent(this.engine, claimAddressReceipt, "EventTask");

    let event = new EventTask();
    event.hash = claimAddressReceipt.transactionHash;
    if (eventTaskList.length > 0) {
      event.copy(eventTaskList[eventTaskList.length - 1]);
    } else {
      event.taskId = taskId;
    }
    event.eventTransferList = eventTransferList;
    event.printEvent("claimAddress");
    event.receipt = claimAddressReceipt;
    return event;
  }

  public async executeClaim(taskId: BigNumberish, args: BytesLike[], roundList: BigNumberish[]): EventTask {
    log.info("---------- claim");

    let overrides = {
      // gasLimit: 3000000
    };

    let exeClaimReceipt = await Gas.estimateGasTxReceipt(
      this.owner,
      this.engine,
      "executeClaim",
      [this.stateCounter.address, taskId, Helper.rlp(args), roundList],
      overrides);

    let eventTransferList = await this.processErcEvent(exeClaimReceipt);

    let eventTaskList = await this.hubContract.decodeEvent(this.engine, exeClaimReceipt, "EventTask");

    let event = new EventTask();
    event.hash = exeClaimReceipt.transactionHash;
    if (eventTaskList.length > 0) {
      event.copy(eventTaskList[eventTaskList.length - 1]);
    } else {
      event.taskId = taskId;
    }
    event.eventTransferList = eventTransferList;
    event.printEvent("executeClaim");
    event.receipt = exeClaimReceipt;
    return event;
  }

  public async revoke(taskId: BigNumberish, roundList: BigNumberish[]): EventTask {
    log.info("---------- claim");

    let overrides = {
      // gasLimit: 3000000
    };

    let revokeReceipt = await Gas.estimateGasTxReceipt(
      this.owner,
      this.engine,
      "revoke",
      [this.stateCounter.address, taskId],
      overrides);

    let eventTransferList = await this.processErcEvent(revokeReceipt);

    let eventTaskList = await this.hubContract.decodeEvent(this.engine, revokeReceipt, "EventTask");

    let event = new EventTask();
    event.hash = revokeReceipt.transactionHash;
    event.copy(eventTaskList[eventTaskList.length - 1]);
    event.eventTransferList = eventTransferList;
    event.printEvent("revoke");
    event.receipt = revokeReceipt;
    return event;
  }


  public async haveRole(clusterId:BigNumberish,role:BigNumberish,account:string):(boolean) {
    return await this.clusterArea.connect(this.owner).haveRole(clusterId,role,account);
  }

  public async grantRole(clusterId:BigNumberish,role:BigNumberish,account:string):Promise<Event>{
    let tx = await this.clusterArea.connect(this.owner).grantRole(clusterId,role,account);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async revokeRole(clusterId:BigNumberish,role:BigNumberish,account:string):Promise<Event> {
    let tx = await this.clusterArea.connect(this.owner).revokeRole(clusterId,role,account);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async renounceRole(clusterId:BigNumberish,role:BigNumberish,account:string):Promise<Event>{
    let tx = await this.clusterArea.connect(this.owner).renounceRole(clusterId,role,account);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async setClusterState(clusterId: BigNumberish, state: BigNumberish):Promise<Event> {
    log.debug("setClusterState", "clusterId", clusterId, "state", state);
    let tx = await this.clusterArea.connect(this.owner).setClusterState(clusterId, state);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async setRuleState(clusterId: BigNumberish, ruleSlotIndexInput: BigNumberish, ruleSlotIndexOutput: BigNumberish, state: BigNumberish):Promise<Event> {
    log.debug("setRuleState", "clusterId", clusterId, "ruleSlotIndexInput", ruleSlotIndexInput, "ruleSlotIndexOutput", ruleSlotIndexOutput, "state", state);
    let tx = await this.clusterRuleArea.connect(this.owner).setRuleState(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput, state);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async deployerTransfer(handler: string, newDeployer: BigNumberish):Promise<Event> {
    log.debug("ClusterHandlerArea deployerTransfer", "newDeployer", newDeployer);
    let tx = await this.clusterHandlerArea.connect(this.owner).deployerTransfer(handler, newDeployer);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async getRandomState(handler: any, clusterId: BigNumberish, ruleSlotIndexInput: BigNumberish, ruleSlotIndexOutput: BigNumberish, taskId: BigNumberish, _log?: {
    name: string
  }) {
    let randomState = await this.randomGenerator.getRandomState(
      handler.address,
      this.clusterArea.address,
      clusterId,
      ruleSlotIndexInput,
      ruleSlotIndexOutput,
      this.stateCounter.address,
      taskId,
      this.owner.address
    );

    let state = {};

    state["blockNumber"] = randomState.blockNumber;
    state["blockTimestamp"] = randomState.blockTimestamp;
    state["blockTimestampToDate"] = Task.timestampToDate(randomState.blockTimestamp);
    state["caller"] = randomState.caller;
    state["clusterArea"] = randomState.clusterArea;
    state["clusterId"] = randomState.clusterId;
    state["futureBlockHash"] = randomState.futureBlockHash;
    state["futureBlockHashInt"] = randomState.futureBlockHashInt;
    state["futureBlockNumber"] = randomState.futureBlockNumber;
    state["handler"] = randomState.handler;
    state["ruleSlotIndexInput"] = randomState.ruleSlotIndexInput;
    state["ruleSlotIndexOutput"] = randomState.ruleSlotIndexOutput;
    state["stateCounter"] = randomState.stateCounter;
    state["stdTrialMaxCount"] = randomState.stdTrialMaxCount;
    state["taskId"] = randomState.taskId;
    state["trialCount"] = randomState.trialCount;

    if (_log) {
      log.debug();
      log.debug("randomState", JSON.stringify(randomState));
      log.debug("randomState", "engine", randomState.engine, "clusterArea", randomState.clusterArea, "caller", randomState.caller);
      log.debug("randomState",
        "clusterId", randomState.clusterId,
        "ruleSlotIndexInput", randomState.ruleSlotIndexInput,
        "ruleSlotIndexOutput", randomState.ruleSlotIndexOutput,
        "taskId", randomState.taskId);
      log.debug("randomState",
        "block.number", randomState.blockNumber,
        "block.timestamp", randomState.blockTimestamp,
        "timestampToDate", Task.timestampToDate(randomState.blockTimestamp));

      log.debug("randomState",
        "stdTrialMaxCount", randomState.stdTrialMaxCount,
        "trialCount", randomState.trialCount,
        "futureBlockNumber", randomState.futureBlockNumber,
        "futureBlockHash", randomState.futureBlockHash,
        "futureBlockHashInt", randomState.futureBlockHashInt.toString());
    }

    return state;
  }

  private async processErcEvent(receipt): [] {
    let eventTransferList: [] = [];

    for (let i = 0; i < receipt.logs.length; ++i) {
      let _log = receipt.logs[i];
      let topic = _log.topics[0];
      try {
        let event = this.erc20.interface.getEvent("Transfer");
        let encodeEvent = utils.keccak256(utils.toUtf8Bytes(event.format()));

        if (topic == encodeEvent && _log.topics.length == 3) {
          let eventLog = this.erc20.interface.decodeEventLog(event, _log.data, _log.topics);
          let contractAddress = _log.address;
          eventTransferList.push(new EventTransfer(contractAddress, ERC.ERC20, eventLog.from, eventLog.to, 0, eventLog.value));
        }
      } catch (e) {
        log.error("ERC20 decodeEvent", e.toString());
      }

      try {
        let event = this.erc721.interface.getEvent("Transfer");
        let encodeEvent = utils.keccak256(utils.toUtf8Bytes(event.format()));

        if (topic == encodeEvent && _log.topics.length == 4) {
          let eventLog = this.erc721.interface.decodeEventLog(event, _log.data, _log.topics);
          let contractAddress = _log.address;
          eventTransferList.push(new EventTransfer(contractAddress, ERC.ERC721, eventLog.from, eventLog.to, eventLog.tokenId, 0));
        }
      } catch (e) {
        log.error("ERC721 decodeEvent", e.toString());
      }

      try {
        let event = this.erc1155.interface.getEvent("TransferSingle");
        let encodeEvent = utils.keccak256(utils.toUtf8Bytes(event.format()));

        if (topic == encodeEvent) {
          let eventLog = this.erc1155.interface.decodeEventLog(event, _log.data, _log.topics);
          let contractAddress = _log.address;
          eventTransferList.push(new EventTransfer(contractAddress, ERC.ERC1155, eventLog.from, eventLog.to, eventLog.id, eventLog.value));
        }
      } catch (e) {
        log.error("ERC721 decodeEvent", e.toString());
      }
    }

    return eventTransferList;
  }

  public async getRuleTotalCount(clusterId: BigNumberish, ruleSlotIndexInput: BigNumberish, ruleSlotIndexOutput: BigNumberish): BigNumberish {
    let totalCount = await this.clusterRuleArea.getRuleTotalCount(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput);
    log.debug("getRuleTotalCount", totalCount.toString());
    return totalCount;
  }

  public async getRuleLeftCount(clusterId: BigNumberish, ruleSlotIndexInput: BigNumberish, ruleSlotIndexOutput: BigNumberish): BigNumberish {
    let leftCount = await this.clusterRuleArea.getRuleLeftCount(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput);
    log.debug("getRuleLeftCount", "leftCount", leftCount.toString());
    return leftCount;
  }

  //get io addressList of each round
  public async getInputAddressRound(taskId: BigNumberish, round: BigNumberish): string[] {
    let addressList = await this.engineView.getInputAddressRound(this.engine.address, this.stateCounter.address, taskId, round);
    for (let i = 0; i < addressList.length; ++i) {
      log.debug("getInputAddressRound", "i", i, "inputAddress", addressList[i]);

    }
  }

  public async getOutputAddressRound(taskId: BigNumberish, round: BigNumberish): string[] {
    let addressList = await this.engineView.getOutputAddressRound(this.engine.address, this.stateCounter.address, taskId, round);
    for (let i = 0; i < addressList.length; ++i) {
      log.debug("getOutputAddressRound", "i", i, "outputAddress", addressList[i]);
    }
  }

  //get io branch of each round of every address
  public async getInputAddressRoundBranch(inAddress: string, taskId: BigNumberish, round: BigNumberish): BigNumberish {
    let branch = await this.engineView.getInputAddressRoundBranch(this.engine.address, inAddress, this.stateCounter.address, taskId, round);
    log.debug("getInputAddressRoundBranch", "inAddress", inAddress, "taskId", taskId, "round", round, "branch", branch);
    return branch;
  }

  public async getOutputAddressRoundBranch(outAddress: string, taskId: BigNumberish, args:[],round: BigNumberish): BigNumberish {

    try{
      let branch = await this.engineView.getOutputAddressRoundBranch(this.engine.address, outAddress, this.stateCounter.address, taskId,Helper.rlp(args), round);
      log.debug("getOutputAddressRoundBranch", "outAddress", outAddress, "taskId", taskId, "args",args, "round", round, "branch", branch);
      return branch;
    }catch(e){
      log.debug('getOutputAddressRoundBranch engineView error',JSON.stringify(e));
    }
    return 0;
  }

  //get in token list of outAddress of groupInputBranch
  public async getBranchInputTokenList(inAddress: string, taskId: BigNumberish, round: BigNumberish, branch: BigNumberish): Token[] {
    let tokenList = await this.engine.getBranchInputTokenList(inAddress, this.stateCounter.address, taskId, round, branch);

    for (let i = 0; i < tokenList.length; ++i) {
      let token: Token = tokenList[i];
      log.debug("getBranchInputTokenList", "inAddress", inAddress, "taskId", taskId, "round", round, "branch", branch, "token", token.desc());
    }
    return tokenList;
  }

  //get branch out token list of outAddress
  public async getBranchOutputTokenList(outAddress: string, taskId: BigNumberish,args:[], round: BigNumberish, branch: BigNumberish): Token[] {
    try{
      let tokenListRet = await this.engineView.getBranchOutputTokenList(this.engine.address, outAddress, this.stateCounter.address, taskId,Helper.rlp(args), round, branch);
      let tokenList = [];
      for (let i = 0; i < tokenListRet.length; ++i) {
        let tokenRet: Token = tokenListRet[i];
        let token: Token = new Token();
        // token.erc = tokenRet.erc;
        // token.token = tokenRet.token;
        token.id = tokenRet.id;
        token.amount = tokenRet.amount;

        tokenList[i] = token;

        log.debug("getBranchOutputTokenList", "outAddress", outAddress, "taskId", taskId, "args",args, "round", round, "branch", branch, "token", token.desc());
      }
      return tokenList;
    }
    catch(e){
      log.debug("getBranchOutputTokenList engineView error",JSON.stringify(e));
      return [];
    }
  }

  //ret1 > ret0
  public async compareClaimIOAddressBranchTokenList(ret0,ret1):Promise<{
    code: number,
    data: ClaimIO[],
    msg: string
  }>{

    let ret = {
      code: 200,
      msg: "ok",
      data: []
    };

    if(ret0.code != 200 || ret1.code != 200){
      ret.code = 401;
      ret.msg = "error: ret0 or ret1 code isn't 200";
      ret.data = [];
      return ret;
    }

    if(ret0.data.length !=  ret1.data.length){
      ret.code = 402;
      ret.msg = "error: ret0 and ret1 length are not same";
      ret.data = [];
      return ret;
    }

    for(let i=0; i < ret0.data.length; ++i){
      let claimIO0 = ret0.data[i];
      let claimIO1 = ret1.data[i];

      if(claimIO0.round != claimIO1.round){
        ret.code = 403;
        ret.msg = "error: ret0 and ret1 round are not match";
        ret.data = [];
        return ret;
      }

      if(claimIO0.taskId != claimIO1.taskId){
        ret.code = 404;
        ret.msg = "error: ret0 and ret1 round are not match";
        ret.data = [];
        return ret;
      }
    }


    for(let i = 0; i < ret0.data.length; ++i) {
      let claimIO0:ClaimIO = ret0.data[i];
      let claimIO1:ClaimIO = ret1.data[i];

      let inputTokenList0 = claimIO0.inputTokenList;
      let inputTokenList1 = claimIO1.inputTokenList;

      if(inputTokenList0.length != inputTokenList1.length){
        ret.code = 410;
        ret.msg = "error: inputTokenList0.length != inputTokenList1.length";
        ret.data = [];
        return ret;
      }

      for(let j = 0;j < inputTokenList1.length; ++j){
        let inputToken0 = inputTokenList0[j];
        let inputToken1 = inputTokenList1[j];

        if(inputToken0.claim != inputToken1.claim && inputToken1.claim == CLAIM_STATE.CLAIMED){
          inputToken1.claimAdded = 1;
          claimIO1.tokenInputCount.claimedAdded++;
        }
      }


      let outputTokenList0 = claimIO0.outputTokenList;
      let outputTokenList1 = claimIO1.outputTokenList;

      if(outputTokenList0.length != outputTokenList1.length){
        ret.code = 411;
        ret.msg = "error: outputTokenList0.length != outputTokenList1.length";
        ret.data = [];
        return ret;
      }


      for(let j = 0;j < outputTokenList1.length; ++j){
        let outputToken0 = outputTokenList0[j];
        let outputToken1 = outputTokenList1[j];

        if(outputToken0.claim != outputToken1.claim && outputToken1.claim == CLAIM_STATE.CLAIMED){
          outputToken1.claimAdded = 1;
          claimIO1.tokenOutputCount.claimedAdded++;
        }
      }
    }

    return ret1;
  }

  public async getClaimIOAddressBranchTokenList(
    taskId: BigNumberish,args:[] = [], roundList: [] = [], hashList?: string[], addr?: string = this.owner.address
  ):Promise<{
    code: number,
    data: ClaimIO[],
    msg: string
  }> {

    addr = addr.toLowerCase();
    let task = await this.getTask(taskId);
    task.caller = task.caller.toLowerCase();

    let ret = {
      code: 200,
      msg: "ok",
      data: []
    };

    if (task.state != TASK_STATE.DONE && task.state != TASK_STATE.PROCESSED) {
      ret.code = 301;
      ret.msg = "error: Task state is " + task.state + ", it hasn't be claimed.";
      ret.data = [];

      log.debug("getClaimIOAddressBranchTokenList", ret.msg);
      return ret;
    }

    let hostTaskId = task.taskId;
    if(task.parentTaskId){
      hostTaskId = task.parentTaskId;
    }

    let processRoundList = [];

    if (roundList.length > 0) {
      processRoundList = roundList;
    } else {
      for (let round = 0; round < task.groupInputRound; ++round) {
        processRoundList.push(round);
      }
    }

    //output token claim check
    for (let r = 0; r < processRoundList.length; ++r) {
      let round = processRoundList[r];

      let claimIO = new ClaimIO();
      claimIO.taskId = taskId;
      claimIO.parentTaskId = task.parentTaskId;

      ret.data.push(claimIO);

      claimIO.round = round;

      let outputGroupSlotBranch = await this.getOutputAddressRoundBranch(addr, hostTaskId,Helper.rlp(args), round);
      let [found, groupSlotOutput] = await this.clusterRuleArea.getGroupSlot(task.clusterId, task.ruleSlotIndexOutput, outputGroupSlotBranch);

      claimIO.outputGroupSlotBranch = outputGroupSlotBranch;

      let outputTokenList:Token[] = await this.getBranchOutputTokenList(addr, hostTaskId,Helper.rlp(args), round, outputGroupSlotBranch);
      claimIO.outputTokenList = outputTokenList;

      for (let tokenSlotIndex = 0; tokenSlotIndex < groupSlotOutput.tokenSlotList.length; ++tokenSlotIndex) {

        claimIO.tokenOutputCount.total++;

        let tokenSlotContract = groupSlotOutput.tokenSlotList[tokenSlotIndex];
        let tokenTemplateContract = tokenSlotContract.tokenTemplate;
        let tokenSlot = new TokenSlot();
        await tokenSlot.copyFromContract(tokenSlotContract);

        //if getBranchOutputTokenList has exception make an empty token
        if(!outputTokenList[tokenSlotIndex]){
          let token: Token = new Token();
          token.id = 0;
          token.amount = 0;
          outputTokenList[tokenSlotIndex] = token;
        }

        outputTokenList[tokenSlotIndex].tokenSlotIndex = tokenSlotIndex;
        outputTokenList[tokenSlotIndex].claim = CLAIM_STATE.UNCLAIMED;
        outputTokenList[tokenSlotIndex].claimAdded = 0;
        outputTokenList[tokenSlotIndex].token = tokenTemplateContract.token;
        outputTokenList[tokenSlotIndex].erc = tokenTemplateContract.erc;

        outputTokenList[tokenSlotIndex].durationType = tokenSlot.durationTypeList[0];
        outputTokenList[tokenSlotIndex].durationBegin = tokenSlot.durationBeginList[0];
        outputTokenList[tokenSlotIndex].durationEnd = tokenSlot.durationEndList[0];

        outputTokenList[tokenSlotIndex].tokenSlot = tokenSlot;

        let claim: Claim = new Claim();
        claim.engine = this.engine.address;
        claim.clusterArea = this.clusterArea.address;
        claim.clusterId = task.clusterId;
        claim.stateCounter = this.stateCounter.address;
        claim.taskId = hostTaskId;
        claim.claimer = task.caller;
        claim.io = IO.OUTPUT;
        claim.round = round;
        claim.branch = 0;
        claim.tokenSlotIndex = tokenSlotIndex;

        try {
          let outAddress = task.caller;

          if(tokenSlot.tokenTemplate.getOutAddressRequired()){
              outAddress = tokenSlot.tokenTemplate.getOutAddress();
          }

          let claimed = await this.engineView.getClaimIOAddressBranchToken(claim);
          if (claimed) {
            outputTokenList[tokenSlotIndex].claim = CLAIM_STATE.CLAIMED;
            if(addr == outAddress){
              claimIO.tokenOutputCount.claimed++;
            }
          } else {

            let timesUpToClaim = tokenSlot.checkClaimTime(0, task.timestampDoneOrRevoked, task.blockNumberDoneOrRevoked, await this.hubChain.getLatestBlockTimestamp(this.owner), await this.hubChain.getLatestBlockHeight(this.owner));
            outputTokenList[tokenSlotIndex].claim = timesUpToClaim;

            if(addr == outAddress){
              if(timesUpToClaim == CLAIM_STATE.UNCLAIMED) {
                claimIO.tokenOutputCount.unclaimed++;
              }
              else if(timesUpToClaim == CLAIM_STATE.CLAIMABLE){
                claimIO.tokenOutputCount.claimable++;
              }
              else if(timesUpToClaim == CLAIM_STATE.TIMEOUT){
                claimIO.tokenOutputCount.timeout++;
              }
            }
          }

          if(addr != outAddress){
            outputTokenList[tokenSlotIndex].claim += CLAIM_STATE.EXCEPTION;
            claimIO.tokenOutputCount.exception++;
          }

        }
        catch (e) {
          outputTokenList[tokenSlotIndex].claim += CLAIM_STATE.EXCEPTION;
          claimIO.tokenOutputCount.exception++;
        }

        if (outputTokenList[tokenSlotIndex].erc == ERC.ERC721 || outputTokenList[tokenSlotIndex].erc == ERC.ERC1155) {
          if (hashList != undefined) {

            let eventTransferList = [];
            for(let h = 0; h < hashList.length; ++h){
              //round mode : may be wrong;
              const receipt = await this.owner.provider.getTransactionReceipt(hashList[h]);
              let eventList = await this.processErcEvent(receipt);
              eventTransferList.push(...eventList);
            }


            let outputTokenNFTList = [];
            let firstMatch = false;
            for (let k = 0; k < eventTransferList.length; ++k) {
              let eventTransfer = eventTransferList[k];
              if (eventTransfer.used == undefined && eventTransfer.token.toLowerCase() == outputTokenList[tokenSlotIndex].token.toLowerCase()
                && eventTransfer.to.toLowerCase() == addr
              ) {
                if (firstMatch) {
                  if(outputTokenList[tokenSlotIndex].erc == ERC.ERC721){
                    let token721 = Token.newERC721(outputTokenList[tokenSlotIndex].token, eventTransfer.id);
                    token721.claim = outputTokenList[tokenSlotIndex].claim;
                    outputTokenNFTList.push(token721);
                  }
                  else { //erc 1155
                    let token1155 = Token.newERC1155(outputTokenList[tokenSlotIndex].token, eventTransfer.id,eventTransfer.amount);
                    token1155.claim = outputTokenList[tokenSlotIndex].claim;
                    outputTokenNFTList.push(token1155);
                  }
                } else {
                  outputTokenList[tokenSlotIndex].id = eventTransfer.id;
                  outputTokenList[tokenSlotIndex].amount = eventTransfer.amount;
                  eventTransfer.used = true;
                  firstMatch = true;
                }
              }
            }
            outputTokenList.push(...outputTokenNFTList);
          }
        }
        outputTokenList.sort((a, b) => (a.erc - b.erc));
      }

      for (let i = 0; i < outputTokenList.length; ++i) {
        let outputToken = outputTokenList[i];

        log.debug("getClaimIOAddressBranchTokenList", "taskId", taskId, "round", round,
          "output", outputToken.claim == CLAIM_STATE.UNCLAIMED ? "unclaimed" : outputToken.claim == CLAIM_STATE.CLAIMABLE ? "claimable" : "claimed",
          "outGroupSlotBranch", outputGroupSlotBranch, "tokenSlotIndex", i, "desc", outputToken.desc());
      }

      let outputTokenAttrListArray:TokenAttributeList[] = await this.getTokenAttrIdList(task.clusterId,outputTokenList);

      for(let oIndex = 0; oIndex < outputTokenList.length; ++oIndex){
        let outputToken = outputTokenList[oIndex];
        let outputTokenAttrList = outputTokenAttrListArray[oIndex];
        if(outputToken.erc == ERC.ERC721 || outputToken.erc == ERC.ERC1155){
          outputToken.attrOptList = outputTokenAttrList.attributeOptList;
        }
      }

      //input token claim check
      let [found2, groupSlotInput] = await this.clusterRuleArea.getGroupSlot(task.clusterId, task.ruleSlotIndexInput, task.groupInputBranch);

      let inputTokenList = [];
      for(let t = 0 ; t < task.inTokenList.length; ++t){
          let token = new Token();
          token.copy(task.inTokenList[t]);
          inputTokenList.push(token);
      }

      let inputTokenAttrListArray:TokenAttributeList[] = await this.getTokenAttrIdList(task.clusterId,inputTokenList);
      let inputTokenAttrIndex = 0;
      for(let iIndex = 0; iIndex < inputTokenList.length; ++iIndex){
        let inputToken = inputTokenList[iIndex];
        let inputTokenAttrList = inputTokenAttrListArray[iIndex];
        if(inputToken.erc == ERC.ERC721 || inputToken.erc == ERC.ERC1155){
          inputToken.attrOptList = inputTokenAttrList.attributeOptList;
        }
      }

      claimIO.inputTokenList = inputTokenList;

      for (let tokenSlotIndex = 0; tokenSlotIndex < groupSlotInput.tokenSlotList.length; ++tokenSlotIndex) {

        claimIO.tokenInputCount.total++;

        let tokenSlotContract = groupSlotInput.tokenSlotList[tokenSlotIndex];

        let tokenSlot = new TokenSlot();
        await tokenSlot.copyFromContract(tokenSlotContract);

        let defaultK = 0;
        for (let k = 0; k < tokenSlot.ioAddressList.length; ++k) {
          //process input tokens according to the output groupSlot branch
          if (tokenSlot.branchList[k] == outputGroupSlotBranch) {
            defaultK = k;
            break;
          }

          if (tokenSlot.branchList[k] == 0) { // default outBranch is 0
            defaultK = k;
          }
        }

        let outAddress = task.caller;

        //if this token is not for self, no need to check the input result
        if (tokenSlot.ioAddressList[defaultK] != SELF_ADDRESS && tokenSlot.ioAddressList[defaultK].toLowerCase() != task.caller) {
          outAddress = tokenSlot.ioAddressList[defaultK].toLowerCase();
        }

        let inputToken = inputTokenList[tokenSlotIndex];
        inputToken.tokenSlotIndex = tokenSlotIndex;
        inputToken.tokenSlot = tokenSlot;
        inputToken.claimAdded = 0;
        inputToken.claim = CLAIM_STATE.UNCLAIMED;//unclaimed

        inputToken.durationType = tokenSlot.durationTypeList[defaultK];
        inputToken.durationBegin = tokenSlot.durationBeginList[defaultK];
        inputToken.durationEnd = tokenSlot.durationEndList[defaultK];

        let checkExist = false;
        if(tokenSlot.tokenTemplate.erc == ERC.ERC721){
          if(tokenSlot.tokenTemplate.idRequired == TOKEN_TEMPLATE_ID_REQUIRED.EXIST){
            claimIO.tokenInputCount.checked++;
            inputToken.claim = CLAIM_STATE.CHECKED;
            checkExist = true;
          }
        }
        else if(tokenSlot.tokenTemplate.erc == ERC.ERC1155){
          if(tokenSlot.tokenTemplate.idRequired == TOKEN_TEMPLATE_ID_REQUIRED.EXIST
            || tokenSlot.tokenTemplate.amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.EXIST){
            claimIO.tokenInputCount.checked++;
            inputToken.claim = CLAIM_STATE.CHECKED;
            checkExist = true;
          }
        }
        else if(tokenSlot.tokenTemplate.erc == ERC.ERC20){
          if(tokenSlot.tokenTemplate.amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.EXIST){
            claimIO.tokenInputCount.checked++;
            inputToken.claim = CLAIM_STATE.CHECKED;
            checkExist = true;
          }
        }

        if(!checkExist){
          let claim: Claim = new Claim();
          claim.engine = this.engine.address;
          claim.clusterArea = this.clusterArea.address;
          claim.clusterId = task.clusterId;
          claim.stateCounter = this.stateCounter.address;
          claim.taskId = taskId;
          claim.claimer = task.caller;
          claim.io = IO.INPUT;
          claim.round = round;
          claim.branch = task.groupInputBranch;
          claim.tokenSlotIndex = tokenSlotIndex;

          //unclaimed token can be claimed now
          try{
            let claimed = await this.engineView.getClaimIOAddressBranchToken(claim);
            if (claimed) {
              inputToken.claim = CLAIM_STATE.CLAIMED;

              if(outAddress == addr){
                claimIO.tokenInputCount.claimed++;
              }

            } else {
              inputToken.claim = tokenSlot.checkClaimTime(defaultK, task.timestampDoneOrRevoked, task.blockNumberDoneOrRevoked, await this.hubChain.getLatestBlockTimestamp(this.owner), await this.hubChain.getLatestBlockHeight(this.owner));

              if(outAddress == addr) {
                if (inputToken.claim == CLAIM_STATE.UNCLAIMED) {
                  claimIO.tokenInputCount.unclaimed++;
                } else if (inputToken.claim == CLAIM_STATE.CLAIMABLE) {
                  claimIO.tokenInputCount.claimable++;
                } else if (inputToken.claim == CLAIM_STATE.TIMEOUT) {
                  claimIO.tokenInputCount.timeout++;
                }
              }
            }

            if(outAddress != addr){
              inputToken.claim += CLAIM_STATE.EXCEPTION;
              claimIO.tokenInputCount.exception++;
            }

          }
          catch(e){
            inputToken.claim += CLAIM_STATE.EXCEPTION;
            claimIO.tokenInputCount.exception++;
          }
        }


        log.debug("getClaimIOAddressBranchTokenList", "taskId", taskId, "round", round,
          "input", inputToken.claim == CLAIM_STATE.UNCLAIMED ? "unclaimed" : inputToken.claim == CLAIM_STATE.CLAIMABLE ? "claimable" : "claimed",
          "inGroupSlotBranch", task.groupInputBranch, "tokenSlotIndex", tokenSlotIndex, inputToken.desc());
      }
    }

    return ret;
  }

  public async getCluster(clusterId: BigNumberish, ruleSlotIndexInput?: BigNumberish, ruleSlotIndexOutput?: BigNumberish) {
    if (ruleSlotIndexInput != undefined && ruleSlotIndexOutput != undefined) {
      return await this.getClusterRuleList(clusterId, [ruleSlotIndexInput], [ruleSlotIndexOutput]);
    }
    return await this.getClusterRuleList(clusterId);
  }

  public async getMaxRuleSlotIndex(clusterId): number {
    let ruleSlotLength = await this.clusterRuleArea.getRuleSlotLength(clusterId);
    log.debug("getClusterRuleList-getBaseCluster", "ruleSlotLength", ruleSlotLength);
    return ruleSlotLength - 1;
  }

  //addRule , ruleSlotIndexInput = 0, ruleSlotIndexOutput = 0
  public async getClusterRuleList(clusterId: BigNumberish, ruleSlotIndexInputList: BigNumberish[], ruleSlotIndexOutputList: BigNumberish[]) {
    let cluster: Cluster = new Cluster();
    cluster.clusterId = clusterId;

    let ruleSlotLength = await this.clusterRuleArea.getRuleSlotLength(clusterId);
    log.debug("getClusterRuleList-getBaseCluster", "ruleSlotLength", ruleSlotLength);
    cluster.contractMaxRuleSlotIndex = ruleSlotLength - 1;

    let confCall = await this.multiCall.call([
      new MultiFunc(this.clusterArea, "getDeployerList", [clusterId]),
      new MultiFunc(this.clusterArea, "getAdminList", [clusterId]),
      new MultiFunc(this.clusterArea, "getDescription", [clusterId]),
      new MultiFunc(this.clusterArea, "getClusterState", [clusterId]),
      new MultiFunc(this.clusterArea, "getDelayTimestamp", [clusterId]),
      new MultiFunc(this.clusterArea, "getDelayBlockNumber", [clusterId])
    ]);

    let callIndex = 0;
    let conDeployerList = confCall[callIndex++][0];
    cluster.deployerList = [];
    for(let i = 0; i < conDeployerList.length; ++i){
      cluster.deployerList.push(conDeployerList[i].toLowerCase());
    }

    let conAdminList = confCall[callIndex++][0];
    cluster.adminList = [];
    for(let i = 0; i < conAdminList.length; ++i){
      cluster.adminList.push(conAdminList[i].toLowerCase());
    }

    cluster.description = confCall[callIndex++][0];
    cluster.state = confCall[callIndex++][0];
    cluster.delayTimestamp = confCall[callIndex++][0];
    cluster.delayBlockNumber = confCall[callIndex++][0];

    if (ruleSlotIndexInputList != undefined && ruleSlotIndexOutputList != undefined && ruleSlotIndexInputList.length != ruleSlotIndexOutputList.length) {
      return cluster;
    }

    let ruleSlotIndexRuleList = [];
    let specificRule = false;
    if (ruleSlotIndexInputList != undefined) {
      for (let i = 0; i < ruleSlotIndexInputList.length; ++i) {
        let ruleSlotIndexInput = ruleSlotIndexInputList[i];
        let ruleSlotIndexOutput = ruleSlotIndexOutputList[i];
        if (ruleSlotIndexInput != undefined && ruleSlotIndexOutput != undefined && ruleSlotIndexInput == ruleSlotIndexOutput) {
          throw Error("getCluster ruleSlotIndexInput == ruleSlotIndexOutput");
        }
        ruleSlotIndexRuleList.push(ruleSlotIndexInput);
        ruleSlotIndexRuleList.push(ruleSlotIndexOutput);
        specificRule = true;
      }
    } else {
      ruleSlotIndexRuleList = await this.clusterRuleArea.getRuleSlotIndexList(clusterId);
    }

    let funcList = [];
    for (let i = 0; i < ruleSlotIndexRuleList.length; i += 2) {
      let dsiInput = ruleSlotIndexRuleList[i];
      let dsiOutput = ruleSlotIndexRuleList[i + 1];

      funcList.push(new MultiFunc(this.clusterRuleArea, "getRuleState", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleArea, "getRuleDurationType", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleArea, "getRuleDelayTimestamp", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleArea, "getRuleDelayBlockNumber", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleArea, "getRuleTotalCount", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleArea, "getRuleLeftCount", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleAreaHandler, "getSnippet", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleAreaHandler, "getPreHandlerList", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleAreaHandler, "getProcessHandlerList", [clusterId, dsiInput, dsiOutput]));
      funcList.push(new MultiFunc(this.clusterRuleAreaHandler, "getPostHandlerList", [clusterId, dsiInput, dsiOutput]));
    }

    let resCall = await this.multiCall.call(funcList);
    callIndex = 0;
    for (let i = 0; i < ruleSlotIndexRuleList.length; i += 2) {
      let dsiInput = ruleSlotIndexRuleList[i];
      let dsiOutput = ruleSlotIndexRuleList[i + 1];

      let rule: Rule = new Rule(dsiInput, dsiOutput);
      rule.state = resCall[callIndex++][0];
      rule.fromContract = true;

      rule.durationType = resCall[callIndex++][0];
      rule.delayTimestamp = resCall[callIndex++][0];
      rule.delayBlockNumber = resCall[callIndex++][0];

      rule.totalCount = resCall[callIndex++][0];
      rule.leftCount = resCall[callIndex++][0];
      rule.snippet = resCall[callIndex++][0];

      let preHandlerList = resCall[callIndex++][0];
      for (let j = 0; j < preHandlerList.length; j += 2) {
        rule.preHandlerPoolList[j / 2] = preHandlerList[j];
        rule.preHandlerList[j / 2] = preHandlerList[j + 1];

        let obj = cluster.handlerVersionNameMap.get(preHandlerList[j + 1]);
        if (!obj) {
          let handlerContract = await IHandler__factory.connect(preHandlerList[j + 1], this.owner);
          obj = { pos: "pre", version: await handlerContract.version(), name: await handlerContract.cname() };
          cluster.handlerVersionNameMap.set(preHandlerList[j + 1], obj);
        }
      }

      let processHandlerList = resCall[callIndex++][0];
      for (let j = 0; j < processHandlerList.length; j += 2) {
        rule.processHandlerPoolList[j / 2] = processHandlerList[j];
        rule.processHandlerList[j / 2] = processHandlerList[j + 1];

        let obj = cluster.handlerVersionNameMap.get(processHandlerList[j + 1]);
        if (!obj) {
          let handlerContract = await IHandler__factory.connect(processHandlerList[j + 1], this.owner);
          obj = { pos: "process", version: await handlerContract.version(), name: await handlerContract.cname() };
          cluster.handlerVersionNameMap.set(processHandlerList[j + 1], obj);
        }
      }

      let postHandlerList = resCall[callIndex++][0];
      for (let j = 0; j < postHandlerList.length; j += 2) {
        rule.postHandlerPoolList[j / 2] = postHandlerList[j];
        rule.postHandlerList[j / 2] = postHandlerList[j + 1];

        let obj = cluster.handlerVersionNameMap.get(postHandlerList[j + 1]);
        if (!obj) {
          let handlerContract = IHandler__factory.connect(postHandlerList[j + 1], this.owner);
          obj = { pos: "post", version: await handlerContract.version(), name: await handlerContract.cname() };
          cluster.handlerVersionNameMap.set(postHandlerList[j + 1], obj);
        }
      }

      cluster.ruleList.push(rule);
    }

    let ruleSlotIndexList = [];
    cluster.ruleSlotBound = [];
    if (specificRule) {
      funcList = [];
      for (let i = 0; i < ruleSlotIndexRuleList.length; i += 2) {
        let dsiInput = ruleSlotIndexRuleList[i];
        let dsiOutput = ruleSlotIndexRuleList[i + 1];

        funcList.push(new MultiFunc(this.clusterRuleArea, "getGroupSlotBound", [clusterId, dsiInput]));
        funcList.push(new MultiFunc(this.clusterRuleArea, "getGroupSlotBound", [clusterId, dsiOutput]));
      }

      let resCall = await this.multiCall.call(funcList);
      callIndex = 0;
      for (let i = 0; i < ruleSlotIndexRuleList.length; i += 2) {

        let dsiInput = ruleSlotIndexRuleList[i];
        let dsiOutput = ruleSlotIndexRuleList[i + 1];

        cluster.ruleSlotBound.push(resCall[callIndex++][0]);
        cluster.ruleSlotBound.push(resCall[callIndex++][0]);

        ruleSlotIndexList.push(dsiInput);
        ruleSlotIndexList.push(dsiOutput);
      }
    } else {
      let groupSlotBoundList: BigNumberish[] = await this.clusterRuleArea.getGroupSlotBoundList(clusterId);
      for (let i = 0; i < groupSlotBoundList.length; ++i) {
        cluster.ruleSlotBound.push(groupSlotBoundList[i]);
        ruleSlotIndexList.push(i);
      }
    }

    funcList = [];
    for (let k = 0; k < ruleSlotIndexList.length; k++) {
      funcList.push(new MultiFunc(this.clusterRuleArea, "getGroupSlotBranchList", [clusterId, ruleSlotIndexList[k]]));
    }

    resCall = await this.multiCall.call(funcList);
    for (let k = 0; k < ruleSlotIndexList.length; k++) {
      let ruleSlotIndex = ruleSlotIndexList[k];
      let branchList: number[] = resCall[k][0];

      funcList = [];
      for (let i = 0; i < branchList.length; ++i) {
        funcList.push(new MultiFunc(this.clusterRuleArea, "getGroupSlot", [clusterId, ruleSlotIndex, branchList[i]]));
      }
      let branchCall = await this.multiCall.call(funcList);

      let ruleSlot: RuleSlot = new RuleSlot(ruleSlotIndex, []);
      for (let i = 0; i < branchList.length; ++i) {
        let groupSlotFound = branchCall[i];
        let groupSlotContract: GroupSlot = groupSlotFound[1];
        let groupSlot = new GroupSlot();
        groupSlot.tokenSlotList = [];

        groupSlot.branch = groupSlotContract.branch;
        groupSlot.poolToken = groupSlotContract.poolToken;
        groupSlot.id = i;

        funcList = [];
        for (let entry of cluster.handlerVersionNameMap.entries()) {
          let handler = entry[0];
          funcList.push(new MultiFunc(this.clusterRuleArea, "getGroupSlotHandlerArgs", [clusterId, ruleSlotIndex, branchList[i], handler]));
        }
        let handlerCall = await this.multiCall.call(funcList);

        let hi = 0;
        for (let entry of cluster.handlerVersionNameMap.entries()) {
          let handler = entry[0];
          let obj = entry[1];
          let args = handlerCall[hi][0];
          hi++;

          if (args !== undefined && args !== "0x") {
            let argsDecode = rlp.decode(args);
            groupSlot.handlerList.push(handler);

            groupSlot.argsList.push(args);
            groupSlot.argsValueList.push(RLP.fromList(args));
          }
        }

        ruleSlot.groupSlotList.push(groupSlot);
        for (let ts = 0; ts < groupSlotContract.tokenSlotList.length; ++ts) {
          let tokenSlotContract = groupSlotContract.tokenSlotList[ts];
          let tokenSlot = new TokenSlot();

          tokenSlot.tokenTemplate = TokenTemplate.newStorageOne(
            tokenSlotContract.tokenTemplate.erc,
            tokenSlotContract.tokenTemplate.token,
            tokenSlotContract.tokenTemplate.valueList
          );

          tokenSlot.rule = tokenSlotContract.rule;

          for (let io = 0; io < tokenSlotContract.ioAddressList.length; ++io) {
            tokenSlot.ioAddressList[io] = tokenSlotContract.ioAddressList[io];
            tokenSlot.valueList[io] = tokenSlotContract.valueList[io];
          }

          tokenSlot.tokenTemplate.restore();
          await tokenSlot.bitDecode();

          groupSlot.tokenSlotList.push(tokenSlot);
        }

        cluster.groupSlotList.push(groupSlot);
      }
      cluster.ruleSlotList.push(ruleSlot);
    }
    return cluster;
  }

  public async getRuleSlot(clusterId: BigNumberish, ruleSlotIndexList: BigNumberish[]) {
    let cluster: Cluster = new Cluster();
    cluster.clusterId = clusterId;

    let ruleSlotList = [];
    let funcList = [];

    funcList = [];
    for (let k = 0; k < ruleSlotIndexList.length; k++) {
      funcList.push(new MultiFunc(this.clusterRuleArea, "getGroupSlotBranchList", [clusterId, ruleSlotIndexList[k]]));
    }

    let resCall = await this.multiCall.call(funcList);
    for (let k = 0; k < ruleSlotIndexList.length; k++) {
      let ruleSlotIndex = ruleSlotIndexList[k];
      let branchList: number[] = resCall[k][0];
      funcList = [];
      for (let i = 0; i < branchList.length; ++i) {
        funcList.push(new MultiFunc(this.clusterRuleArea, "getGroupSlot", [clusterId, ruleSlotIndex, branchList[i]]));
      }
      let branchCall = await this.multiCall.call(funcList);

      let ruleSlot: RuleSlot = new RuleSlot(ruleSlotIndex, []);
      for (let i = 0; i < branchList.length; ++i) {
        let groupSlotFound = branchCall[i];

        let groupSlotContract: GroupSlot = groupSlotFound[1];

        let groupSlot = new GroupSlot();
        groupSlot.tokenSlotList = [];

        groupSlot.branch = groupSlotContract.branch;
        groupSlot.poolToken = groupSlotContract.poolToken;
        groupSlot.id = i;

        funcList = [];

        ruleSlot.groupSlotList.push(groupSlot);

        for (let ts = 0; ts < groupSlotContract.tokenSlotList.length; ++ts) {
          let tokenSlotContract = groupSlotContract.tokenSlotList[ts];
          let tokenSlot = new TokenSlot();

          tokenSlot.tokenTemplate = TokenTemplate.newStorageOne(
            tokenSlotContract.tokenTemplate.erc,
            tokenSlotContract.tokenTemplate.token,
            tokenSlotContract.tokenTemplate.valueList
          );

          tokenSlot.rule = tokenSlotContract.rule;

          for (let io = 0; io < tokenSlotContract.ioAddressList.length; ++io) {
            tokenSlot.ioAddressList[io] = tokenSlotContract.ioAddressList[io];
            tokenSlot.valueList[io] = tokenSlotContract.valueList[io];
          }

          tokenSlot.tokenTemplate.restore();
          await tokenSlot.bitDecode();

          groupSlot.tokenSlotList.push(tokenSlot);
        }

      }
      ruleSlotList.push(ruleSlot);
      cluster.ruleSlotList.push(ruleSlot);
    }

    for (let i = 0; i < cluster.ruleSlotList.length; ++i) {
      cluster.printRuleSlotIndex(cluster.ruleSlotList[i].ruleSlotIndex);
    }

    return ruleSlotList;
  }

  public async getTask(taskId: BigNumberish): Task {

    let task: Task = new Task();
    task.taskId = taskId;

    let taskContract: Task = await this.stateCounter.get(taskId);

    task.caller = taskContract.caller;
    task.clusterArea = taskContract.clusterArea;
    task.lastHandler = taskContract.lastHandler;
    //32:blocknumberExecute 32:blocknumber 32:timestampExecute 32:timestamp
    task.value = taskContract.value;
    task.valueTime = taskContract.valueTime;

    //32:clusterId 8:TaskSate  32:taskId
    task.taskId = taskContract.taskId;
    task.parentTaskId = taskContract.parentTaskId;
    task.clusterId = taskContract.clusterId;
    task.state = taskContract.state;
    task.args = taskContract.args;

    task.inTokenList = [];

    for (let i = 0; i < taskContract.inTokenList.length; ++i) {
      let token = new Token();
      token.copy(taskContract.inTokenList[i]);
      task.inTokenList[i] = token;
    }

    await task.bitDecode();

    return task;
  }

  //check contact whether exist in PoolContract
  public async getPoolContractDeployer(contractAddress: string): string {
    let deployer = await this.poolContract.deployer(contractAddress);
    log.debug("getPoolContractDeployer", "contract", contractAddress,
      "deployer", deployer, "owner", this.owner.address,
      `owner is${this.owner.address == deployer ? "" : " not"} deployer?`);
    return deployer;
  }

  public async calSwapInput(
    cluster: Cluster,
    ruleSlotIndexInput: BigNumberish,
    groupInputBranch: BigNumberish,
    multiple: BigNumberish,
    inTokenList: Token[],
    exceedRate: BigNumberish,
    callBack?: Callback): [] {

    let ruleSlot: RuleSlot;

    for (let d = 0; d < cluster.ruleSlotList.length; ++d) {
      if (cluster.ruleSlotList[d].ruleSlotIndex == ruleSlotIndexInput) {
        ruleSlot = cluster.ruleSlotList[d];
        break;
      }
    }

    let groupSlot = null;
    let j = 0;
    for (; j < ruleSlot.groupSlotList.length; ++j) {
      let gs: GroupSlot = ruleSlot.groupSlotList[j];

      if (gs.branch == groupInputBranch) {
        groupSlot = gs;
        break;
      }
    }
    let times = inTokenList.length / groupSlot.tokenSlotList.length;

    for (let t = 0; t < times; ++t) {
      for (let s = 0; s < groupSlot.tokenSlotList.length; ++s) {
        let k = t * groupSlot.tokenSlotList.length + s;

        let tokenSlot: TokenSlot = groupSlot.tokenSlotList[s];
        let inToken = inTokenList[k];

        if (tokenSlot.tokenTemplate.getType() == TOKEN_TEMPLATE_TYPE.SWAP_V2) {

          let amountRange: BigNumberish[] = await this.engineView.swapQuoteTokenTemplate(tokenSlot.tokenTemplate);
          inToken.amount = amountRange[1].sub(amountRange[0]).mul(exceedRate).div(10000).add(amountRange[0]);

          tokenSlot.tokenTemplate.amount = amountRange[0];
          tokenSlot.tokenTemplate.amountEnd = amountRange[1];
        }
      }
    }
  }

  //APPROVE.ALL  ERC1155 setApprovalForAll , ERC20 approve exact tokens , ERC721 setApprovalForAll
  //APPROVE.ONCE ERC1155 setApprovalForAll , ERC20 approve exact tokens , ERC721 approve exact tokenId
  public async checkInput(
    cluster: Cluster,
    ruleSlotIndexInput: BigNumberish,
    groupInputBranch: BigNumberish,
    multiple: BigNumberish,
    inTokenList: Token[],
    approve: APPROVE,
    callBack?: Callback,
    attrSumMode?: number = ATTRIBUTE_SUB_SUM_MODE.PERCENT_FIRST
  ): MessageListInput {
    let msgList = await engineCheck.checkInput(this, cluster, ruleSlotIndexInput, groupInputBranch, multiple, inTokenList, approve, callBack,attrSumMode);
    return msgList;
  }

  //check output branch token are conformed.
  //user : check before inputing tokens to call engine
  public async checkOutput(cluster: Cluster, ruleSlotIndexInput: BigNumberish, ruleSlotIndexOutput: BigNumberish) {
    return await engineCheck.checkOutput(this, cluster, ruleSlotIndexInput, ruleSlotIndexOutput);
  }

  //check cluster before addRule
  public async checkCluster(cluster: Cluster, approve?: boolean, callBack?: Callback) {
    return await engineCheck.checkCluster(this, cluster, approve, callBack);
  }

  //addRule true ,use for adding cluster check
  //addRule false, user for calling engine
  public async checkGroupSlot(groupSlotIndex: number, cluster: Cluster, groupSlot: GroupSlot, isOutput: boolean, addRule: boolean, approve: boolean, callBack?: Callback): [] {
    return await engineCheck.checkGroupSlot(this, groupSlotIndex, cluster, groupSlot, isOutput, addRule, approve, callBack);
  }

  public async checkRuleSlot(cluster: Cluster, ruleSlot: GroupSlot[], approve: boolean, callBack?: Callback): [] {
    return await engineCheck.checkRuleSlot(this, cluster, ruleSlot, approve, callBack);
  }

  public async checkRule(rule: Rule, cluster?: Cluster, approve?: boolean, callBack?: Callback): [] {
    return await engineCheck.checkRule(this, rule, cluster, approve, callBack);
  }

  //poolFee
  public async getFeeState(handler: string) {
    let state = await this.poolFee.getHandlerFeeState(handler);

    log.debug();
    log.debug("getHandlerFeeState", "handler", state.handler, "name", state.name, "description", state.description, "state", state.state, "callCount", state.callCount.toString());
    log.debug("getHandlerFeeState", "deployer", state.deployer, "minGasFee", state.minGasFee.toString(), "gasFeeRate", state.gasFeeRate.toString(), "earning", D18(state.earning).toString());
  }

  public async getFeeEarning(handler: string) {
    let earning = await this.poolFee.handlerEarning(handler);
    log.debug("getFeeEarning", "handler", handler, "earning", D18(earning).toString());
    return earning;
  }

  public async getFeeClusterAdminDeposit(admin: string) {
    let deposit = await this.poolFee.clusterAdminDeposit(admin);
    log.debug();
    log.debug("handlerClusterAdminDeposit", "admin", admin, "deposit", D18(deposit).toString());
    return deposit;
  }

  public async feePoolFeeUpdate(handler: string, minGasFee: BigNumberish, gasFeeRate: BigNumberish):Promise<Event> {
    log.debug("feePoolFeeUpdate", "handler", handler, "minGasFee", minGasFee, "gasFeeRate", gasFeeRate);
    let tx = await this.poolFee.connect(this.owner).updateHandler(handler, minGasFee, gasFeeRate);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async feeDepositCluster(clusterId: BigNumberish, value: BigNumberish):Promise<Event> {
    log.debug("feeDepositCluster", "clusterId", clusterId, "value", value.toString());
    let overrides = {
      gasLimit: 8000000,
      value: value
    };

    let tx = await this.poolFee.connect(this.owner).depositCluster(clusterId, overrides);
    let receipt = await tx.wait();
    Helper.printTx("feeDepositCluster", receipt);
    let event = new Event();
    event.receipt = receipt;
    return event;
  }


  public async feeWithdraw(handler: string, value: BigNumberish):Promise<Event> {
    log.debug("feeWithdraw", "handler", handler, "value", D18(value).toString());
    let tx = await this.poolFee.connect(this.owner).withdrawHandler(handler, value);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async feeWithdrawClusterAdminDeposit(value: BigNumberish):Promise<Event> {
    log.debug("feeWithdrawClusterAdminDeposit", "value", D18(value).toString());
    let tx = await this.poolFee.connect(this.owner).withdrawClusterAdminDeposit(value);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async waitBlock(address: string | Signer = undefined, blockCount: number = 3) {
    let blockStart = await this.hubChain.getLatestBlockHeight(this.owner);
    let beginTime = new Date().getTime();
    while (true) {
      let nowTime = new Date().getTime();
      let intervalTime = nowTime - beginTime;
      if (intervalTime > 1000) {
        beginTime = nowTime;
      } else {
        continue;
      }

      if (address != undefined) {
        for (let i = 0; i <= blockCount; ++i) {
          await this.hubChain.sendTx(this.owner, address, 0.000001);
        }
      }

      let blockEnd = await this.hubChain.getLatestBlockHeight(this.owner);
      let interval = blockEnd - blockStart;

      log.debug("waitBlock", "start", blockStart, "end", blockEnd, "interval", interval);
      if (interval > 3) {
        break;
      }
    }
  }


  //attribute list
  public async setClusterAttrStateList(clusterId: BigNumberish, attrIdList: BigNumberish[], stateList: BigNumberish[]):Promise<Event> {
    log.debug("setClusterAttrStateList", "clusterId", clusterId, "attrIdList.length", attrIdList.length);
    let tx = await this.clusterAttributeArea.setClusterAttrStateList(clusterId, ZERO_ADDRESS, attrIdList, stateList);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async setTokenAttrStateList(token: string, attrIdList: BigNumberish[], stateList: BigNumberish[]):Promise<Event> {
    log.debug("setTokenAttrStateList", "token", token, "attrIdList.length", attrIdList.length);
    let tx = await this.clusterAttributeArea.setClusterAttrStateList(0, token, attrIdList, stateList);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async getClusterAttrStateList(clusterId: BigNumberish, attrIdList: BigNumberish[]): BigNumberish[] {
    let stateList = await this.clusterAttributeArea.getClusterAttrStateList(clusterId, ZERO_ADDRESS, attrIdList);
    for (let i = 0; i < attrIdList.length; ++i) {
      log.debug("getClusterAttrStateList", "attrId", attrIdList[i], "state", stateList[i]);
    }
  }

  public async getTokenAttrStateList(token: string, attrIdList: BigNumberish[]): BigNumberish[] {
    let stateList = await this.clusterAttributeArea.getClusterAttrStateList(0, token, attrIdList);
    for (let i = 0; i < attrIdList.length; ++i) {
      log.debug("getTokenAttrStateList", "attrId", attrIdList[i], "state", stateList[i]);
    }
  }

  public async getClusterAttrList(clusterId: BigNumberish, attrIdList: BigNumberish[]): Attribute[] {
    let attributeList: Attribute[] = await this.clusterAttributeArea.getClusterAttrList(clusterId, ZERO_ADDRESS, attrIdList);
    for (let i = 0; i < attributeList.length; ++i) {
      let attribute = new Attribute();
      attribute.copy(attributeList[i]);

      log.debug("getClusterAttrList-" + i, "clusterId", clusterId, "desc", attribute.desc());
    }
    return attributeList;
  }

  public async getTokenAttrList(token: string, attrIdList: BigNumberish[]): Attribute[] {
    let attributeList: Attribute[] = await this.clusterAttributeArea.getClusterAttrList(0, token, attrIdList);

    for (let i = 0; i < attributeList.length; ++i) {
      let attribute = new Attribute();
      attribute.copy(attributeList[i]);
      log.debug("tokenAttrList-" + i, "token", token, attribute.desc());
    }
  }

  public async updateClusterAttrList(clusterId: BigNumberish, attrList: Attribute[]):Promise<Event> {
    let attrStateList: BigNumberish[] = [];
    for (let i = 0; i < attrList.length; ++i) {
      attrStateList.push(attrList[i].state);
    }

    log.debug("updateClusterAttrList", "clusterId", clusterId, "attrList.length", attrList.length);
    let tx = await this.clusterAttributeArea.updateClusterAttrList(this.owner.address, clusterId, ZERO_ADDRESS, attrList, attrStateList);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async updateTokenAttrList(token: string, attrList: Attribute[]):Promise<Event> {
    let attrStateList: BigNumberish[] = [];
    for (let i = 0; i < attrList.length; ++i) {
      attrStateList.push(attrList[i].state);
    }

    log.debug("updateTokenAttrList", "token", token, "attrList.length", attrList.length);
    let tx = await this.clusterAttributeArea.updateClusterAttrList(this.owner.address, 0, token, attrList, attrStateList);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async updateClusterTokenIdAttrList(clusterId: BigNumberish, tokenAttrListList: TokenAttributeList[]):Promise<Event> {
    log.debug("updateClusterTokenIdAttrList", "clusterId", clusterId, "tokenAttrListList.length", tokenAttrListList.length);
    let tx = await this.clusterAttributeAreaToken.updateClusterTokenIdAttrList(clusterId, tokenAttrListList);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  public async updateTokenIdAttrList(tokenAttrListList: TokenAttributeList[]):Promise<Event> {
    log.debug("updateTokenIdAttrList", tokenAttrListList.length);
    let tx = await this.clusterAttributeAreaToken.updateClusterTokenIdAttrList(0, tokenAttrListList);
    let receipt = await tx.wait();
    let event = new Event();
    event.receipt = receipt;
    return event;
  }

  private parseTokenAttrByAttrId(attrList:Attribute.Attribute[],attrId:number):Attribute.Attribute {
    for(let i = 0; i < attrList.length; ++i){
      if(attrList[i].attrId == attrId){
        return attrList[i];
      }
    }
    return null;
  }

  public async sumAttrAmount(clusterId: BigNumberish, token: string, tokenId: BigNumberish, attrId: BigNumberish,mode:ATTRIBUTE_SUB_SUM_MODE = ATTRIBUTE_SUB_SUM_MODE.AMOUNT_FIRST):Promise<number> {
    return await this.clusterAttributeAreaToken.sumAttrAmount(mode,clusterId,token,tokenId,attrId);
  }

  public async sumMountingAttrAmount(clusterId: BigNumberish, token: string, tokenId: BigNumberish, attrId: BigNumberish,mode:ATTRIBUTE_SUB_SUM_MODE = ATTRIBUTE_SUB_SUM_MODE.AMOUNT_FIRST,layerCount:number=0):Promise<number> {
    return await this.clusterAttributeAreaToken.sumMountingAttrAmount(mode,layerCount,clusterId,token,tokenId,attrId);
  }

  public async getTokenAttrIdList(clusterId: BigNumberish, tokenList: Token[]):Promise<TokenAttributeList[]> {
    let attrIdList: [] = await this.clusterAttributeArea.getClusterAttrIdList(clusterId, ZERO_ADDRESS);

    let attrList: Attribute.Attribute[] = await this.clusterAttributeArea.getClusterAttrList(clusterId, ZERO_ADDRESS, attrIdList);

    let funcList = [];

    for (let i = 0; i < tokenList.length; ++i) {
      let token = tokenList[i];
      funcList.push(new MultiFunc(this.clusterAttributeAreaToken, "getClusterTokenAttrIdList", [clusterId, token.token, token.id]));
    }

    let resCallTokenParentAttrIds = await this.multiCall.call(funcList);//get all first level attrIds of token

    let tokenParentAttrIdList = [];
    funcList = [];
    for (let k = 0; k < resCallTokenParentAttrIds.length; ++k) {

      let token = tokenList[k].token;
      let tokenId = tokenList[k].id;
      let parentAttrIdList = resCallTokenParentAttrIds[k][0];//first level attribute of each nft


      for (let c = 0; c < parentAttrIdList.length; ++c) {
        funcList.push(new MultiFunc(this.clusterAttributeAreaToken, "getClusterTokenSubAttrIdList", [clusterId, token, tokenId, parentAttrIdList[c]]));
      }

      tokenParentAttrIdList.push(parentAttrIdList);
    }

    let resCallSubAttrIdList = await this.multiCall.call(funcList);//all subAttrId of all parent attrIds : [3,4,5] / [7,8]

    funcList = [];
    let callIndex = 0;
    let optTokenList = [];
    let optLengthList = [];
    for (let k = 0; k < tokenParentAttrIdList.length; ++k) {
      let parentAttrIdList = tokenParentAttrIdList[k];

      let token = tokenList[k].token;
      let tokenId = tokenList[k].id;

      if(parentAttrIdList.length > 0){
        for (let p = 0; p < parentAttrIdList.length; ++p) {
          let parentAttrId = parentAttrIdList[p];
          funcList.push(new MultiFunc(this.clusterAttributeAreaToken, "getClusterTokenAttrOpt", [clusterId, token, tokenId, 0, parentAttrId]));
          let subAttrIdList = resCallSubAttrIdList[callIndex++][0];
          for (let c = 0; c < subAttrIdList.length; ++c) {
            funcList.push(new MultiFunc(this.clusterAttributeAreaToken, "getClusterTokenAttrOpt", [clusterId, token, tokenId, parentAttrId, subAttrIdList[c]]));
          }

          optTokenList.push(tokenList[k]);
          optLengthList.push(subAttrIdList.length + 1);//parent + all sub attributes
        }
      }
      else {
        optTokenList.push(tokenList[k]);
        optLengthList.push(0);
      }
    }

    let resCallAttrIdOpt = await this.multiCall.call(funcList);//parent + all sub attributes

    log.debug("tokenAttrId", "clusterId", clusterId);

    let tokenAttrListArray:TokenAttributeList[] = [];

    callIndex = 0;
    for (let cl = 0; cl < optLengthList.length; ++cl) {
      let optLength = optLengthList[cl];
      let optToken = optTokenList[cl];

      let tokenAttrList;
      let n = 0;
      for(; n < tokenAttrListArray.length; ++n){
        let tokenAttrListOne = tokenAttrListArray[n];
        if(tokenAttrListOne.token.toLowerCase() == optToken.token.toLowerCase()
          && tokenAttrListOne.erc == optToken.erc
          && tokenAttrListOne.tokenId == optToken.id
        ){
          tokenAttrList = tokenAttrListOne;
          break;
        }
      }

      if(n >= tokenAttrListArray.length){
        tokenAttrList = TokenAttributeList.new(optToken.token,optToken.erc,optToken.id,[]);
        tokenAttrList.token = optToken.token;
        tokenAttrList.erc = optToken.erc;
        tokenAttrList.tokenId = optToken.id;
        tokenAttrListArray.push(tokenAttrList);
      }

      if(optLength > 0){
        let attrOpt:AttributeOpt = new AttributeOpt();
        attrOpt.token = optToken.token;
        attrOpt.erc = optToken.erc;
        attrOpt.id = optToken.id;
        attrOpt.state = AttributeOptState.Normal;
        attrOpt.copy(resCallAttrIdOpt[callIndex++][0]);

        let attr:Attribute.Attribute = this.parseTokenAttrByAttrId(attrList,attrOpt.attrId);
        attrOpt.attrUri = attr.uri;
        attrOpt.attrSymbol = attr.symbol;
        attrOpt.attrName = attr.name;
        attrOpt.attrLevel = attr.level;

        for (let i = 1; i < optLength; ++i) {
          let attrOptChild: AttributeOpt = new AttributeOpt();
          attrOptChild.copy(resCallAttrIdOpt[callIndex++][0]);
          attrOptChild.token = optToken.token;
          attrOptChild.erc = optToken.erc;
          attrOptChild.id = optToken.id;

          let attrChild:Attribute.Attribute = this.parseTokenAttrByAttrId(attrList,attrOptChild.attrId);
          attrOptChild.attrUri = attrChild.uri;
          attrOptChild.attrSymbol = attrChild.symbol;
          attrOptChild.attrName = attrChild.name;
          attrOptChild.attrLevel = attrChild.level;

          attrOpt.children.push(attrOptChild);
        }

        console.log(attrOpt.desc(true, attrList));

        tokenAttrList.attributeOptList.push(attrOpt);
      }
    }

    for(let i = 0; i < tokenAttrListArray.length; ++i){
      let tokenAttrList:TokenAttributeList = tokenAttrListArray[i];
      tokenAttrList.attributeOptList.sort(function(a, b){
        return a.attrId - b.attrId;
      });
    }

    console.log();
    return tokenAttrListArray;
  }

  //mounting
  public async getTokenMountingList(clusterId: BigNumberish, tokenList: Token[]) {
    console.log();
    let funcList = [];

    for (let i = 0; i < tokenList.length; ++i) {
      let token = tokenList[i];
      funcList.push(new MultiFunc(this.clusterMountingArea, "getTokenMountingList", [clusterId, token.token, token.id]));
    }

    let resCall = await this.multiCall.call(funcList);

    let tokenMountingListList = [];
    for (let k = 0; k < resCall.length; ++k) {
      let token = tokenList[k];
      let parentDesc;
      if (token.erc == ERC.ERC721) {
        parentDesc = "----------- mounting " + token.token + " ERC721-#" + token.id + "*" + token.amount;
      } else if (token.erc == ERC.ERC1155) {
        parentDesc = "----------- mounting ERC1155 " + token.token + "#" + token.id + "*" + token.amount;
      }
      console.log(parentDesc);
      let tmList = resCall[k][0];
      let tokenMountingList = [];
      for (let c = 0; c < tmList.length; ++c) {
        let tm = new TokenMounting();
        tm.erc = tmList[c].erc;
        tm.token = tmList[c].token;
        tm.id = tmList[c].id;
        tm.amount = tmList[c].amount;
        tokenMountingList.push(tm);
        console.log("--------------------", tm.desc());
      }

      tokenMountingListList.push(tokenMountingList);
    }

    log.debug();

    return tokenMountingListList;
  }
}
