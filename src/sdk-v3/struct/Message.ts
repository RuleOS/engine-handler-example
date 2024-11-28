// @ts-nocheck

import { ERC, MSG_LEVEL, MSG_TYPE } from "./Constant";
import { getLogger, ILogger } from "../util/Log";
import { BigNumberish } from "ethers";
import { TokenSlot } from "./TokenSlot";
import { AttributeOpt, TokenAttributeList } from "./Attribute";

let log: ILogger = getLogger();

String.prototype.format = function(args) {
  if (arguments.length > 0) {
    let result = this;
    if (arguments.length == 1 && typeof (args) == "object") {
      for (let key in args) {
        let reg = new RegExp("({" + key + "})", "g");
        result = result.replace(reg, args[key]);
      }
    } else {
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] == undefined) {
          return "";
        } else {
          let reg = new RegExp("({[" + i + "]})", "g");
          result = result.replace(reg, arguments[i]);
        }
      }
    }
    return result;
  } else {
    return this;
  }
};

export class MessageList {
  name: string;
  msgList: Message[] = [];

  constructor(name: string) {
    this.name = name;
  }

  public add(msg: Message) {
    for (let i = 0; i < this.msgList.length; ++i) {
      if (msg.code == this.msgList[i].code && msg.index == this.msgList[i].index && msg.type == this.msgList[i].type) {
        return;
      }
    }
    this.msgList.push(msg);
  }

  public addList(msgList: Message[]) {
    for (let i = 0; i < msgList.length; ++i) {
      this.add(msgList[i]);
    }
  }

  public length() {
    return this.msgList.length;
  }

  public print() {
    for (let i = 0; i < this.msgList.length; ++i) {
      let message = this.msgList[i];
      if (message.printed) {
        continue;
      }
      let params = [`msg-${this.name}-${i}`
        , "code", message.code
        , "msg", message.msg
        , "type", message.type
        , "address", message.address];
      message.code == 200 ? log.debug(...params) : log.error(...params);
      message.printed = true;
    }
  }
}

export enum InputTokenStateEnum {
  None=0,
  NotApproved = 1,
  BalanceNotEnough = 2,
  AttributeNotEnough = 4
}


export class InputTokenState {
  state:number = 0;
  address:string;
  erc:number;
  id:BigNumberish;
  amountStd:BigNumberish;
  amountInput:BigNumberish;
  tokenSlot:TokenSlot;
  user:string;
  owner:string;//erc721 or erc1155 id's owner
  balance:BigNumberish; // erc20 , erc1155 balance ; erc721 1 owned , 0 not owned
  attrOptList:AttributeOpt[] = []

  print(){
    console.log("------ InputTokenState -----");
    console.log("state",this.state);
    console.log("address",this.address);
    console.log("erc",this.erc);
    console.log("id",this.id?this.id.toString():this.id);
    console.log("amountStd",this.amountStd ? this.amountStd.toString() : this.amountStd);
    console.log("amountInput",this.amountInput ? this.amountInput.toString(): this.amountInput);
    console.log("user",this.user);
    console.log("owner",this.owner);
    console.log("balance",this.balance ? this.balance.toString() : this.balance);
  }
}

export class MessageListInput extends MessageList{

  inputTokenStateList:InputTokenState[][] = [];

  addInputTokenState(round:number,inputTokenState:InputTokenState){
    if(!this.inputTokenStateList[round]){
      this.inputTokenStateList[round] = [];
    }
    this.inputTokenStateList[round].push(inputTokenState);
  }

  getInputTokenState(round:number,tokenIndex:number):InputTokenState{
    return this.inputTokenStateList[round][tokenIndex];
  }

  getInputTokenStateList(token:string,id:number,required:number):InputTokenState[]{
    let list = [];
    for(let round = 0; round < this.inputTokenStateList.length; ++round){
      let tokenStateList = this.inputTokenStateList[round];
      for(let i = 0;i < tokenStateList.length; ++i){
        let tokenState = tokenStateList[i];
        if(tokenState.address.toLowerCase() == token.toLowerCase()){
          if(tokenState.tokenSlot.tokenTemplate.erc == ERC.COIN || tokenState.tokenSlot.tokenTemplate.erc == ERC.ERC20){
              if(tokenState.tokenSlot.tokenTemplate.amountRequired == required){
                list.push(tokenState);
              }
          }
          else if(tokenState.tokenSlot.tokenTemplate.erc == ERC.ERC1155){
            if(tokenState.id == id && tokenState.tokenSlot.tokenTemplate.idRequired == required){
              list.push(tokenState);
            }
          }
          else {
            list.push(tokenState);
          }
        }
      }
    }

    return list;
  }

  setInputTokenState(tokenState:InputTokenState,state:number,balance:BigNumberish){
    if(state){
      if(tokenState.state == InputTokenStateEnum.None
        || tokenState.state == InputTokenStateEnum.NotApproved && state ==  InputTokenStateEnum.BalanceNotEnough
        || tokenState.state == InputTokenStateEnum.BalanceNotEnough && state ==  InputTokenStateEnum.NotApproved
        || tokenState.state < InputTokenStateEnum.AttributeNotEnough && state == InputTokenStateEnum.AttributeNotEnough
      ){
        tokenState.state += state;
      }
    }

    if(balance){
      tokenState.balance = balance;
    }
  }

