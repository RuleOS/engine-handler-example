// @ts-nocheck

import { BigNumberish } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import { ATTRIBUTE_SUB_SUM_MODE, ATTRIBUTE_TYPE, BYTES4, ERC, SDK_CHECK } from "./Constant";

let BN = chainHub.Util.BN;


export class Attribute {

  attrId: BigNumberish;
  name: string;
  symbol: string;
  uri: string;
  level: BigNumberish;

  state: BigNumberish;

  children: Attribute[] = [];

  constructor(attrId: BigNumberish, name: string, symbol: string, uri: string, level: BigNumberish, state: BigNumberish) {
    this.attrId = attrId;
    this.name = name;
    this.symbol = symbol;
    this.uri = uri;
    this.level = level;

    this.state = state;
  }

  public static new(attrId: BigNumberish, name: string, symbol: string, uri: string, level: BigNumberish, state: BigNumberish) {
    return new Attribute(attrId, name, symbol, uri, level, state);
  }

  public copy(obj: Attribute) {
    this.attrId = obj.attrId;
    this.name = obj.name;
    this.symbol = obj.symbol;
    this.uri = obj.uri;
    this.level = obj.level;
  }

  public desc(): string {
    let s = "";
    s += "attrId " + this.attrId;
    s += " name " + this.name;
    s += " symbol " + this.symbol;
    s += " level " + this.level;
    return s;
  }
}

export class AttributeRange {
  branch: BigNumberish;
  attrId: BigNumberish;
  attrOpt: BigNumberish;
  attrType: BigNumberish;
  amountBegin: BigNumberish;
  amountEnd: BigNumberish;
  parentAttrId: BigNumberish;
  formula: string = "";


  constructor(attrId: BigNumberish, attrOpt: BigNumberish, attrType: BigNumberish, amountBegin: BigNumberish, amountEnd: BigNumberish, parentAttrId: BigNumberish, formula: string = "", branch: BigNumberish = 0) {
    if (SDK_CHECK) {
      if (BN(attrId).eq(0)) {
        throw Error("attrId " + attrId + " is 0");
      }
      if (BN(amountBegin).gt(BN(amountEnd))) {
        throw Error("attrId " + attrId + " amountBegin > amountEnd");
      }
    }
    this.branch = branch;
    this.attrId = attrId;
    this.attrOpt = attrOpt;
    this.attrType = attrType;
    this.amountBegin = amountBegin;
    this.amountEnd = amountEnd;
    this.parentAttrId = parentAttrId;
    this.formula = formula == "" ? BYTES4 : formula;
  }

  public static new(attrId: BigNumberish, attrOpt: BigNumberish, attrType: BigNumberish, amountBegin: BigNumberish, amountEnd: BigNumberish, parentAttrId: BigNumberish, formula: string = "", branch: BigNumberish = 0) {
    return new AttributeRange(attrId, attrOpt, attrType, amountBegin, amountEnd, parentAttrId, formula, branch);
  }

  public static newMinMax(attrId: BigNumberish, attrOpt: BigNumberish, attrType: BigNumberish, amountBegin: BigNumberish, amountEnd: BigNumberish, branch: BigNumberish = 0) {
    return new AttributeRange(attrId, attrOpt, attrType, amountBegin, amountEnd, 0, "", branch);
  }


  public desc(): string {
    let s = "";
    s += "branch " + this.branch;
    s += " attrId " + this.attrId;
    s += " opt " + this.attrOpt;
    s += " type " + this.attrType;
    s += " amount[" + this.amountBegin;
    s += "," + this.amountEnd;
    s += "] parentAttrId " + this.parentAttrId;
    s += " formula " + this.formula;
    return s;
  }
}


export class TokenAttributeList {
  token: string;
  erc: BigNumberish;
  tokenId: BigNumberish;//tokenId 0 : all tokenId shares
  attributeOptList: AttributeOpt[] = [];

  constructor(token: string, erc: BigNumberish, tokenId: BigNumberish, attributeOptList: AttributeOpt[]) {
    this.token = token;
    this.erc = erc;
    this.tokenId = tokenId;
    this.attributeOptList = attributeOptList;
  }

  public static new(token: string, erc: BigNumberish, tokenId: BigNumberish, attributeOptList: AttributeOpt[]) {
    return new TokenAttributeList(token, erc, tokenId, attributeOptList);
  }

}

export class AttributeIn {
  attrId: BigNumberish;
  attrAmount: BigNumberish;

  constructor(attrId: BigNumberish, attrAmount: BigNumberish) {
    this.attrId = attrId;
    this.attrAmount = attrAmount;
  }

  public static new(attrId: BigNumberish, attrAmount: BigNumberish) {
    return new AttributeIn(attrId, attrAmount);
  }
}

export enum AttributeOptState {
  Normal = 0,
  NotEnough = 4
}

export class AttributeOpt {
  token: string;
  erc: number;
  id: BigNumberish;

  attrId: BigNumberish;
  attrOpt: BigNumberish;
  attrType: BigNumberish;
  attrAmount: BigNumberish;
  attrAmountMin: BigNumberish;
  attrAmountMax: BigNumberish;
  attrText: string;
  parentAttrId: BigNumberish;
  attrState: BigNumberish;
  attrFormula: BigNumberish;

