/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface EngineViewInterface extends ethers.utils.Interface {
  functions: {
    "getBranchInputTokenList(address,address,uint32,uint16,uint8)": FunctionFragment;
    "getBranchOutputTokenList(address,address,address,uint32,bytes,uint16,uint8)": FunctionFragment;
    "getClaimIOAddressBranchToken((address,address,address,uint32,uint32,address,uint8,uint16,uint8,uint8))": FunctionFragment;
    "getInputAddressRound(address,address,uint32,uint16)": FunctionFragment;
    "getInputAddressRoundBranch(address,address,address,uint32,uint16)": FunctionFragment;
    "getOutputAddressRound(address,address,uint32,uint16)": FunctionFragment;
    "getOutputAddressRoundBranch(address,address,address,uint32,bytes,uint16)": FunctionFragment;
    "swapQuoteTokenTemplate((uint8,address,uint256[]))": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getBranchInputTokenList",
    values: [string, string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getBranchOutputTokenList",
    values: [
      string,
      string,
      string,
      BigNumberish,
      BytesLike,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getClaimIOAddressBranchToken",
    values: [
      {
        engine: string;
        clusterArea: string;
        stateCounter: string;
        clusterId: BigNumberish;
        taskId: BigNumberish;
        claimer: string;
        io: BigNumberish;
        round: BigNumberish;
        branch: BigNumberish;
        tokenSlotIndex: BigNumberish;
      }
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getInputAddressRound",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getInputAddressRoundBranch",
    values: [string, string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOutputAddressRound",
    values: [string, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOutputAddressRoundBranch",
    values: [string, string, string, BigNumberish, BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "swapQuoteTokenTemplate",
    values: [{ erc: BigNumberish; token: string; valueList: BigNumberish[] }]
  ): string;

  decodeFunctionResult(
    functionFragment: "getBranchInputTokenList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBranchOutputTokenList",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getClaimIOAddressBranchToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInputAddressRound",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInputAddressRoundBranch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOutputAddressRound",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOutputAddressRoundBranch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swapQuoteTokenTemplate",
    data: BytesLike
  ): Result;

  events: {};
}

export class EngineView extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: EngineViewInterface;

  functions: {
    getBranchInputTokenList(
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        ([BigNumber, BigNumber, BigNumber] & {
          id: BigNumber;
          amount: BigNumber;
          idIndex: BigNumber;
        })[]
      ]
    >;

    getBranchOutputTokenList(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        ([BigNumber, BigNumber, BigNumber] & {
          id: BigNumber;
          amount: BigNumber;
          idIndex: BigNumber;
        })[]
      ]
    >;

    getClaimIOAddressBranchToken(
      claim: {
        engine: string;
        clusterArea: string;
        stateCounter: string;
        clusterId: BigNumberish;
        taskId: BigNumberish;
        claimer: string;
        io: BigNumberish;
        round: BigNumberish;
        branch: BigNumberish;
        tokenSlotIndex: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    getInputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getInputAddressRoundBranch(
      engine: string,
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[number]>;

    getOutputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getOutputAddressRoundBranch(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[number]>;

    swapQuoteTokenTemplate(
      tokenTemplate: {
        erc: BigNumberish;
        token: string;
        valueList: BigNumberish[];
      },
      overrides?: CallOverrides
    ): Promise<[BigNumber[]]>;
  };

  getBranchInputTokenList(
    inAddress: string,
    stateCounter: string,
    taskId: BigNumberish,
    round: BigNumberish,
    branch: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    ([BigNumber, BigNumber, BigNumber] & {
      id: BigNumber;
      amount: BigNumber;
      idIndex: BigNumber;
    })[]
  >;

  getBranchOutputTokenList(
    engine: string,
    outAddress: string,
    stateCounter: string,
    taskId: BigNumberish,
    args: BytesLike,
    round: BigNumberish,
    branch: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    ([BigNumber, BigNumber, BigNumber] & {
      id: BigNumber;
      amount: BigNumber;
      idIndex: BigNumber;
    })[]
  >;

  getClaimIOAddressBranchToken(
    claim: {
      engine: string;
      clusterArea: string;
      stateCounter: string;
      clusterId: BigNumberish;
      taskId: BigNumberish;
      claimer: string;
      io: BigNumberish;
      round: BigNumberish;
      branch: BigNumberish;
      tokenSlotIndex: BigNumberish;
    },
    overrides?: CallOverrides
  ): Promise<boolean>;

  getInputAddressRound(
    engine: string,
    stateCounter: string,
    taskId: BigNumberish,
    round: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getInputAddressRoundBranch(
    engine: string,
    inAddress: string,
    stateCounter: string,
    taskId: BigNumberish,
    round: BigNumberish,
    overrides?: CallOverrides
  ): Promise<number>;

  getOutputAddressRound(
    engine: string,
    stateCounter: string,
    taskId: BigNumberish,
    round: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getOutputAddressRoundBranch(
    engine: string,
    outAddress: string,
    stateCounter: string,
    taskId: BigNumberish,
    args: BytesLike,
    round: BigNumberish,
    overrides?: CallOverrides
  ): Promise<number>;

  swapQuoteTokenTemplate(
    tokenTemplate: {
      erc: BigNumberish;
      token: string;
      valueList: BigNumberish[];
    },
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  callStatic: {
    getBranchInputTokenList(
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      ([BigNumber, BigNumber, BigNumber] & {
        id: BigNumber;
        amount: BigNumber;
        idIndex: BigNumber;
      })[]
    >;

    getBranchOutputTokenList(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      ([BigNumber, BigNumber, BigNumber] & {
        id: BigNumber;
        amount: BigNumber;
        idIndex: BigNumber;
      })[]
    >;

    getClaimIOAddressBranchToken(
      claim: {
        engine: string;
        clusterArea: string;
        stateCounter: string;
        clusterId: BigNumberish;
        taskId: BigNumberish;
        claimer: string;
        io: BigNumberish;
        round: BigNumberish;
        branch: BigNumberish;
        tokenSlotIndex: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<boolean>;

    getInputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getInputAddressRoundBranch(
      engine: string,
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<number>;

    getOutputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getOutputAddressRoundBranch(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<number>;

    swapQuoteTokenTemplate(
      tokenTemplate: {
        erc: BigNumberish;
        token: string;
        valueList: BigNumberish[];
      },
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;
  };

  filters: {};

  estimateGas: {
    getBranchInputTokenList(
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getBranchOutputTokenList(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getClaimIOAddressBranchToken(
      claim: {
        engine: string;
        clusterArea: string;
        stateCounter: string;
        clusterId: BigNumberish;
        taskId: BigNumberish;
        claimer: string;
        io: BigNumberish;
        round: BigNumberish;
        branch: BigNumberish;
        tokenSlotIndex: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInputAddressRoundBranch(
      engine: string,
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOutputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getOutputAddressRoundBranch(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    swapQuoteTokenTemplate(
      tokenTemplate: {
        erc: BigNumberish;
        token: string;
        valueList: BigNumberish[];
      },
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getBranchInputTokenList(
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBranchOutputTokenList(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      branch: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getClaimIOAddressBranchToken(
      claim: {
        engine: string;
        clusterArea: string;
        stateCounter: string;
        clusterId: BigNumberish;
        taskId: BigNumberish;
        claimer: string;
        io: BigNumberish;
        round: BigNumberish;
        branch: BigNumberish;
        tokenSlotIndex: BigNumberish;
      },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInputAddressRoundBranch(
      engine: string,
      inAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOutputAddressRound(
      engine: string,
      stateCounter: string,
      taskId: BigNumberish,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getOutputAddressRoundBranch(
      engine: string,
      outAddress: string,
      stateCounter: string,
      taskId: BigNumberish,
      args: BytesLike,
      round: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    swapQuoteTokenTemplate(
      tokenTemplate: {
        erc: BigNumberish;
        token: string;
        valueList: BigNumberish[];
      },
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