  setInputTokenStateList(tokenStateList:InputTokenState[],state:number,balance:BigNumberish){
    for(let i = 0; i < tokenStateList.length; ++i){
      let tokenState = tokenStateList[i];
      this.setInputTokenState(tokenState,state,balance);
    }
  }

}

export class Message {
  index: number;
  code: number;
  type: MSG_TYPE;
  level: MSG_LEVEL;
  address: string = "";
  msg: string = "";
  printed: boolean = false;
  callback: any;

  msgArgs: [];

  constructor(index: number, code: number, type: MSG_TYPE, level: MSG_LEVEL, address: string, msg: string, msgArgs: [] = []) {
    this.index = index;
    this.code = code;
    this.type = type;
    this.level = level;
    this.address = address;
    this.msg = msg;
    this.msgArgs = msgArgs;
  }

  public addCallback(callback): Message {
    this.callback = callback;
    return this;
  }
}

function newBase(code: number, type: MSG_TYPE, level: MSG_LEVEL, msg: string): Message {
  return new Message(0, code, type, level, "0x", msg ? msg : "", []);
}

export function from(base: Message, index: number, address: string, msgArgs: string[]): Message {
  if (!msgArgs) {
    msgArgs = [""];
  }

  return new Message(index, base.code, base.type, base.level, address, base.msg.format(...msgArgs), msgArgs);
}

export function rewrite(base: Message, index: number, address: string, msg: string, msgArgs?: []): Message {
  if (!msgArgs) {
    msgArgs = [""];
  }
  return new Message(index, base.code, base.type, base.level, address, msg.format(...msgArgs), msgArgs);
}

export const _200 = newBase(200, MSG_TYPE.NONE, MSG_LEVEL.NORMAL, "{0}");


export const _301 = newBase(301, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "Cluster State is {0}");
export const _302 = newBase(302, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "Cluster groupInputBranch not found {0}");
export const _303 = newBase(303, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "inTokenList.length must times groupSlot.tokenSlotList.length");
export const _304 = newBase(304, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "cluster.ruleSlot is empty");

export const _400 = newBase(400, MSG_TYPE.TOKEN, MSG_LEVEL.REQUIRED, "{0}");
export const _401 = newBase(401, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} check owner ERC721:{1} tokenId {2} non exist");
export const _402 = newBase(402, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0}----set approval ERC721:user {1} in {2} fail to setApprovalForAll.{3}");
export const _403 = newBase(403, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0}----set approve ERC721:user {1} in {2} fail to approve tokenId {3}.{4}");
//user input tx
export const _404 = newBase(404, MSG_TYPE.TOKEN, MSG_LEVEL.REQUIRED, "ERC721 {0} approve {1} to OS {2}, {3}");

export const _405 = newBase(405, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0}----check owner ERC721:{1} owner is {2}, my address {3} tokenId {4}, {5}");

//user input tx
export const _501 = newBase(501, MSG_TYPE.TOKEN, MSG_LEVEL.REQUIRED, "ERC1155 {0} approve {1} to OS {2}, {3}");

