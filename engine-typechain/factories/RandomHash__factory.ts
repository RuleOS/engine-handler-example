/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { RandomHash, RandomHashInterface } from "../RandomHash";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "clusterArea",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint32",
        name: "clusterId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "ruleSlotIndexInput",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "ruleSlotIndexOutput",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "stateCounter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "taskId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "random",
        type: "uint256",
      },
    ],
    name: "Random",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "blockHashTask",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "engine",
        type: "address",
      },
      {
        internalType: "address",
        name: "clusterArea",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "clusterId",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexInput",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexOutput",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "stateCounter",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "taskId",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "checkRandom",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "engine",
            type: "address",
          },
          {
            internalType: "address",
            name: "clusterArea",
            type: "address",
          },
          {
            internalType: "address",
            name: "stateCounter",
            type: "address",
          },
          {
            internalType: "address",
            name: "caller",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "clusterId",
            type: "uint32",
          },
          {
            internalType: "uint16",
            name: "ruleSlotIndexInput",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "ruleSlotIndexOutput",
            type: "uint16",
          },
          {
            internalType: "uint32",
            name: "taskId",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "blockTimestamp",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "blockNumber",
            type: "uint32",
          },
          {
            internalType: "uint8",
            name: "stdTrialMaxCount",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "trialCount",
            type: "uint8",
          },
          {
            internalType: "uint32",
            name: "futureBlockNumber",
            type: "uint32",
          },
          {
            internalType: "bytes32",
            name: "futureBlockHash",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "futureBlockHashInt",
            type: "uint256",
          },
        ],
        internalType: "struct RandomHash.RandomState",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "clusterArea",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "clusterId",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexInput",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexOutput",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "stateCounter",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "taskId",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "clearRandom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "clusterArea",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "clusterId",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexInput",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexOutput",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "stateCounter",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "taskId",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "makeRandom",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "clusterArea",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "clusterId",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexInput",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexOutput",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "stateCounter",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "taskId",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "makeRandomBlock",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "taskRandom",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "clusterId",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexInput",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "ruleSlotIndexOutput",
        type: "uint16",
      },
      {
        internalType: "uint8",
        name: "trialMaxCount",
        type: "uint8",
      },
    ],
    name: "updateRandomArgs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class RandomHash__factory {
  static readonly abi = _abi;
  static createInterface(): RandomHashInterface {
    return new utils.Interface(_abi) as RandomHashInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RandomHash {
    return new Contract(address, _abi, signerOrProvider) as RandomHash;
  }
}