  attrUri:string;
  attrSymbol:string;
  attrName:string;
  attrLevel:number;

  attrAmountBegin: BigNumberish;
  attrAmountEnd: BigNumberish;

  attrSumMode:number;
  attrSumAmount: BigNumberish;

  state:number = 0;//-1 not exist  0 normal 4 out of range

  children: AttributeOpt[] = [];

  constructor(attrId: BigNumberish, attrOpt: BigNumberish, attrType: BigNumberish, attrAmount: BigNumberish, attrText: string, parentAttrId: BigNumberish, attrFormula: string, attrState: BigNumberish) {
    this.attrId = attrId;
    this.attrOpt = attrOpt;
    this.attrType = attrType;
    this.attrAmount = attrAmount;
    this.attrText = attrText;
    this.parentAttrId = parentAttrId;
    this.attrFormula = attrFormula == undefined || attrFormula == "" ? BYTES4 : attrFormula;
    this.attrState = attrState;
  }

  public static new(attrId: BigNumberish, attrOpt: BigNumberish, attrType: BigNumberish, attrAmount: BigNumberish, attrText: string, parentAttrId: BigNumberish, attrFormula: string, attrState: BigNumberish) {
    return new AttributeOpt(attrId, attrOpt, attrType, attrAmount, attrText, parentAttrId, attrFormula, attrState);
  }

  public sumAttrAmount(mode:ATTRIBUTE_SUB_SUM_MODE):BigNumberish{
    let sumAmount:BigNumberish = this.attrAmount;

    let loopCount = 1;
    let loopSubType:number[] = [];
    if(mode == ATTRIBUTE_SUB_SUM_MODE.PERCENT_FIRST){
      loopCount = 2;
      loopSubType.push(ATTRIBUTE_TYPE.DELTA_PERCENT);
      loopSubType.push(ATTRIBUTE_TYPE.DELTA_AMOUNT);
    }
    else if(mode == ATTRIBUTE_SUB_SUM_MODE.AMOUNT_FIRST){
      loopCount = 2;
      loopSubType.push(ATTRIBUTE_TYPE.DELTA_AMOUNT);
      loopSubType.push(ATTRIBUTE_TYPE.DELTA_PERCENT);
    }
    else if(mode == ATTRIBUTE_SUB_SUM_MODE.SEQUENCE){
      loopSubType[0] = ATTRIBUTE_TYPE.NONE;
      this.children.sort(function(a, b){
        if(a.attrId > b.attrId){
          return 1;
        }
        else if(a.attrId < b.attrId){
          return -1;
        }
        return 0;
      });
    }

    for(let l = 0; l < loopCount; ++l){
      for(let i = 0; i < this.children.length; ++i){
        let childAttrOpt:AttributeOpt = this.children[i];

        if(childAttrOpt.attrType == loopSubType[l] || loopSubType[0] == ATTRIBUTE_TYPE.NONE){
          if(childAttrOpt.attrType == ATTRIBUTE_TYPE.DELTA_AMOUNT){
            sumAmount = sumAmount.add(childAttrOpt.attrAmount);
          }
          else if(childAttrOpt.attrType == ATTRIBUTE_TYPE.DELTA_PERCENT){
            sumAmount = sumAmount.mul(childAttrOpt.attrAmount.add(BN(10000))).div(BN(10000));
          }
        }
      }
    }

    return sumAmount;
  }

  public copy(obj: AttributeOpt) {
    this.attrId = obj.attrId;
    this.attrOpt = obj.attrOpt;
    this.attrType = obj.attrType;
    this.attrAmount = obj.attrAmount;
    this.attrAmountMin = obj.attrAmountMin;
    this.attrAmountMax = obj.attrAmountMax;
    this.attrText = obj.attrText;
    this.parentAttrId = obj.parentAttrId;
    this.attrFormula = obj.attrFormula;
    this.attrState = obj.attrState;
  }

  public desc(child: boolean = true, attrList: Attribute[] = []) {

    let tokenDesc = "";
    if (this.erc == ERC.ERC721) tokenDesc = this.token + " ERC721-#" + this.id.toString();
    else if (this.erc == ERC.ERC1155) tokenDesc = this.token + " ERC1155-#" + this.id.toString();


    let attribute: Attribute;
    for (let j = 0; j < attrList.length; ++j) {
      if (this.attrId == attrList[j].attrId) {
        attribute = attrList[j];
        break;
      }
    }

    let s = "------ " + tokenDesc;
    if(attribute){
      s += "------> attrId " + this.attrId + "(" + attribute.name + ")";
    }

    switch (this.attrType) {
      case ATTRIBUTE_TYPE.BALANCE:
        s += " BALANCE";
        break;
      case ATTRIBUTE_TYPE.DELTA_AMOUNT:
        s += " DELTA_AMOUNT";
        break;
      case ATTRIBUTE_TYPE.DELTA_PERCENT:
        s += " DELTA_PERCENT";
        break;
    }
    s += " amount " + this.attrAmount + "[" + this.attrAmountMin + "," + this.attrAmountMax + "]";
    s += " state " + this.attrState;
    s += " formula " + this.attrFormula;

    if (child && this.children.length > 0) {
      s += "\n";
      for (let i = 0; i < this.children.length; ++i) {
        s += this.children[i].desc(false, attrList) + " (child)\n";
      }
    }
    return s;
  }
}

