// @ts-nocheck

import { BigNumberish } from "ethers";
import { ERC } from "./Constant";


export class TokenMounting {
  erc: BigNumberish;
  token: string;
  id: BigNumberish;
  amount: BigNumberish;

  public desc() {
    let tokenDesc = "";
    if (this.erc == ERC.ERC721) tokenDesc = "ERC721 " + this.token + "#" + this.id.toString();
    else if (this.erc == ERC.ERC1155) tokenDesc = "ERC1155 " + this.token + "#" + this.id.toString() + "#" + this.amount.toString();

    return tokenDesc;
  }
}
