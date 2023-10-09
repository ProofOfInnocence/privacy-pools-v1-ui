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
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface BridgeBNBInterface extends ethers.utils.Interface {
  functions: {};

  events: {
    "RelayedMessage(address,address,bytes32,bool)": EventFragment;
    "UserRequestForAffirmation(bytes32,bytes)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "RelayedMessage"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "UserRequestForAffirmation"): EventFragment;
}

export type RelayedMessageEvent = TypedEvent<
  [string, string, string, boolean] & {
    sender: string;
    executor: string;
    messageId: string;
    status: boolean;
  }
>;

export type UserRequestForAffirmationEvent = TypedEvent<
  [string, string] & { messageId: string; encodedData: string }
>;

export class BridgeBNB extends BaseContract {
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

  interface: BridgeBNBInterface;

  functions: {};

  callStatic: {};

  filters: {
    "RelayedMessage(address,address,bytes32,bool)"(
      sender?: string | null,
      executor?: string | null,
      messageId?: BytesLike | null,
      status?: null
    ): TypedEventFilter<
      [string, string, string, boolean],
      { sender: string; executor: string; messageId: string; status: boolean }
    >;

    RelayedMessage(
      sender?: string | null,
      executor?: string | null,
      messageId?: BytesLike | null,
      status?: null
    ): TypedEventFilter<
      [string, string, string, boolean],
      { sender: string; executor: string; messageId: string; status: boolean }
    >;

    "UserRequestForAffirmation(bytes32,bytes)"(
      messageId?: BytesLike | null,
      encodedData?: null
    ): TypedEventFilter<
      [string, string],
      { messageId: string; encodedData: string }
    >;

    UserRequestForAffirmation(
      messageId?: BytesLike | null,
      encodedData?: null
    ): TypedEventFilter<
      [string, string],
      { messageId: string; encodedData: string }
    >;
  };

  estimateGas: {};

  populateTransaction: {};
}