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

interface PausableChannelUpgradeableInterface extends ethers.utils.Interface {
  functions: {
    "paused(uint8)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "paused",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "Paused(uint8,address)": EventFragment;
    "Unpaused(uint8,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Paused"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Unpaused"): EventFragment;
}

export type InitializedEvent = TypedEvent<[number] & { version: number }>;

export type PausedEvent = TypedEvent<
  [number, string] & { channel: number; account: string }
>;

export type UnpausedEvent = TypedEvent<
  [number, string] & { channel: number; account: string }
>;

export class PausableChannelUpgradeable extends BaseContract {
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

  interface: PausableChannelUpgradeableInterface;

  functions: {
    paused(
      channel: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;
  };

  paused(channel: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

  callStatic: {
    paused(channel: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {
    "Initialized(uint8)"(
      version?: null
    ): TypedEventFilter<[number], { version: number }>;

    Initialized(
      version?: null
    ): TypedEventFilter<[number], { version: number }>;

    "Paused(uint8,address)"(
      channel?: null,
      account?: null
    ): TypedEventFilter<[number, string], { channel: number; account: string }>;

    Paused(
      channel?: null,
      account?: null
    ): TypedEventFilter<[number, string], { channel: number; account: string }>;

    "Unpaused(uint8,address)"(
      channel?: null,
      account?: null
    ): TypedEventFilter<[number, string], { channel: number; account: string }>;

    Unpaused(
      channel?: null,
      account?: null
    ): TypedEventFilter<[number, string], { channel: number; account: string }>;
  };

  estimateGas: {
    paused(
      channel: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    paused(
      channel: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}