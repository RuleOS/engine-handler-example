// @ts-nocheck

import { BigNumberish, BytesLike } from "ethers";
import { Token } from "./Token";
import { Bit } from "../util/Bit";
import { getLogger, ILogger } from "../util/Log";

let log: ILogger = getLogger();

const BIT_TIMESTAMP = 32;// time task created
const BIT_TIMESTAMP_SHIFT = 0;
const BIT_TIMESTAMP_EXECUTE = 32;// > time can execute
const BIT_TIMESTAMP_EXECUTE_SHIFT = BIT_TIMESTAMP + BIT_TIMESTAMP_SHIFT;
const BIT_TIMESTAMP_PROCESSED = 32;// already processed
const BIT_TIMESTAMP_PROCESSED_SHIFT = BIT_TIMESTAMP_EXECUTE + BIT_TIMESTAMP_EXECUTE_SHIFT;
const BIT_TIMESTAMP_DONE_OR_REVOKED = 32;// already revoked
const BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT = BIT_TIMESTAMP_PROCESSED + BIT_TIMESTAMP_PROCESSED_SHIFT;

const BIT_BLOCK_NUMBER = 32;
const BIT_BLOCK_NUMBER_SHIFT = BIT_TIMESTAMP_DONE_OR_REVOKED + BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT;
const BIT_BLOCK_NUMBER_EXECUTE = 32;
const BIT_BLOCK_NUMBER_EXECUTE_SHIFT = BIT_BLOCK_NUMBER + BIT_BLOCK_NUMBER_SHIFT;
const BIT_BLOCK_NUMBER_PROCESSED = 32;
const BIT_BLOCK_NUMBER_PROCESSED_SHIFT = BIT_BLOCK_NUMBER_EXECUTE + BIT_BLOCK_NUMBER_EXECUTE_SHIFT;
const BIT_BLOCK_NUMBER_DONE_OR_REVOKED = 32;
const BIT_BLOCK_NUMBER_DONE_OR_REVOKED_SHIFT = BIT_BLOCK_NUMBER_PROCESSED + BIT_BLOCK_NUMBER_PROCESSED_SHIFT;

const BIT_RULE_DURATION_TYPE = 8;
const BIT_RULE_DURATION_TYPE_SHIFT = 0;
const BIT_RULE_SLOT_INDEX_INPUT = 16;
const BIT_RULE_SLOT_INDEX_INPUT_SHIFT = BIT_RULE_DURATION_TYPE + BIT_RULE_DURATION_TYPE_SHIFT;
const BIT_RULE_SLOT_INDEX_OUTPUT = 16;
const BIT_RULE_SLOT_INDEX_OUTPUT_SHIFT = BIT_RULE_SLOT_INDEX_INPUT + BIT_RULE_SLOT_INDEX_INPUT_SHIFT;
const BIT_GROUP_INPUT_BRANCH = 8;
const BIT_GROUP_INPUT_BRANCH_SHIFT = BIT_RULE_SLOT_INDEX_OUTPUT + BIT_RULE_SLOT_INDEX_OUTPUT_SHIFT;
const BIT_GROUP_INPUT_ROUND = 16;
const BIT_GROUP_INPUT_ROUND_SHIFT = BIT_GROUP_INPUT_BRANCH + BIT_GROUP_INPUT_BRANCH_SHIFT;
const BIT_MULTIPLE = 16;
const BIT_MULTIPLE_SHIFT = BIT_GROUP_INPUT_ROUND + BIT_GROUP_INPUT_ROUND_SHIFT;

export class Task {
  caller: string;//address
  clusterArea: string;//address
  lastHandler: string;//address
  //32:blocknumberExecute 32:blocknumber 32:timestampExecute 32:timestamp
  value: BigNumberish;
  valueTime: BigNumberish;

  //32:clusterId 8:TaskSate  32:taskId
  taskId: BigNumberish;
  parentTaskId: BigNumberish;
  clusterId: BigNumberish;
  ruleDurationType:BigNumberish;
  ruleSlotIndexInput: BigNumberish;
  ruleSlotIndexOutput: BigNumberish;
  groupInputBranch: BigNumberish;
  groupInputRound: BigNumberish;
  multiple: BigNumberish;
  state: BigNumberish;

  inTokenList: Token[];
  args: BytesLike;

  blockNumber: BigNumberish;
  blockNumberExecute: BigNumberish;
  blockNumberProcessed: BigNumberish;
  blockNumberDoneOrRevoked: BigNumberish;

  blockNumberTen: number;
  blockNumberExecuteTen: number;
  blockNumberProcessedTen: number;
  blockNumberDoneOrRevokedTen: number;

  timestamp: BigNumberish;
  timestampExecute: BigNumberish;
  timestampProcessed: BigNumberish;
  timestampDoneOrRevoked: BigNumberish;

  timestampDate: string;
  timestampExecuteDate: string;
  timestampProcessedDate: string;
  timestampDoneOrRevokedDate: string;

