//@ts-nocheck
import { Signer } from "ethers";
import { Engine } from "../Engine";

export class BaseLib {

  owner:Signer;
  engine:Engine;
  folder:string;

  lib:any;

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

  public async load(folderOrAddress?:string):BaseLib{

  }

  public async deploy(folder?:string,override?:boolean,overrides?:{}):BaseLib{

  }

  public async upgrade(folder?: string = undefined){

  }

}
