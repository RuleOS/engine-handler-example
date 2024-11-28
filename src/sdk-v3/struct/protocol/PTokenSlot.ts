// @ts-nocheck
import { PTokenIO, PTokenTemplate } from ".";
import { plainToInstance, Type } from "class-transformer";
import "reflect-metadata";
import { TokenSlot } from "..";

export class PTokenSlot {

  @Type(() => PTokenIO)
  tokenIO: PTokenIO;

  @Type(() => PTokenTemplate)
  tokenTemplate: PTokenTemplate;

  public toTokenSlot(): TokenSlot {
    let tokenSlot = plainToInstance(TokenSlot, this);
    delete tokenSlot.tokenIO;
    tokenSlot.tokenTemplate = this.tokenTemplate.toTokenTemplate();
    this.tokenIO.toTokenSlotBranch(tokenSlot, 0);
    return tokenSlot;
  }
}