  public async bitDecode() {
    this.timestamp = Bit.bitValue(this.valueTime, BIT_TIMESTAMP, BIT_TIMESTAMP_SHIFT);
    this.timestampExecute = Bit.bitValue(this.valueTime, BIT_TIMESTAMP_EXECUTE, BIT_TIMESTAMP_EXECUTE_SHIFT);
    this.timestampProcessed = Bit.bitValue(this.valueTime, BIT_TIMESTAMP_PROCESSED, BIT_TIMESTAMP_PROCESSED_SHIFT);
    this.timestampDoneOrRevoked = Bit.bitValue(this.valueTime, BIT_TIMESTAMP_DONE_OR_REVOKED, BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT);

    this.blockNumber = Bit.bitValue(this.valueTime, BIT_BLOCK_NUMBER, BIT_BLOCK_NUMBER_SHIFT);
    this.blockNumberExecute = Bit.bitValue(this.valueTime, BIT_BLOCK_NUMBER_EXECUTE, BIT_BLOCK_NUMBER_EXECUTE_SHIFT);
    this.blockNumberProcessed = Bit.bitValue(this.valueTime, BIT_BLOCK_NUMBER_PROCESSED, BIT_BLOCK_NUMBER_PROCESSED_SHIFT);
    this.blockNumberDoneOrRevoked = Bit.bitValue(this.valueTime, BIT_BLOCK_NUMBER_DONE_OR_REVOKED, BIT_BLOCK_NUMBER_DONE_OR_REVOKED_SHIFT);


    this.timestampDate = Task.timestampToDate(this.timestamp);
    this.timestampExecuteDate = Task.timestampToDate(this.timestampExecute);
    this.timestampProcessedDate = Task.timestampToDate(this.timestampProcessed);
    this.timestampDoneOrRevokedDate = Task.timestampToDate(this.timestampDoneOrRevoked);

    this.blockNumberTen = Number(this.blockNumber);
    this.blockNumberExecuteTen = Number(this.blockNumberExecute);
    this.blockNumberProcessedTen = Number(this.blockNumberProcessed);
    this.blockNumberDoneOrRevokedTen = Number(this.blockNumberDoneOrRevoked);

    this.ruleDurationType = Bit.bitValue(this.value,BIT_RULE_DURATION_TYPE,BIT_RULE_DURATION_TYPE_SHIFT);
    this.ruleSlotIndexInput = Bit.bitValue(this.value,BIT_RULE_SLOT_INDEX_INPUT,BIT_RULE_SLOT_INDEX_INPUT_SHIFT);
    this.ruleSlotIndexOutput = Bit.bitValue(this.value,BIT_RULE_SLOT_INDEX_OUTPUT,BIT_RULE_SLOT_INDEX_OUTPUT_SHIFT);
    this.groupInputBranch = Bit.bitValue(this.value,BIT_GROUP_INPUT_BRANCH,BIT_GROUP_INPUT_BRANCH_SHIFT);
    this.groupInputRound = Bit.bitValue(this.value,BIT_GROUP_INPUT_ROUND,BIT_GROUP_INPUT_ROUND_SHIFT);
    this.multiple = Bit.bitValue(this.value,BIT_MULTIPLE,BIT_MULTIPLE_SHIFT);

  }

  public async print() {
    log.debug("-------------------------------- task ------------------------------------");
    log.debugln("task",
      "taskId", this.taskId,
      "clusterId", this.clusterId,
      "caller", this.caller,
      "clusterArea", this.clusterArea,
      "lastHandler", this.lastHandler,
      "value", this.value.toString());
    log.debug();

    log.debugln("task",
      "ruleDurationType", this.ruleDurationType,
      "ruleSlotIndexInput", this.ruleSlotIndexInput,
      "ruleSlotIndexOutput", this.ruleSlotIndexOutput,
      "groupInputBranch", this.groupInputBranch,
      "groupInputRound", this.groupInputRound,
      "state", this.state, "(1 INPUT 2 INPUT_TASK 5 PROCESSED 10 DONE 20 REVOKED 30 CLAIMED)");
    log.debug();

    log.debugln("task",
      "blockNumber", this.blockNumber.toString(),
      "blockNumberExecute", this.blockNumberExecute.toString(),
      "blockNumberProcessed", this.blockNumberProcessed.toString(),
      "blockNumberDoneOrRevoked", this.blockNumberDoneOrRevoked.toString());
    log.debug();

    log.debugln("task",
      "timestamp", this.timestamp.toString() + " (" + this.timestampDate + ")",
      "timestampExecute", this.timestampExecute.toString() + " (" + this.timestampExecuteDate + ")",
      "timestampProcessed", this.timestampProcessed.toString() + " (" + this.timestampProcessedDate + ")",
      "timestampDoneOrRevoked", this.timestampDoneOrRevoked.toString() + " (" + this.timestampDoneOrRevokedDate + ")",
      "args", this.args);
    log.debug();

    log.debug("------------------------------- inTokenList ---------------------");
    for (let i = 0; i < this.inTokenList.length; ++i) {
      let tokenContract: Token = this.inTokenList[i];
      let token = new Token(tokenContract.erc, tokenContract.token, tokenContract.id, tokenContract.amount);
      log.debug("------- token " + i + " " + token.desc());
    }

    log.debug();
  }

  private static timestampToDate(timestamp: BigNumberish): string {
    return new Date(new Date(timestamp * 1000).setHours(new Date().getHours() + 8)).toISOString().replace("Z", " ").replace("T", " ").slice(0, -5);
  }
}