export const _502 = newBase(502, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance REQUIRED.TRUE ERC1155#{2}:user {3} in contract {4} balance > amountInput balance {5} less than amountInput {6}, tokenId {7}");
export const _503 = newBase(503, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance REQUIRED.TRUE ERC1155#{2}:user {3} in contract {4} amountInput > amountStd amountInput {5} less than amountStd {6}, tokenId {7}");
export const _512 = newBase(512, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance REQUIRED.EXIST ERC1155#{2}:user {3} in contract {4} balance > amountInput balance {5} less than amountInput {6}, tokenId {7}");
export const _513 = newBase(513, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance REQUIRED.EXIST ERC1155#{2}:user {3} in contract {4} amountInput > amountStd amountInput {5} less than amountStd {6}, tokenId {7}");

//user input tx
export const _600 = newBase(600, MSG_TYPE.TOKEN, MSG_LEVEL.REQUIRED, "Token {0} Approve {1} amounts to OS {2}");

export const _601 = newBase(601, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check approval balance REQUIRED.TRUE ERC20:user {2} in contract {3} has not approved to engine enough token. amountStd needed {4} less than allowance {5}");
export const _602 = newBase(602, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check approval REQUIRED.TRUE balance ERC20:user {2} in contract {3} has not approved to engine enough token. allowance {4} less than amountInput {5}");
export const _603 = newBase(603, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check approval REQUIRED.TRUE balance ERC20:user {2} in contract {3} has not enough balance token. balance {4} less than amountInput {5}");
export const _604 = newBase(604, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check approval REQUIRED.TRUE balance ERC20:user {2} in contract {3} input less token for calling engine. amountInput {4} less than amountStd {5}");
export const _613 = newBase(613, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check approval balance REQUIRED.EXIST ERC20:user {2} in contract {3} has not enough balance token. balance {4} less than amountInput {5}");
export const _614 = newBase(614, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check approval balance REQUIRED.EXIST ERC20:user {2} in contract {3} input less token for calling engine. amountInput {4} less than amountStd {5}");

export const _701 = newBase(701, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance COIN REQUIRED.TRUE:user {2} has not enough balance coin.balance {3} less than amountInput {4}");
export const _702 = newBase(702, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance COIN REQUIRED.TRUE:user {2} input less coin for calling engine. amountInput {3} less than amountStd {4}");
export const _711 = newBase(711, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance COIN REQUIRED.EXIST:user {2} has not enough balance coin. balance {3} less than amountInput {4}");
export const _712 = newBase(712, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "ruleSlotIndex {0} groupSlot {1}----check balance COIN REQUIRED.EXIST:user {2} input less coin for calling engine. amountInput {3} less than amountStd {4}");

export const _750 = newBase(750, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "inTokenList.length > 0 but groupSlotInput.tokenSlotList.length = 0");

export const _350 = newBase(350, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "ruleSlotIndexOutput == ruleSlotIndexInput is illegal");
export const _351 = newBase(351, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "specified rule not exist or disabled.{0}-{1}");

export const _352 = newBase(352, MSG_TYPE.NONE, MSG_LEVEL.ERROR, "ruleSlotIndexOutput or ruleSlotIndexInput is out of range");
export const _353 = newBase(353, MSG_TYPE.HANDLER, MSG_LEVEL.ERROR, "preHandler not available {0} ({1})");
export const _354 = newBase(354, MSG_TYPE.HANDLER, MSG_LEVEL.ERROR, "processHandler not available {0} ({1})");
export const _355 = newBase(355, MSG_TYPE.HANDLER, MSG_LEVEL.ERROR, "postHandler not available {0} ({1})");

export const _490 = newBase(490, MSG_TYPE.POOLTOKEN_INPUT, MSG_LEVEL.ERROR, "GroupSlot {0} PoolToken Contract can't be MINT_DESTROY_ADDRESS, SELF_ADDRESS");
export const _491 = newBase(491, MSG_TYPE.POOLTOKEN_INPUT, MSG_LEVEL.ERROR, "GroupSlot {0} PoolToken Contract {1} hasn't granted CLUSTER_ROLE to you, please contact manager to add you");
export const _492 = newBase(492, MSG_TYPE.POOLTOKEN_INPUT, MSG_LEVEL.ERROR, "GroupSlot {0} PoolToken:{1} is not PoolToken Contract");
export const _493 = newBase(493, MSG_TYPE.POOLTOKEN_INPUT, MSG_LEVEL.ERROR, "GroupSlot {0} PoolToken Address is wrong : {1}");


//poolToken check cluster tx
export const _550 = newBase(550, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0}"); // TRANSFER_ROLE
//poolToken check cluster tx
export const _551 = newBase(551, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0}"); // MINTER_ROLE

export const _552 = newBase(552, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0}, {1} is not PoolToken Contract");
export const _553 = newBase(553, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} PoolToken Contract {1} hasn't granted CLUSTER_ROLE to you, please contact manager to add you");

export const _554 = newBase(554, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} ioAddress is wrong : {1}");

export const _651 = newBase(651, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} token {1} hasn't registered to PoolContract, {2}");
export const _652 = newBase(652, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} token {1} deployer is not the cluster deployer, {2}");

//tx check cluster : token grant role to engine
export const _653 = newBase(653, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} Engine doesn't have MINTER_ROLE on token {1}, {2}");

export const _654 = newBase(654, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} token {1} Coin as output can not be minted, {2}");
export const _655 = newBase(655, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} has no accessControl inheritance {1}");

export const _656 = newBase(656, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} TokenTemplate.Token is wrong : {1}");


export const _751 = newBase(751, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} token {1} is user address, but not deployer of cluster, cluster.deployer:{2}");
export const _752 = newBase(752, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} can not transfer coin from user address to others, {1}");

//tx check cluster : approve
export const _753 = newBase(753, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} ERC20 allowance({1}) < amountEnd({2}), {3}");

//tx check cluster : approve
export const _754 = newBase(754, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} ERC721 owner {1} not approve to engine {2}, {3}");

//tx check cluster : approve
export const _755 = newBase(755, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} ERC1155 owner {1} not approve to engine {2}, {3}");

export const _761 = newBase(761, MSG_TYPE.IO_ADDRESS, MSG_LEVEL.ERROR, "{0} ioAddress {1} is not PoolToken for FunctionCall");


export const _801 = newBase(801, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "{0} swap pair not exist {1},{2}, {3}");

export const _901 = newBase(901, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "tokenSlotIndex {0} calAttrAmount {1}({2}) not in attrId {3}[{4},{5}]");
export const _902 = newBase(902, MSG_TYPE.TOKEN, MSG_LEVEL.ERROR, "tokenSlotIndex {0} attrId {1}[{2},{3}] not exist on this token");
