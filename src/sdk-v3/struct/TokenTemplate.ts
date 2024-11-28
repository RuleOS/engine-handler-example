// @ts-nocheck
import { BigNumber, BigNumberish, BytesLike, ethers } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import {
  ATTRIBUTE_OPT,
  ERC,
  MINT_DESTROY_ADDRESS,
  SDK_CHECK,
  TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED,
  TOKEN_TEMPLATE_AMOUNT_REQUIRED,
  TOKEN_TEMPLATE_AMOUNT_REQUIRED as TTAR,
  TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED,
  TOKEN_TEMPLATE_ID_FORMULA_REQUIRED,
  TOKEN_TEMPLATE_ID_REQUIRED,
  TOKEN_TEMPLATE_ID_REQUIRED as TTIR,
  TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED,
  TOKEN_TEMPLATE_TYPE,
  ZERO_ADDRESS
} from "./Constant";
import { Token } from "./Token";
import { Bit, getLogger, ILogger } from "../util";
import { AttributeRange } from "./Attribute";

let BN = chainHub.Util.BN;
let D18 = chainHub.Util.D18;
let log: ILogger = getLogger();

const BIT_TOKEN_TEMPLATE_TYPE = 4;
const BIT_TOKEN_TEMPLATE_TYPE_SHIFT = 0;
const BIT_TOKEN_TEMPLATE_ID_REQUIRED = 4;
const BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_TYPE + BIT_TOKEN_TEMPLATE_TYPE_SHIFT;
const BIT_TOKEN_TEMPLATE_ID_COUNT = 16;
const BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_ID_REQUIRED + BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT;
const BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED = 2;
const BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_ID_COUNT + BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT;
const BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED = 4;
const BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED + BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT;
const BIT_TOKEN_TEMPLATE_AMOUNT_COUNT = 2;
const BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED + BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT;
const BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED = 2;
const BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_AMOUNT_COUNT + BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED = 4;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED + BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT = 16;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED + BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT;
const BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX = 8;
const BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT + BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT;
const BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED = 2;
const BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX + BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT;
const BIT_TOKEN_TEMPLATE_ALLOCATION_ID = 16;
const BIT_TOKEN_TEMPLATE_ALLOCATION_ID_SHIFT = BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED + BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT;
const BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT = 8;
const BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_ALLOCATION_ID + BIT_TOKEN_TEMPLATE_ALLOCATION_ID_SHIFT;
// 103(1000) 102(100) 101(10) 0 (1) 1 (0.1) 2(0.01) 3(0.001)... 18(0.0...01)
const BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION = 8;
const BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION_SHIFT = BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT + BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT;


const BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH = 8;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT = 0;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID = 32;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH + BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT = 4;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID + BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE = 4;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT + BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN = 40;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE + BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END = 40;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN + BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID = 32;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END + BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA = 32;
const BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID + BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT;


export class TokenTemplate {
  erc: ERC; // coin 0 erc20 1 erc721 2 erc1155 3
  token: string;
  valueList: BigNumberish[] = [];

  idIndex: BigNumberish = BN(0);
  id: BigNumberish = 0; //begin id or specific id
  idEnd: BigNumberish = 0;
  idList: BigNumberish[] = [];
  amount: BigNumberish = 0; // begin amount or specific amount
  amountEnd: BigNumberish = 0;
  decimals: BigNumberish = 0;
  attributeRangeList: AttributeRange[] = [];

  amountPrecision: BigNumberish = 0;

  idType: BigNumberish = 0;
  idRequired: BigNumberish = TOKEN_TEMPLATE_ID_REQUIRED.TRUE;
  idFormula: string = "";
  amountFormula: string = "";
  amountRequired: BigNumberish = TOKEN_TEMPLATE_AMOUNT_REQUIRED.TRUE;

  mountingTokenSlotIndex: BigNumberish = 0;

  swapRouter01: string;
  swapToken: string;//token to make pair with

  outAddress: string;

  functionTarget: string;
  functionValue: BigNumberish;
  functionData: BytesLike;

  tokenInMatch: number[] = [];// 0 fail 1 match
  tokenInList: Token[] = [];//token can be used to put in

