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
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface ClusterAttributeAreaUtilInterface extends ethers.utils.Interface {
  functions: {};

  events: {
    "SetClusterAttrState(uint32,uint32,uint8,uint8)": EventFragment;
    "SetTokenAttrState(address,uint32,uint8,uint8)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "SetClusterAttrState"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SetTokenAttrState"): EventFragment;
}

export type SetClusterAttrStateEvent = TypedEvent<
  [number, number, number, number] & {
    clusterId: number;
    attrId: number;
    state: number;
    newState: number;
  }
>;

export type SetTokenAttrStateEvent = TypedEvent<
  [string, number, number, number] & {
    token: string;
    attrId: number;
    state: number;
    newState: number;
  }
>;

export class ClusterAttributeAreaUtil extends BaseContract {
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

  interface: ClusterAttributeAreaUtilInterface;

  functions: {};

  callStatic: {};

  filters: {
    "SetClusterAttrState(uint32,uint32,uint8,uint8)"(
      clusterId?: null,
      attrId?: null,
      state?: null,
      newState?: null
    ): TypedEventFilter<
      [number, number, number, number],
      { clusterId: number; attrId: number; state: number; newState: number }
    >;

    SetClusterAttrState(
      clusterId?: null,
      attrId?: null,
      state?: null,
      newState?: null
    ): TypedEventFilter<
      [number, number, number, number],
      { clusterId: number; attrId: number; state: number; newState: number }
    >;

    "SetTokenAttrState(address,uint32,uint8,uint8)"(
      token?: null,
      attrId?: null,
      state?: null,
      newState?: null
    ): TypedEventFilter<
      [string, number, number, number],
      { token: string; attrId: number; state: number; newState: number }
    >;

    SetTokenAttrState(
      token?: null,
      attrId?: null,
      state?: null,
      newState?: null
    ): TypedEventFilter<
      [string, number, number, number],
      { token: string; attrId: number; state: number; newState: number }
    >;
  };

  estimateGas: {};

  populateTransaction: {};
}
