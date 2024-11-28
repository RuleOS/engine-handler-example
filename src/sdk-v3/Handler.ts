//@ts-nocheck
import { AllocateHandler, IHandler, IHandler__factory } from "../../engine-typechain";
import { Signer } from "ethers";
import { Engine } from "./Engine";
import { getLogger, Helper, ILogger, RLP } from "./util";
import { BaseHandler } from "./handler/";
import { ZERO_ADDRESS } from "./struct";
import { BytesLike } from "@ethersproject/bytes";

let logger: ILogger = getLogger();
let rlp = require("rlp");

export const ALLOCATE_HANDLER = "AllocateHandler"
export const ALLOCATE_RELATION_HANDLER = "AllocateRelationHandler"
export const ALLOCATE_LAYER_HANDLER = "AllocateLayerHandler"
export const ALLOCATE_LIMIT_HANDLER = "AllocateLimitHandler"
export const MINE_HANDLER = "MineHandler"
export const RESTRICT_HANDLER = "RestrictHandler"
export const WHITELIST_HANDLER = "WhiteListHandler"
export const RANKING_HANDLER = "RankingHandler"
export const GOV_HANDLER = "GovHandler"

export const PRE_HANDLER = "PreHandler"
export const PROCESS_HANDLER = "ProcessHandler"
export const POST_HANDLER = "PostHandler"


export class HandlerState {
  clusterId:number = 0;// params.clusterId,
  ruleSlotIndexInput:number = 0;// params.ruleSlotIndexInput,
  ruleSlotIndexOutput:number = 0;// params.ruleSlotIndexOutput,
  branch:number = 0;//params.branch,
  taskId:number = 0;// params.taskId,
  cmd:number = 0;// params.cmd,
  args:BytesLike = "0x";// params.args
}

export class HandlerStateFull extends HandlerState{
  engine:string = ZERO_ADDRESS;// this.engine.address,
  clusterArea:string= ZERO_ADDRESS;// this.engine.clusterArea.address,
  stateCounter:string= ZERO_ADDRESS;// this.engine.stateCounter.address,
  caller:string= ZERO_ADDRESS;// this.owner.address,

}


export class Handler {

  engine:Engine;
  owner:Signer;

  private handlerMap:Map<string,IHandler> = new Map<string, IHandler>();
  private nameAddressMap:Map<string,string> = new Map<string, string>();
  private addressNameMap:Map<string,string> = new Map<string, string>();
  private nameTHandlerMap:Map<string,BaseHandler> = new Map<string, BaseHandler>();

  constructor(owner:Signer,engine:Engine) {
    this.owner = owner;
    this.engine = engine;
  }


  async load(name:string,address:string) {
    this.nameAddressMap.set(name,address);
    this.addressNameMap.set(address,name);
    let handler = await IHandler__factory.connect(address, this.owner);
    this.handlerMap.set(name,handler);
  }

  async loadAll(handlerList:BaseHandler[]) {

    for(let i = 0; i < handlerList.length; ++i){
      await this.load(handlerList[i].name,handlerList[i].address);
      await this.nameTHandlerMap.set(handlerList[i].name,handlerList[i]);
    }
  }

  handler(name:string):IHandler {
    return this.handlerMap.get(name);
  }

  address(name:string):string {
    return this.nameAddressMap.get(name);
  }

  name(address:string):string {
    return this.addressNameMap.get(address);
  }

  addressToHandler(address:string):IHandler {
    let handlerName = this.addressNameMap.get(address);
    return this.handlerMap.get(handlerName);
  }

  addressToTHandler(address:string):BaseHandler {
    let handlerName = this.addressNameMap.get(address);
    return this.nameTHandlerMap.get(handlerName);
  }

  async state(name:string,params:HandlerState,log?:boolean):Map<string, any> {

    let paramsFull = {
      engine: this.engine.address,
      clusterArea: this.engine.clusterArea.address,
      clusterId: params.clusterId,
      ruleSlotIndexInput: params.ruleSlotIndexInput,
      ruleSlotIndexOutput: params.ruleSlotIndexOutput,
      branch:params.branch,
      stateCounter: this.engine.stateCounter.address,
      taskId: params.taskId,
      caller: this.owner.address,
      cmd: params.cmd,
      args: Helper.rlp(params.args)
    };

    if(params.caller){
      paramsFull.caller = params.caller;
    }

    let stateList = await this.handler(name).getState(paramsFull);

    return Handler.stateFullParams(name, stateList,paramsFull,log);
  }


  static async staticState(handlerAddress:string,owner:Signer,params:HandlerStateFull,log?:boolean):Map<string, any> {

    let handler=IHandler__factory.connect(handlerAddress,owner);
    let stateList = await handler.getState(params)

    let name = await handler.cname();

    return Handler.stateFullParams(name,stateList,params,log);
  }



  private static async stateFullParams(name:string,stateList:[],params:HandlerStateFull,log?:boolean):Map<string, any> {

    if (log) {
      logger.debug(`${name} State`, stateList);
      logger.debug();

      logger.debug(`${name} State`,
        "engine", params.engine,
        "clusterArea", params.clusterArea,
        "caller", params.caller);
      logger.debug();
      logger.debug(`${name}-State`,
        "clusterId", params.clusterId,
        "ruleSlotIndexInput", params.ruleSlotIndexInput,
        "ruleSlotIndexOutput", params.ruleSlotIndexOutput,
        "taskId",params.taskId,
        "cmd",params.cmd,
        "args",params.args
      );
    }

    let state = {};

    let resLog = "\n";
    for(let i = 0; i < stateList.length; ++i){

      let decodeArgs = rlp.decode(stateList[i]);
      let argValue = RLP.from(decodeArgs);

      state[argValue.name] = argValue.value;

      if (log) {
        resLog += `----- ${name} State ---- ` + argValue.name + " ("+argValue.type+") " + argValue.value +"\n";
      }
    }

    if(log){
      logger.debug(`${name} State`,resLog);
      logger.debug();
    }
    return state;
  }

}
