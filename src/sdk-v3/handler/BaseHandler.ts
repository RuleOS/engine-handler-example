//@ts-nocheck
import { Signer } from "ethers";
import { Engine } from "../Engine";
import { IHandler } from "../../../engine-typechain";
import { Message, Rule, RuleSlot } from "../struct";
import { POST_HANDLER, PRE_HANDLER, PROCESS_HANDLER } from ".";

export class BaseHandler {

  owner:Signer;
  engine:Engine;
  folder:string;

  handler:IHandler;

  name:string;
  address:string;//proxy address

  constructor(owner:Signer,engine:Engine,folder:string) {
    this.owner = owner;
    this.engine = engine;
    this.folder = folder;
  }

  protected overrides(){
    return { gasLimit: 10000000 };
  }

  public async checkCluster(event:string,rule:Rule,ruleSlotInput:RuleSlot,ruleSlotOutput:RuleSlot):Message[]{

    if(event == PRE_HANDLER){

    } else if(event == PROCESS_HANDLER){

    } else if(event == POST_HANDLER){

    }

    return [];
  }


  public async load(folderOrAddress?:string):BaseHandler{

  }

  public async deploy(folder?:string,override?:boolean,overrides?:{}):BaseHandler{

  }

  public async upgrade(folder?: string = undefined){

  }

}
