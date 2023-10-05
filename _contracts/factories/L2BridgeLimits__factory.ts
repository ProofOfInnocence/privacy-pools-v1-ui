/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  L2BridgeLimits,
  L2BridgeLimitsInterface,
} from "../L2BridgeLimits";

const _abi = [
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [
      {
        type: "string",
        name: "_suffix",
        internalType: "string",
      },
    ],
  },
  {
    type: "event",
    name: "DailyLimitChanged",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "address",
        indexed: true,
      },
      {
        type: "uint256",
        name: "newLimit",
        internalType: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ExecutionDailyLimitChanged",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "address",
        indexed: true,
      },
      {
        type: "uint256",
        name: "newLimit",
        internalType: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FailedMessageFixed",
    inputs: [
      {
        type: "bytes32",
        name: "messageId",
        internalType: "bytes32",
        indexed: true,
      },
      {
        type: "address",
        name: "token",
        internalType: "address",
        indexed: false,
      },
      {
        type: "address",
        name: "recipient",
        internalType: "address",
        indexed: false,
      },
      {
        type: "uint256",
        name: "value",
        internalType: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeeDistributed",
    inputs: [
      {
        type: "uint256",
        name: "fee",
        internalType: "uint256",
        indexed: false,
      },
      {
        type: "address",
        name: "token",
        internalType: "address",
        indexed: true,
      },
      {
        type: "bytes32",
        name: "messageId",
        internalType: "bytes32",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "FeeDistributionFailed",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "address",
        indexed: true,
      },
      {
        type: "uint256",
        name: "fee",
        internalType: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewTokenRegistered",
    inputs: [
      {
        type: "address",
        name: "nativeToken",
        internalType: "address",
        indexed: true,
      },
      {
        type: "address",
        name: "bridgedToken",
        internalType: "address",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        type: "address",
        name: "previousOwner",
        internalType: "address",
        indexed: false,
      },
      {
        type: "address",
        name: "newOwner",
        internalType: "address",
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokensBridged",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "address",
        indexed: true,
      },
      {
        type: "address",
        name: "recipient",
        internalType: "address",
        indexed: true,
      },
      {
        type: "uint256",
        name: "value",
        internalType: "uint256",
        indexed: false,
      },
      {
        type: "bytes32",
        name: "messageId",
        internalType: "bytes32",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokensBridgingInitiated",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "address",
        indexed: true,
      },
      {
        type: "address",
        name: "sender",
        internalType: "address",
        indexed: true,
      },
      {
        type: "uint256",
        name: "value",
        internalType: "uint256",
        indexed: false,
      },
      {
        type: "bytes32",
        name: "messageId",
        internalType: "bytes32",
        indexed: true,
      },
    ],
    anonymous: false,
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "contract IAMB",
      },
    ],
    name: "bridgeContract",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    name: "bridgedTokenAddress",
    inputs: [
      {
        type: "address",
        name: "_nativeToken",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "claimTokens",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "address",
        name: "_to",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "claimTokensFromTokenContract",
    inputs: [
      {
        type: "address",
        name: "_bridgedToken",
        internalType: "address",
      },
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "address",
        name: "_to",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "dailyLimit",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "deployAndHandleBridgedTokens",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "string",
        name: "_name",
        internalType: "string",
      },
      {
        type: "string",
        name: "_symbol",
        internalType: "string",
      },
      {
        type: "uint8",
        name: "_decimals",
        internalType: "uint8",
      },
      {
        type: "address",
        name: "_recipient",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "deployAndHandleBridgedTokensAndCall",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "string",
        name: "_name",
        internalType: "string",
      },
      {
        type: "string",
        name: "_symbol",
        internalType: "string",
      },
      {
        type: "uint8",
        name: "_decimals",
        internalType: "uint8",
      },
      {
        type: "address",
        name: "_recipient",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
      {
        type: "bytes",
        name: "_data",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "executionDailyLimit",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "executionMaxPerTx",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "contract OmnibridgeFeeManager",
      },
    ],
    name: "feeManager",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "fixFailedMessage",
    inputs: [
      {
        type: "bytes32",
        name: "_messageId",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "fixMediatorBalance",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "address",
        name: "_receiver",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    name: "foreignTokenAddress",
    inputs: [
      {
        type: "address",
        name: "_homeToken",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "contract MultiTokenForwardingRulesManager",
      },
    ],
    name: "forwardingRulesManager",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "contract SelectorTokenGasLimitManager",
      },
    ],
    name: "gasLimitManager",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "pure",
    outputs: [
      {
        type: "uint64",
        name: "major",
        internalType: "uint64",
      },
      {
        type: "uint64",
        name: "minor",
        internalType: "uint64",
      },
      {
        type: "uint64",
        name: "patch",
        internalType: "uint64",
      },
    ],
    name: "getBridgeInterfacesVersion",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "pure",
    outputs: [
      {
        type: "bytes4",
        name: "_data",
        internalType: "bytes4",
      },
    ],
    name: "getBridgeMode",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "getCurrentDay",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "handleBridgedTokens",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "address",
        name: "_recipient",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "handleBridgedTokensAndCall",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "address",
        name: "_recipient",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
      {
        type: "bytes",
        name: "_data",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "handleNativeTokens",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "address",
        name: "_recipient",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "handleNativeTokensAndCall",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "address",
        name: "_recipient",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
      {
        type: "bytes",
        name: "_data",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    name: "homeTokenAddress",
    inputs: [
      {
        type: "address",
        name: "_foreignToken",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "initialize",
    inputs: [
      {
        type: "address",
        name: "_bridgeContract",
        internalType: "address",
      },
      {
        type: "address",
        name: "_mediatorContract",
        internalType: "address",
      },
      {
        type: "uint256[3]",
        name: "_dailyLimitMaxPerTxMinPerTxArray",
        internalType: "uint256[3]",
      },
      {
        type: "uint256[2]",
        name: "_executionDailyLimitExecutionMaxPerTxArray",
        internalType: "uint256[2]",
      },
      {
        type: "address",
        name: "_gasLimitManager",
        internalType: "address",
      },
      {
        type: "address",
        name: "_owner",
        internalType: "address",
      },
      {
        type: "address",
        name: "_tokenFactory",
        internalType: "address",
      },
      {
        type: "address",
        name: "_feeManager",
        internalType: "address",
      },
      {
        type: "address",
        name: "_forwardingRulesManager",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "isBridgedTokenDeployAcknowledged",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "isInitialized",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "isRegisteredAsNativeToken",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "isTokenRegistered",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "maxAvailablePerTx",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "maxPerTx",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "mediatorBalance",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    name: "mediatorContractOnOtherSide",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "messageFixed",
    inputs: [
      {
        type: "bytes32",
        name: "_messageId",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "migrateTo_3_3_0",
    inputs: [
      {
        type: "address",
        name: "_tokenFactory",
        internalType: "address",
      },
      {
        type: "address",
        name: "_forwardingRulesManager",
        internalType: "address",
      },
      {
        type: "address",
        name: "_gasLimitManager",
        internalType: "address",
      },
      {
        type: "address",
        name: "_feeManager",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "minPerTx",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    name: "nativeTokenAddress",
    inputs: [
      {
        type: "address",
        name: "_bridgedToken",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "onTokenTransfer",
    inputs: [
      {
        type: "address",
        name: "_from",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
      {
        type: "bytes",
        name: "_data",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "address",
      },
    ],
    name: "owner",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "relayTokens",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "contract IERC677",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "relayTokens",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "contract IERC677",
      },
      {
        type: "address",
        name: "_receiver",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "relayTokensAndCall",
    inputs: [
      {
        type: "address",
        name: "token",
        internalType: "contract IERC677",
      },
      {
        type: "address",
        name: "_receiver",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_value",
        internalType: "uint256",
      },
      {
        type: "bytes",
        name: "_data",
        internalType: "bytes",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "requestFailedMessageFix",
    inputs: [
      {
        type: "bytes32",
        name: "_messageId",
        internalType: "bytes32",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setBridgeContract",
    inputs: [
      {
        type: "address",
        name: "_bridgeContract",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setCustomTokenAddressPair",
    inputs: [
      {
        type: "address",
        name: "_nativeToken",
        internalType: "address",
      },
      {
        type: "address",
        name: "_bridgedToken",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setDailyLimit",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_dailyLimit",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setExecutionDailyLimit",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_dailyLimit",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setExecutionMaxPerTx",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_maxPerTx",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setFeeManager",
    inputs: [
      {
        type: "address",
        name: "_feeManager",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setForwardingRulesManager",
    inputs: [
      {
        type: "address",
        name: "_manager",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setGasLimitManager",
    inputs: [
      {
        type: "address",
        name: "_manager",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setMaxPerTx",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_maxPerTx",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setMediatorContractOnOtherSide",
    inputs: [
      {
        type: "address",
        name: "_mediatorContract",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setMinPerTx",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_minPerTx",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setTokenFactory",
    inputs: [
      {
        type: "address",
        name: "_tokenFactory",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "address",
        name: "",
        internalType: "contract TokenFactory",
      },
    ],
    name: "tokenFactory",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "totalExecutedPerDay",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_day",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    name: "totalSpentPerDay",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_day",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "transferOwnership",
    inputs: [
      {
        type: "address",
        name: "newOwner",
        internalType: "address",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "withinExecutionLimit",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_amount",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
    ],
    name: "withinLimit",
    inputs: [
      {
        type: "address",
        name: "_token",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "_amount",
        internalType: "uint256",
      },
    ],
  },
];

export class L2BridgeLimits__factory {
  static readonly abi = _abi;
  static createInterface(): L2BridgeLimitsInterface {
    return new utils.Interface(_abi) as L2BridgeLimitsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): L2BridgeLimits {
    return new Contract(address, _abi, signerOrProvider) as L2BridgeLimits;
  }
}
