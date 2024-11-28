// @ts-nocheck
import { BigNumberish } from "ethers";

import { AttributeRange } from "../Attribute";
import { plainToInstance } from "class-transformer";
import { TokenTemplate } from "../TokenTemplate";

export class PTokenTemplate {

  erc: BigNumberish; // coin 0 erc20 1 erc721 2 erc1155 3
  token: string; //"0xDbF0A536ed84Ce4015cd6229597b063719E9fF9f"

  id: BigNumberish = 0; //begin id or specific id
  idEnd: BigNumberish = 0;
  idList: BigNumberish[] = [];
  amount: BigNumberish = 0; // begin amount or specific amount
  amountEnd: BigNumberish = 0;

  decimals: BigNumberish = 0;
  amountPrecision: BigNumberish = 0;

  attributeRangeList: AttributeRange[] = [];
  idType: BigNumberish = 0;
  idRequired: BigNumberish = 1;//TOKEN_TEMPLATE_ID_REQUIRED.TRUE;
  idFormula: string = "";
  amountFormula: string = "";
  amountRequired: BigNumberish = 1;//TOKEN_TEMPLATE_AMOUNT_REQUIRED.TRUE;

  mountingTokenSlotIndex: BigNumberish = 0;

  swapRouter01: string;
  swapToken: string;//token to make pair with

  outAddress: string;

  public toTokenTemplate(): TokenTemplate {
    this.attributeRangeList = [];
    return plainToInstance(TokenTemplate, this).init();
  }
}
