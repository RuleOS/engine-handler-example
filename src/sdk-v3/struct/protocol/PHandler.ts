//@ts-nocheck

import { Helper } from "../../util";

export class PHandler {
  handler: string;// 0x6940d4e026d41d2310293B426370B0B19c906867
  handlerPool: string;// 0x6205F05408F589F0E45FCF712BFDedbf27A92F49
  args: any;

  public convert(handlerList: string[], argsList: string[], poolList: string[]) {
    handlerList?.push(this.handler);
    poolList?.push(this.handlerPool);
    argsList?.push(Helper.rlpEncode(this.args));
  }
}