  constructor(erc: number, token: string) {
    this.erc = erc;
    this.token = token;

    
  }

  static newStorageOne(erc: number, token: string, valueList: BigNumberish[]) {
    let tokenTemplate = new TokenTemplate(erc, token);
    tokenTemplate.valueList = valueList;

    return tokenTemplate;
  }

  init() {
    this.valueList = [];
    if (this.erc == ERC.ERC20 || this.erc == ERC.COIN) {
      this.valueList.push(BN(0));//Type
      this.valueList.push(this.amount);
      this.valueList.push(this.amountEnd);
      this.setAmountRequired(this.amountRequired);
      if (this.amountFormula && this.amountFormula != "") {
        this.setAmountFormulaRequired(TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED.TRUE);
        this.valueList.push(this.amountFormula);
      }

      if (this.swapRouter01 && this.swapToken) {
        this.setType(TOKEN_TEMPLATE_TYPE.SWAP_V2);
        this.valueList.push(this.swapRouter01);
        this.valueList.push(this.swapToken);
      }

      this.setAmountPrecision(this.amountPrecision);

    } else if (this.erc == ERC.ERC1155) {
      this.valueList.push(BN(0));//type
      this.valueList.push(BN(0));//idIndex
      if (this.idList.length > 0) {
        this.setType(TOKEN_TEMPLATE_TYPE.ID_LIST);
        this.setIdRequired(this.idRequired);
        this.setAmountRequired(this.amountRequired);

        this.valueList.push(this.amount);
        this.valueList.push(this.amountEnd);
        this.valueList.push(...this.idList);

        this.setIdCount(this.idList.length);
      } else {
        this.setType(TOKEN_TEMPLATE_TYPE.ID_RANGE);
        this.setIdRequired(this.idRequired);
        this.setAmountRequired(this.amountRequired);

        this.valueList.push(this.amount);
        this.valueList.push(this.amountEnd);
        this.valueList.push(this.id);
        this.valueList.push(this.idEnd);
        this.setIdCount(2);
      }

      if (this.idFormula && this.idFormula != "") {
        this.setIdFormulaRequired(TOKEN_TEMPLATE_ID_FORMULA_REQUIRED.TRUE);
        this.valueList.push(this.idFormula);
      }

      if (this.amountFormula && this.amountFormula != "") {
        this.setAmountFormulaRequired(TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED.TRUE);
        this.valueList.push(this.amountFormula);
      }
    } else if (this.erc == ERC.ERC721) {
      this.valueList.push(BN(0));//type
      this.valueList.push(BN(0));//idIndex
      this.setIdRequired(this.idRequired);
      if (this.idList.length > 0) {
        this.setType(TOKEN_TEMPLATE_TYPE.ID_LIST);
        this.valueList.push(...this.idList);
        this.setIdCount(this.idList.length);
      } else {
        this.setType(TOKEN_TEMPLATE_TYPE.ID_RANGE);
        this.valueList.push(this.id);
        this.valueList.push(this.idEnd);
        this.setIdCount(2);
      }

      if (this.idFormula && this.idFormula != "") {
        this.setIdFormulaRequired(TOKEN_TEMPLATE_ID_FORMULA_REQUIRED.TRUE);
        this.valueList.push(this.idFormula);
      }

      //TRUE,FALSE,EXIST,NONE all checked
      if (this.amountRequired) {
        this.setAmountRequired(this.amountRequired);
        this.valueList.push(this.amount);
        this.valueList.push(this.amountEnd);
        this.setAmountCount(2);
      }

      if (this.amountFormula && this.amountFormula != "") {
        this.setAmountFormulaRequired(TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED.TRUE);
        this.valueList.push(this.amountFormula);
      }
    }

    this.setMountingTokenSlotIndex(this.mountingTokenSlotIndex);

    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      let attrExistCheck = false;
      let attributeList = [];
      for (let i = 0; i < this.attributeRangeList.length; ++i) {
        let attrRange: AttributeRange = this.attributeRangeList[i];
        attributeList[i] = BN(0);
        attributeList[i] = Bit.bit(attributeList[i], BN(attrRange.branch), BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT);
        attributeList[i] = Bit.bit(attributeList[i], BN(attrRange.attrId), BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT);
        attributeList[i] = Bit.bit(attributeList[i], BN(attrRange.attrOpt), BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT);
        attributeList[i] = Bit.bit(attributeList[i], BN(attrRange.attrType), BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE, BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT);
        attributeList[i] = Bit.bit(attributeList[i], Bit.toUnsigned(attrRange.amountBegin, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN), BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT);
        attributeList[i] = Bit.bit(attributeList[i], Bit.toUnsigned(attrRange.amountEnd, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN), BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT);
        attributeList[i] = Bit.bit(attributeList[i], BN(attrRange.parentAttrId), BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT);
        if (attrRange.formula != "") {
          attributeList[i] = Bit.bit(attributeList[i], BN(attrRange.formula), BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA, BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA_SHIFT);
        }

        if (attrRange.attrOpt == ATTRIBUTE_OPT.EXIST || attrRange.attrOpt == ATTRIBUTE_OPT.TOKEN_EXIST) {
          attrExistCheck = true;
        }
      }

      if (attrExistCheck) {
        this.setAttributeRequired(TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED.EXIST);
      }

      this.valueList.push(...attributeList);
      this.setAttributeCount(attributeList.length);
    } else if (this.erc != ERC.NONE) {
      log.info(`TokenTemplate token ${this.token} has no ERC`);
    }

