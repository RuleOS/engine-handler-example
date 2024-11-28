// @ts-nocheck
import { BigNumber } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import { ERC, ZERO_ADDRESS } from "./Constant";
import { AttributeIn } from "./Attribute";

let D18 = chainHub.Util.D18;
let BN = chainHub.Util.BN;

export class Token {
  erc: number; // 0 erc 20
  token: string;
  id: BigNumber;
  amount: BigNumber;
  price: BigNumber;

  buyIndex: BigNumber;// use for exchange
  sellIndex: BigNumber; // use for exchange

  attrInList: AttributeIn[] = [];


  constructor(erc: number, token: string, id: BigNumber, amount: BigNumber, price?: BigNumber) {
    this.erc = erc;
    this.token = token;
    this.id = id;
    this.amount = amount;
    this.price = price;
  }

  copy(token: Token) {
    this.erc = token.erc;
    this.token = token.token;
    this.id = token.id;
    this.amount = token.amount;
    this.price = token.price;

    this.buyIndex = token.buyIndex;
    this.sellIndex = token.sellIndex;

    this.attrInList = [];

    for(let i = 0;i < token.attrInList.length; ++i){
      this.attrInList.push(AttributeIn.new(token.attrInList[i].attrId,token.attrInList[i].attrAmount));
    }

    return this;
  }

  public static newAttr(token: string, id: number) {
    return new Token(0, token, BN(id), BN(0), BN(0));
  }

  public static newERC(erc: number, token: string, id: number, amount: BigNumber, price?: BigNumber) {
    return new Token(erc, token, BN(id), BN(amount), price);
  }

  public static newCoin(amount: BigNumber, price?: BigNumber) {
    return new Token(ERC.COIN, ZERO_ADDRESS, BN(0), BN(amount), price);
  }

  public static newERC20(token: string, amount: BigNumber, price?: BigNumber) {
    return new Token(ERC.ERC20, token, BN(0), BN(amount), price);
  }

  public static newERC721(token: string, id: number, price?: BigNumber) {
    return new Token(ERC.ERC721, token, BN(id), BN(0), price);
  }

  public static newERC1155(token: string, id: number, amount: BigNumber = 0, price?: BigNumber) {
    return new Token(ERC.ERC1155, token, BN(id), BN(amount), price);
  }

  public addAttrInList(attrInList: AttributeIn[]) {
    this.attrInList.push(...attrInList);
  }

  public desc() {
    let tokenDesc: string;
    if (this.erc == ERC.COIN) tokenDesc = "Coin-*" + D18(this.amount);
    else if (this.erc == ERC.ERC20) tokenDesc = this.token + " ERC20-*" + this.amount.toString();
    else if (this.erc == ERC.ERC721) tokenDesc = this.token + " ERC721-#" + this.id.toString();
    else if (this.erc == ERC.ERC1155) tokenDesc = this.token + " ERC1155-#" + this.id.toString() + "*" + this.amount.toString();

    return tokenDesc;
  }

}