    if (this.outAddress && this.outAddress != "") {
      this.valueList.push(this.outAddress);
      this.setOutAddressRequired(TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED.TRUE);
    }

    if (this.functionData && this.functionData != "" && this.functionTarget && this.functionTarget != "" && this.functionValue && this.functionValue != "") {

      const arr = ethers.utils.arrayify(this.functionData);
      const uint256Array = [];
      for (let i = 0; i < arr.length; i += 32) {
        const slice = arr.slice(i, i + 32);
        const padded = ethers.utils.hexZeroPad(slice, 32);
        uint256Array.push(BigNumber.from(padded));
      }

      this.setFunctionPartCount(uint256Array.length + 2);

      this.valueList.push(this.functionTarget);
      this.valueList.push(this.functionValue);
      this.valueList.push(...uint256Array);
    }

    return this;
  }

  public static new() {
    let tokenTemplate = new TokenTemplate(ERC.ERC20, MINT_DESTROY_ADDRESS);
    tokenTemplate.amount = 1;
    tokenTemplate.amountEnd = 1;
    return tokenTemplate;
  }

  public static newCoin(amount: BigNumber, amountEnd: BigNumber) {
    if (SDK_CHECK && BN(amount).gt(BN(amountEnd))) {
      throw Error("Coin must amount < amountEnd");
    }
    let tokenTemplate = new TokenTemplate(ERC.COIN, chainHub.Util.ZeroAddress());
    tokenTemplate.amount = amount;
    tokenTemplate.amountEnd = amountEnd;
    tokenTemplate.decimals = 18;

    tokenTemplate.amountPrecision = this.calAmountPrecision(amount,amountEnd,18)

    return tokenTemplate;
  }

  public static newERC20(token: string, amount: BigNumber, amountEnd: BigNumber,decimals?:BigNumberish = 18) {
    if (SDK_CHECK && BN(amount).gt(BN(amountEnd))) {
      throw Error("ERC20 must amount < amountEnd");
    }
    let tokenTemplate = new TokenTemplate(ERC.ERC20, token);
    tokenTemplate.amount = amount;
    tokenTemplate.amountEnd = amountEnd;
    tokenTemplate.decimals = decimals;

    tokenTemplate.amountPrecision = this.calAmountPrecision(amount,amountEnd,decimals)

    return tokenTemplate;
  }

  public static newERC721Range(token: string, id: BigNumber, idEnd: BigNumber) {
    if (SDK_CHECK && BN(id).gt(BN(idEnd))) {
      throw Error("ERC721 range must id < idEnd");
    }
    let tokenTemplate = new TokenTemplate(ERC.ERC721, token);
    tokenTemplate.id = id;
    tokenTemplate.idEnd = idEnd;
    return tokenTemplate;
  }

  public static newERC721List(token: string, idList: BigNumberish[]) {
    if (SDK_CHECK && idList.length == 0) {
      throw Error("ERC721 list must idList.length > 0");
    }
    let tokenTemplate = new TokenTemplate(ERC.ERC721, token);
    tokenTemplate.idList = idList.sort();
    return tokenTemplate;
  }

  //mustn't id = 0 idEnd = 0, coz 1155 has no mint
  //must id > 0 , idEnd > id
  public static newERC1155Range(token: string, id: BigNumber, idEnd: BigNumber, amount: BigNumber, amountEnd: BigNumber) {
    if (SDK_CHECK && BN(id).gt(BN(idEnd))) {
      throw Error("ERC1155 range must id < idEnd");
    }
    if (SDK_CHECK && BN(amount).gt(BN(amountEnd))) {
      throw Error("ERC1155 range must amount < amountEnd");
    }

    let tokenTemplate = new TokenTemplate(ERC.ERC1155, token);
    tokenTemplate.id = id;
    tokenTemplate.idEnd = idEnd;
    tokenTemplate.amount = amount;
    tokenTemplate.amountEnd = amountEnd;

    return tokenTemplate;
  }

  public static newERC1155List(token: string, idList: BigNumberish[], amount: BigNumber, amountEnd: BigNumber) {
    if (SDK_CHECK && idList.length == 0) {
      throw Error("ERC1155 list must idList.length > 0");
    }
    if (SDK_CHECK && BN(amount).gt(BN(amountEnd))) {
      throw Error("ERC1155 list must amount < amountEnd");
    }

    let tokenTemplate = new TokenTemplate(ERC.ERC1155, token);
    tokenTemplate.idList = idList.sort();
    tokenTemplate.amount = amount;
    tokenTemplate.amountEnd = amountEnd;
    return tokenTemplate;
  }

  private static calAmountPrecision(amount: BigNumber, amountEnd: BigNumber,decimals:BigNumber) {

    let dec = amount.mod(BN(10).pow(decimals))
    let decEnd = amountEnd.mod(BN(10).pow(decimals))

    let precision = 0;
    if(dec.gt(0)){
      while(true){
        let temp = dec.div(BN(10))
        if(temp.mul(10).eq(dec)){
          dec = dec.div(BN(10));
          precision++;
        }
        else {
          break;
        }
      }
    }

    precision = decimals- precision;

    let precisionEnd = 0;
    if(decEnd.gt(0)){
      while(true){
        let temp = decEnd.div(BN(10))
        if(temp.mul(10).eq(decEnd)){
          decEnd = decEnd.div(BN(10));
          precisionEnd++;
        }
        else {
          break;
        }
      }
    }
    precisionEnd = decimals - precisionEnd;

    if(precision == decimals && precisionEnd == decimals){
      return 0;
    }

    let p = precision > precisionEnd ? precision : precisionEnd;

    return p;
  }


  // 103(1000) 102(100) 101(10) 0 (1) 1 (0.1) 2(0.01) 3(0.001)... 18(0.0...01)
  public addAmountPrecision(amountPrecision: BigNumberish = 0) {
    this.amountPrecision = amountPrecision;
    return this;
  }

  // 0.1,0.001, 10,100,1000
  public addAmountPrecisionReadable(amountPrecision: number = 0) {
    let precision = 0;
    if(amountPrecision < 1){
      amountPrecision = amountPrecision*1.5;
      precision = 1;
      let base = 1;
      while(true){
        base *= 0.1;
        if(base <= amountPrecision){
          break;
        } else {
          precision ++;
        }
      }
    } else if(amountPrecision > 1){
      amountPrecision = amountPrecision*0.5;
      precision = 1;
      let base = 1;
      while(true){
        base *= 10;
        if(base >= amountPrecision){
          break;
        } else {
          precision ++;
        }
      }
      precision += 100;
    }

    this.amountPrecision = precision;
    return this;
  }

  public addIdRequired(idRequired: BigNumberish = TTIR.TRUE) {
    this.idRequired = idRequired;
    return this;
  }

  public addIdAmountRequired(idRequired: BigNumberish = TTIR.TRUE, amountRequired: BigNumberish = TTAR.TRUE) {
    this.idRequired = idRequired;
    this.amountRequired = amountRequired;

    if (this.erc == ERC.ERC1155 && idRequired != amountRequired) {
      throw Error("ERC1155 list must idRequired = amountRequired");
    }

    return this;
  }

  public addIdFormula(idFormula: string = "") {
    this.idFormula = idFormula;
    return this;
  }

  public addAttributeRangeList(attributeRangeList: AttributeRange[] = []) {
    this.attributeRangeList = attributeRangeList;
    return this;
  }


  public addMountingTokenSlotIndex(mountingTokenSlotIndex: BigNumberish) {
    this.mountingTokenSlotIndex = mountingTokenSlotIndex;
    return this;
  }

  public addERC721RangeAmount(amount: BigNumber, amountEnd: BigNumber) {
    this.amount = amount;
    this.amountEnd = amountEnd;
    return this;
  }

  public addAmountRequired(amountRequired: BigNumberish) {
    this.amountRequired = BN(amountRequired);
    return this;
  }

  public addAmountFormula(amountFormula: string = "") {
    this.amountFormula = amountFormula;
    return this;
  }

  public addSwap(swapRouter01: string, swapToken: string) {
    this.swapRouter01 = swapRouter01;
    this.swapToken = swapToken;
    return this;
  }

  public addOutAddress(outAddress: string) {
    this.outAddress = outAddress;
    return this;
  }

  public addFunction(target: string, value: BigNumberish, data: BytesLike) {
    this.functionTarget = target;
    this.functionValue = value;
    this.functionData = data;
    return this;
  }

  //0 all
  //1 token
  //2 erc + id + amount
  public desc(type? = 0) {
    let tokenDesc: string = "";
    if (this.erc == ERC.COIN) {
      if (type == 0 || type == 2) {
        tokenDesc += "Coin-*amt[" + D18(this.amount) + "," + D18(this.amountEnd) + "]";
      }
    } else if (this.erc == ERC.ERC20) {
      if (type == 0 || type == 1) {
        tokenDesc += this.token + " ";
      }
      if (type == 0 || type == 2) {
        tokenDesc += "ERC20-*amt[" + this.amount.toString() + "," + this.amountEnd.toString() + "]";
      }
    } else if (this.erc == ERC.ERC1155 || this.erc == ERC.ERC721) {
      if (type == 0 || type == 1) {
        tokenDesc += this.token + " ";
      }
      if (type == 0 || type == 2) {
        let name = this.erc == ERC.ERC1155 ? "ERC1155" : "ERC721";
        tokenDesc += name;
        if (this.erc == ERC.ERC1155) {
          tokenDesc += "-#-amt[" + this.amount.toString() + "," + this.amountEnd.toString() + "]";
        } else if (this.erc == ERC.ERC721) {
          tokenDesc += "-#-amt[" + this.amount.toString() + "," + this.amountEnd.toString() + "]";
        }

        if (BN(this.idEnd).gt(0)) {
          tokenDesc += "-idRange-[" + this.id + "," + this.idEnd + "]-idIndex-" + this.idIndex;
        } else {
          if (this.idList.length > 0) {
            tokenDesc += "-idList-[";
            for (let i = 0; i < this.idList.length; ++i) {
              tokenDesc += this.idList[i] + ",";
            }
            tokenDesc = tokenDesc.substring(0, tokenDesc.length - 1);
            tokenDesc += "]";
          }
          tokenDesc += "-idIndex-" + this.idIndex;
        }
      }
    }
    return tokenDesc;
  }

  public restore() {
    this.idType = this.getType();
    this.idIndex = this.getIdIndex();
    let idRange = this.getIdRange();
    this.id = idRange.length == 0 ? BN(0) : idRange[0];
    this.idEnd = idRange.length == 0 ? BN(0) : idRange[1];
    this.idList = this.getIdList();
    this.idRequired = this.getIdRequired();
    this.idFormula = this.getIdFormula();
    this.amountRequired = this.getAmountRequired();
    this.amountFormula = this.getAmountFormula();
    let amountRange = this.getAmountRange();
    if (amountRange.length > 0) {
      this.amount = amountRange[0];
      this.amountEnd = amountRange[1];
    }
    this.swapRouter01 = this.getSwapRouter01();
    this.swapToken = this.getSwapToken();
    this.attributeRangeList = this.getAttributeRangeList();
  }

  public getIdIndex() {
    if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
      return 0;
    }
    return this.valueList[1];
  }

  public setIdIndex(idIndex: BigNumberish) {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      this.valueList[1] = idIndex;
    }
  }

  public getAmountRange() {
    let amountRange: [] = [];
    if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
      amountRange[0] = this.valueList[1];
      amountRange[1] = this.valueList[2];
    } else if (this.erc == ERC.ERC1155) { //ERC1155
      amountRange[0] = this.valueList[2];
      amountRange[1] = this.valueList[3];
    } else if (this.erc == ERC.ERC721) {
      let idCount = this.getIdCount();
      let idFormulaRequired = this.getIdFormulaRequired();
      let amountRequired = this.getAmountRequired();
      if (amountRequired != TOKEN_TEMPLATE_AMOUNT_REQUIRED.FALSE) {
        amountRange[0] = this.valueList[2 + idCount + idFormulaRequired];
        amountRange[1] = this.valueList[3 + idCount + idFormulaRequired];
      }
    }
    return amountRange;
  }

  public setAmountRange(amountRange: []) {
    if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
      this.valueList[0] = amountRange[0];
      this.valueList[1] = amountRange[1];
    } else if (this.erc == ERC.ERC1155) { //ERC1155
      this.valueList[2] = amountRange[0];
      this.valueList[3] = amountRange[1];
    } else if (this.erc == ERC.ERC721) {
      let idCount = this.getIdCount();
      let idFormulaRequired = this.getIdFormulaRequired();
      this.valueList[2 + idCount + idFormulaRequired] = amountRange[0];
      this.valueList[3 + idCount + idFormulaRequired] = amountRange[1];
    }
  }

  public getAmountFormula() {
    let amountFormulaRequired = this.getAmountFormulaRequired();
    if (amountFormulaRequired == TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED.TRUE) {
      if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
        return BN(this.valueList[3])._hex;
      } else if (this.erc == ERC.ERC721) {
        let idCount = this.getIdCount();
        let idFormulaRequired = this.getIdFormulaRequired();
        let amountCount = this.getAmountCount();
        return BN(this.valueList[2 + idCount + idFormulaRequired + amountCount])._hex;
      } else if (this.erc == ERC.ERC1155) {
        let amountCount = this.getAmountCount();
        if (BN(amountCount).eq(BN(2))) {
          let idCount = this.getIdCount();
          let idFormulaRequired = this.getIdFormulaRequired();
          return BN(this.valueList[4 + idCount + idFormulaRequired])._hex;
        }
      }
    }

    return BN(0)._hex;
  }

  public setAmountFormula(amountFormula: string) {
    let amountFormulaRequired = this.getAmountFormulaRequired();
    if (amountFormulaRequired == TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED.TRUE) {
      if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
        this.valueList[3] = amountFormula;
      } else if (this.erc == ERC.ERC721) {
        let idCount = this.getIdCount();
        let idFormulaRequired = this.getIdFormulaRequired();
        let amountCount = this.getAmountCount();
        this.valueList[2 + idCount + idFormulaRequired + amountCount] = amountFormula;
      } else if (this.erc == ERC.ERC1155) {
        let idCount = this.getIdCount();
        let idFormulaRequired = this.getIdFormulaRequired();
        this.valueList[4 + idCount + idFormulaRequired] = amountFormula;
      }
    }
  }

  public getIdRange(): [] {
    let idRange: [] = [];
    if (this.erc == ERC.ERC721) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.ID_RANGE) {
        idRange[0] = this.valueList[2];
        idRange[1] = this.valueList[3];
      }
    } else if (this.erc == ERC.ERC1155) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.ID_RANGE) {
        idRange[0] = this.valueList[4];
        idRange[1] = this.valueList[5];
      }
    }
    return idRange;
  }

  public getIdList(): [] {
    if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
      return [];
    } else if (this.erc == ERC.ERC721) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.ID_LIST) {
        let idCount = this.getIdCount();
        let idList: [] = [];
        for (let i = 0; i < idCount; i++)
          idList[i] = this.valueList[i + 2];
        return idList;
      }
    } else if (this.erc == ERC.ERC1155) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.ID_LIST) {
        let idCount = this.getIdCount();
        let idList: [] = [];
        for (let i = 0; i < idCount; i++)
          idList[i] = this.valueList[i + 4];
        return idList;
      }
    }

    return [];
  }

  public getIdListLength() {
    if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
      return 0;
    } else if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.ID_LIST) {
        return this.getIdCount();
      }
      return 0;
    }
    return 0;
  }

  public getId(index: BigNumberish) {
    if (this.erc == ERC.COIN || this.erc == ERC.ERC20) {
      return 0;
    } else if (this.erc == ERC.ERC721) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.ID_LIST) {
        let idCount = this.getIdCount();
        if (index < idCount)
          return this.valueList[index + 2];
      }
    } else if (this.erc == ERC.ERC1155) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.ID_LIST) {
        let idCount = this.getIdCount();
        if (index < idCount)
          return this.valueList[index + 4];
      }
    }
    return 0;
  }

  public getIdFormula() {
    let idFormulaRequired = this.getIdFormulaRequired();
    if (idFormulaRequired == TOKEN_TEMPLATE_ID_FORMULA_REQUIRED.TRUE) {
      if (this.erc == ERC.ERC721) {
        let idCount = this.getIdCount();
        return BN(this.valueList[2 + idCount])._hex;
      } else if (this.erc == ERC.ERC1155) {
        let idCount = this.getIdCount();
        return BN(this.valueList[4 + idCount])._hex;
      }
    }

    return BN(0)._hex;
  }

  public setIdFormula(idFormula: string) {
    let idFormulaRequired = this.getIdFormulaRequired();
    if (idFormulaRequired == TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_TRUE) {
      if (this.erc == ERC.ERC721) {
        let idCount = this.getIdCount();
        this.valueList[2 + idCount] = idFormula;
      } else if (this.erc == ERC.ERC1155) {
        let idCount = this.getIdCount();
        this.valueList[4 + idCount] = idFormula;
      }
    }
  }

  public setType(templateType: BigNumberish) {
    this.valueList[0] = Bit.bit(this.valueList[0], templateType, BIT_TOKEN_TEMPLATE_TYPE, BIT_TOKEN_TEMPLATE_TYPE_SHIFT);
  }

  public getType() {
    return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_TYPE, BIT_TOKEN_TEMPLATE_TYPE_SHIFT));
  }

  public setIdRequired(idRequired: BigNumberish) {
    this.valueList[0] = Bit.bit(this.valueList[0], idRequired, BIT_TOKEN_TEMPLATE_ID_REQUIRED, BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT);
  }

  public getIdRequired() {
    return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_ID_REQUIRED, BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT));
  }

  public setIdCount(idCount: BigNumberish) {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      this.valueList[0] = Bit.bit(this.valueList[0], idCount, BIT_TOKEN_TEMPLATE_ID_COUNT, BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT);
    }
  }

  public getIdCount() {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_ID_COUNT, BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT));
    }
    return 0;
  }

  public setIdFormulaRequired(required: BigNumberish) {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      this.valueList[0] = Bit.bit(this.valueList[0], required, BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT);
    }
  }

  public getIdFormulaRequired() {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT));
    }
    return 0;
  }

  public setAmountRequired(amountRequired: BigNumberish) {
    this.valueList[0] = Bit.bit(this.valueList[0], amountRequired, BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT);
  }

  public getAmountRequired() {
    return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT));
  }

  public setAmountCount(amountCount: BigNumberish) {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      this.valueList[0] = Bit.bit(this.valueList[0], amountCount, BIT_TOKEN_TEMPLATE_AMOUNT_COUNT, BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT);
    }
  }

  public getAmountCount() {
    if (this.erc == ERC.ERC721) {
      return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_COUNT, BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT));
    }
    return 2;
  }


  public setAmountPrecision(amountPrecision: BigNumberish) {
    this.valueList[0] = Bit.bit(this.valueList[0], amountPrecision, BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION, BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION_SHIFT);
  }

  public getAmountPrecision() {
    return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION, BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION_SHIFT));
  }

  public setAmountFormulaRequired(required: BigNumberish) {
    this.valueList[0] = Bit.bit(this.valueList[0], required, BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT);
  }

  public getAmountFormulaRequired() {
    return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT));
  }

  public setAttributeRequired(attributeRequired: BigNumberish) {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      this.valueList[0] = Bit.bit(this.valueList[0], attributeRequired, BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED, BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT);
    }
  }

  public getAttributeRequired() {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED, BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT));
    }
    return 0;
  }

  public setAttributeCount(attributeCount: BigNumberish) {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      this.valueList[0] = Bit.bit(this.valueList[0], attributeCount, BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT);
    }
  }

  public getAttributeCount() {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT));
    }
    return 0;
  }

  public setMountingTokenSlotIndex(mountingTokenSlotIndex: BigNumberish) {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      this.valueList[0] = Bit.bit(this.valueList[0], mountingTokenSlotIndex, BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX, BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT);
    }
  }

  public getMountingTokenSlotIndex() {
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX, BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT));
    }
    return 0;
  }

  public setOutAddressRequired(outAddressRequired: BigNumberish) {
    this.valueList[0] = Bit.bit(this.valueList[0], outAddressRequired, BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED, BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT);
  }

  public getOutAddressRequired() {
    return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED, BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT));
  }

  public getOutAddress() :string{
    let outAddress = ZERO_ADDRESS;
    if (this.erc == ERC.ERC20 || this.erc == ERC.COIN) {
      let templateType = this.getType();
      let amountFormulaRequired = this.getAmountFormulaRequired();
      if (templateType == TOKEN_TEMPLATE_TYPE.SWAP_V2) {
        outAddress = ethers.utils.hexZeroPad(this.valueList[5 + amountFormulaRequired],20).toLowerCase();
      } else {
        outAddress = ethers.utils.hexZeroPad(this.valueList[3 + amountFormulaRequired],20).toLowerCase();
      }
    } else if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      let offset = 2 + this.getIdCount() + this.getAmountCount() + this.getIdFormulaRequired() + this.getAmountFormulaRequired() + this.getAttributeCount();
      outAddress = ethers.utils.hexZeroPad(this.valueList[offset],20).toLowerCase();
    }
    this.outAddress = outAddress;
    return outAddress;
  }

  public getSwapRouter01() {
    if (this.erc == ERC.ERC20) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.SWAP_V2) {
        let amountFormulaRequired = this.getAmountFormulaRequired();
        return BN(this.valueList[3 + amountFormulaRequired])._hex;
      }
    }
    return ZERO_ADDRESS;
  }

  public getSwapToken() {
    if (this.erc == ERC.ERC20) {
      let templateType = this.getType();
      if (templateType == TOKEN_TEMPLATE_TYPE.SWAP_V2) {
        let amountFormulaRequired = this.getAmountFormulaRequired();
        return BN(this.valueList[4 + amountFormulaRequired])._hex;
      }
    }
    return ZERO_ADDRESS;
  }

  public getAttributeRangeList(): AttributeRange[] {
    let attributeRangeList: AttributeRange[] = [];
    if (this.erc == ERC.ERC721 || this.erc == ERC.ERC1155) {
      let idCount = this.getIdCount();
      let attributeCount = this.getAttributeCount();
      attributeRangeList = [];
      let offset = 2 + this.getIdCount() + this.getAmountCount() + this.getIdFormulaRequired() + this.getAmountFormulaRequired();
      for (let i = 0; i < attributeCount; ++i) {
        let attrIndex = offset + i;
        let attribute = this.valueList[attrIndex];
        attributeRangeList[i] = new AttributeRange(
          Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT),
          Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT),
          Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE, BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT),
          Bit.toSigned(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT), BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN),
          Bit.toSigned(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT), BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END),
          Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT),
          Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA, BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA_SHIFT),
          Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT)
        );
      }
    }

    return attributeRangeList;
  }

  public setFunctionPartCount(functionPartCount: BigNumberish) {
    this.valueList[0] = Bit.bit(this.valueList[0], functionPartCount, BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT, BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT);
  }

  public getFunctionPartCount() {
    return Number(Bit.bitValue(this.valueList[0], BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT, BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT));
  }

  public getAttributeRangeListByAttrOpt(attrOpt:number):AttributeRange[]{
    let attrRangeList:AttributeRange[] = [];
    for(let i = 0; i < this.attributeRangeList.length; ++i){
      let attrRange = this.attributeRangeList[i];
      if(attrRange.attrOpt == attrOpt){
        attrRangeList.push(attrRange);
      }
    }
    return attrRangeList;
  }

}
