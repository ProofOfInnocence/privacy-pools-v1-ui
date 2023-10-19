/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PrivacyPool, PrivacyPoolInterface } from "../PrivacyPool";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IVerifier",
        name: "_verifier2",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "_levels",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "_hasher",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_maximumDepositAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "commitment",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "encryptedOutput",
        type: "bytes",
      },
    ],
    name: "NewCommitment",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "nullifier",
        type: "bytes32",
      },
    ],
    name: "NewNullifier",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "inputNullifier1",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "inputNullifier2",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "outputCommitment1",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "outputCommitment2",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "publicAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "index",
        type: "uint32",
      },
    ],
    name: "NewTxRecord",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "membershipProofURI",
        type: "string",
      },
    ],
    name: "NewWithdrawal",
    type: "event",
  },
  {
    inputs: [],
    name: "FIELD_SIZE",
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
    inputs: [],
    name: "MAX_EXT_AMOUNT",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_FEE",
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
    inputs: [],
    name: "ROOT_HISTORY_SIZE",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ZERO_VALUE",
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
    inputs: [],
    name: "__gap",
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
        internalType: "int256",
        name: "_extAmount",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
    ],
    name: "calculatePublicAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "currentRootIndex",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "filledSubtrees",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_left",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_right",
        type: "bytes32",
      },
    ],
    name: "hashLeftRight",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hasher",
    outputs: [
      {
        internalType: "contract IHasher",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_root",
        type: "bytes32",
      },
    ],
    name: "isKnownRoot",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_nullifierHash",
        type: "bytes32",
      },
    ],
    name: "isSpent",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastBalance",
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
    inputs: [],
    name: "levels",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maximumDepositAmount",
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
    inputs: [],
    name: "nextIndex",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
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
    name: "nullifierHashes",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "roots",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "proof",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "root",
            type: "bytes32",
          },
          {
            internalType: "bytes32[2]",
            name: "inputNullifiers",
            type: "bytes32[2]",
          },
          {
            internalType: "bytes32[2]",
            name: "outputCommitments",
            type: "bytes32[2]",
          },
          {
            internalType: "uint256",
            name: "publicAmount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "extDataHash",
            type: "bytes32",
          },
        ],
        internalType: "struct PrivacyPool.Proof",
        name: "_args",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "address",
            name: "recipient",
            type: "address",
          },
          {
            internalType: "int256",
            name: "extAmount",
            type: "int256",
          },
          {
            internalType: "address",
            name: "relayer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "fee",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "encryptedOutput1",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "encryptedOutput2",
            type: "bytes",
          },
          {
            internalType: "string",
            name: "membershipProofURI",
            type: "string",
          },
        ],
        internalType: "struct PrivacyPool.ExtData",
        name: "_extData",
        type: "tuple",
      },
    ],
    name: "transact",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "verifier2",
    outputs: [
      {
        internalType: "contract IVerifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "proof",
            type: "bytes",
          },
          {
            internalType: "bytes32",
            name: "root",
            type: "bytes32",
          },
          {
            internalType: "bytes32[2]",
            name: "inputNullifiers",
            type: "bytes32[2]",
          },
          {
            internalType: "bytes32[2]",
            name: "outputCommitments",
            type: "bytes32[2]",
          },
          {
            internalType: "uint256",
            name: "publicAmount",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "extDataHash",
            type: "bytes32",
          },
        ],
        internalType: "struct PrivacyPool.Proof",
        name: "_args",
        type: "tuple",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "i",
        type: "uint256",
      },
    ],
    name: "zeros",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x610100604052600280546001600160401b03191690553480156200002257600080fd5b5060405162002bd738038062002bd7833981016040819052620000459162000815565b838360008263ffffffff1611620000795760405162461bcd60e51b81526004016200007090620008c6565b60405180910390fd5b60208263ffffffff1610620000a25760405162461bcd60e51b815260040162000070906200088f565b6001600160e01b031960e083901b1660a0526001600160601b0319606082901b1660805260005b8263ffffffff168163ffffffff1610156200011a57620000ef63ffffffff821662000187565b63ffffffff821660009081526020819052604090205580620001118162000940565b915050620000c9565b506200012c63ffffffff831662000187565b60008052600160208190527fa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb499190915560035550506001600160601b0319606095861b811660c0529190941b1660e05250506006556200098a565b600081620001b757507f2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c62000810565b8160011415620001e957507f1a332ca2cd2436bdc6796e6e4244ebf6f7e359868b7252e55342f766e408808262000810565b81600214156200021b57507f2fb19ac27499bdf9d7d3b387eff42b6d12bffbc6206e81d0ef0b0d6b24520ebd62000810565b81600314156200024d57507f18d0d6e282d4eacbf18efc619a986db763b75095ed122fac7d4a49418daa42e162000810565b81600414156200027f57507f054dec40f76a0f5aaeff1a85a4a3721b92b4ad244362d30b0ef8ed7033de11d362000810565b8160051415620002b157507f1d24c91f8d40f1c2591edec19d392905cf5eb01eada48d71836177ef11aea5b262000810565b8160061415620002e357507f0fb63621cfc047eba2159faecfa55b120d7c81c0722633ef94e20e27675e378f62000810565b81600714156200031557507f277b08f214fe8c5504a79614cdec5abd7b6adc9133fe926398684c82fd798b4462000810565b81600814156200034757507f2633613437c1fd97f7c798e2ea30d52cfddee56d74f856a541320ae86ddaf2de62000810565b81600914156200037857507e768963fa4b993fbfece3619bfaa3ca4afd7e3864f11b09a0849dbf4ad2580762000810565b81600a1415620003aa57507f0e63ff9df484c1a21478bd27111763ef203177ec0a7ef3a3cd43ec909f587bb062000810565b81600b1415620003dc57507f0e6a4bfb0dd0ac8bf5517eaac48a95ba783dabe9f64494f9c892d3e8431eaab362000810565b81600c14156200040e57507f0164a46b3ffff8baca00de7a130a63d105f1578076838502b99488505d5b3d3562000810565b81600d14156200044057507f145a6f1521c02b250cc76eb35cd67c9b0b22473577de3778e4c51903836c895762000810565b81600e14156200047257507f29849fc5b55303a660bad33d986fd156d48516ec58a0f0a561a03b704a80225462000810565b81600f1415620004a457507f26639dd486b374e98ac6da34e8651b3fca58c51f1c2f857dd82045f27fc8dbe662000810565b8160101415620004d657507f2aa39214b887ee877e60afdb191390344c68177c30a0b8646649774174de5e3362000810565b81601114156200050857507f09b397d253e41a521d042ffe01f8c33ae37d4c7da21af68693aafb63d599d70862000810565b81601214156200053a57507f02fbfd397ad901cea38553239aefec016fcb6a19899038503f04814cbb79a51162000810565b81601314156200056c57507f266640a877ec97a91f6c95637f843eeac8718f53f311bac9cba7d958df646f9d62000810565b81601414156200059e57507f29f9a0a07a22ab214d00aaa0190f54509e853f3119009baecb0035347606b0a962000810565b8160151415620005d057507f0a1fda67bffa0ab3a755f23fdcf922720820b6a96616a5ca34643cd0b935e3d662000810565b81601614156200060257507f19507199eb76b5ec5abe538a01471d03efb6c6984739c77ec61ada2ba2afb38962000810565b81601714156200063457507f26bd93d26b751484942282e27acfb6d193537327a831df6927e19cdfc73c3e6462000810565b81601814156200066657507f2eb88a9c6b00a4bc6ea253268090fe1d255f6fe02d2eb745517723aae44d738662000810565b81601914156200069857507f13e50d0bda78be97792df40273cbb16f0dc65c0697d81a82d07d0f6eee80a16462000810565b81601a1415620006ca57507f2ea95776929000133246ff8d9fdcba179d0b262b9e910558309bac1c1ec03d7a62000810565b81601b1415620006fc57507f1a640d6ef66e356c795396c0957b06a99891afe0c493f4d0bdfc0450764bae6062000810565b81601c14156200072e57507f2b17979f2c2048dd9e4ee5f482cced21435ea8cc54c32f80562e39a5016b049662000810565b81601d14156200076057507f29ba6a30de50542e261abfc7ee0c68911002d3acd4dd4c02ad59aa96805b20bb62000810565b81601e14156200079257507f103fcf1c8a98ebe50285f6e669077a579308311fd44bb6895d5da7ba7fd3564e62000810565b81601f1415620007c457507f166bdd01780976e655f5278260c638dcf10fe7c136f37c9152cbcaabef901f4d62000810565b8160201415620007f657507f2712c601a9b8b2abd396a619327095d3f1ea86a6c07d6df416a3973a1a4b3ce562000810565b60405162461bcd60e51b8152600401620000709062000909565b919050565b600080600080600060a086880312156200082d578081fd5b85516200083a8162000971565b602087015190955063ffffffff8116811462000854578182fd5b6040870151909450620008678162000971565b60608701519093506200087a8162000971565b80925050608086015190509295509295909350565b6020808252601e908201527f5f6c6576656c732073686f756c64206265206c657373207468616e2033320000604082015260600190565b60208082526023908201527f5f6c6576656c732073686f756c642062652067726561746572207468616e207a60408201526265726f60e81b606082015260800190565b60208082526013908201527f496e646578206f7574206f6620626f756e647300000000000000000000000000604082015260600190565b600063ffffffff808316818114156200096757634e487b7160e01b83526011600452602483fd5b6001019392505050565b6001600160a01b03811681146200098757600080fd5b50565b60805160601c60a05160e01c60c05160601c60e05160601c6121cf62000a08600039600081816105b401528181610e7e015281816110550152818161116201526112210152600081816104eb01526107340152600081816104c7015281816114c8015261153d0152600081816104260152610e4801526121cf6000f3fe608060405234801561001057600080fd5b50600436106101735760003560e01c8063ba70f757116100de578063e5285dcc11610097578063ed33639f11610071578063ed33639f146102ba578063f178e47c146102c2578063fc0c546a146102d5578063fc7e9c6f146102dd57610173565b8063e5285dcc1461028c578063e82955881461029f578063ec732959146102b257610173565b8063ba70f7571461024e578063bc063e1a14610236578063c2b40ae414610256578063cb3dce9d14610269578063cd87a3b414610271578063cfcac5c11461027957610173565b80636d9833e3116101305780636d9833e3146102065780637236912f1461021957806378abb49b1461022e5780637fe24ffe146102365780638f1c56bd1461023e57806390eeb02b1461024657610173565b806317cc915c146101785780632570b7b4146101a157806338bf282e146101c1578063414a37ba146101d45780634ecf518b146101dc578063522d0d70146101f1575b600080fd5b61018b61018636600461186f565b6102e5565b6040516101989190611b0f565b60405180910390f35b6101b46101af3660046118c0565b6102fa565b6040516101989190611b1a565b6101b46101cf36600461189f565b6103a9565b6101b46104b3565b6101e46104c5565b6040516101989190611e7d565b6101f96104e9565b6040516101989190611a5d565b61018b61021436600461186f565b61050d565b61022c610227366004611905565b61058b565b005b6101b4610673565b6101b4610679565b6101b4610681565b6101e4610687565b6101b4610693565b6101b461026436600461186f565b6106ae565b6101b46106c0565b6101e46106c6565b61018b6102873660046118d2565b6106cb565b61018b61029a36600461186f565b6107c8565b6101b46102ad36600461186f565b6107dd565b6101b4610e22565b6101f9610e46565b6101b46102d036600461186f565b610e6a565b6101f9610e7c565b6101e4610ea0565b60076020526000908152604090205460ff1681565b6000600160f81b82106103285760405162461bcd60e51b815260040161031f90611cf3565b60405180910390fd5b610335600160f81b61211d565b831380156103465750600160f81b83125b6103625760405162461bcd60e51b815260040161031f90611bed565b600061036e8385612020565b9050600081121561039f576103828161211d565b61039a9060008051602061217a83398151915261205f565b6103a1565b805b949350505050565b600060008051602061217a83398151915283106103d85760405162461bcd60e51b815260040161031f90611c46565b60008051602061217a83398151915282106104055760405162461bcd60e51b815260040161031f90611cb2565b61040d611693565b8381526020810183905260405163014cf2b360e51b81527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063299e566090610463908490600401611ade565b60206040518083038186803b15801561047b57600080fd5b505afa15801561048f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103a19190611887565b60008051602061217a83398151915281565b7f000000000000000000000000000000000000000000000000000000000000000081565b7f000000000000000000000000000000000000000000000000000000000000000081565b60008161051c57506000610586565b60025463ffffffff16805b63ffffffff811660009081526001602052604090205484141561054f57600192505050610586565b63ffffffff811661055e575060645b806105688161209b565b9150508163ffffffff168163ffffffff161415610527576000925050505b919050565b6000816020015113156106655760208101516040516323b872dd60e01b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016916323b872dd916105ec913391309190600401611a71565b602060405180830381600087803b15801561060657600080fd5b505af115801561061a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061063e919061184f565b50600654816020015111156106655760405162461bcd60e51b815260040161031f90611e33565b61066f8282610eb4565b5050565b60065481565b600160f81b81565b60045481565b60025463ffffffff1681565b60025463ffffffff1660009081526001602052604090205490565b60016020526000908152604090205481565b60055481565b606481565b80516040805160e08101825260208085015182526080808601518284015260a080870151848601528487018051516060808701919091529051840151928501929092529086018051519184019190915251015160c0820152905163598da1d160e01b81526000927f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169263598da1d192610771929190600401611b76565b60206040518083038186803b15801561078957600080fd5b505afa15801561079d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107c1919061184f565b9050610586565b60009081526007602052604090205460ff1690565b60008161080b57507f2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c610586565b816001141561083b57507f1a332ca2cd2436bdc6796e6e4244ebf6f7e359868b7252e55342f766e4088082610586565b816002141561086b57507f2fb19ac27499bdf9d7d3b387eff42b6d12bffbc6206e81d0ef0b0d6b24520ebd610586565b816003141561089b57507f18d0d6e282d4eacbf18efc619a986db763b75095ed122fac7d4a49418daa42e1610586565b81600414156108cb57507f054dec40f76a0f5aaeff1a85a4a3721b92b4ad244362d30b0ef8ed7033de11d3610586565b81600514156108fb57507f1d24c91f8d40f1c2591edec19d392905cf5eb01eada48d71836177ef11aea5b2610586565b816006141561092b57507f0fb63621cfc047eba2159faecfa55b120d7c81c0722633ef94e20e27675e378f610586565b816007141561095b57507f277b08f214fe8c5504a79614cdec5abd7b6adc9133fe926398684c82fd798b44610586565b816008141561098b57507f2633613437c1fd97f7c798e2ea30d52cfddee56d74f856a541320ae86ddaf2de610586565b81600914156109ba57507e768963fa4b993fbfece3619bfaa3ca4afd7e3864f11b09a0849dbf4ad25807610586565b81600a14156109ea57507f0e63ff9df484c1a21478bd27111763ef203177ec0a7ef3a3cd43ec909f587bb0610586565b81600b1415610a1a57507f0e6a4bfb0dd0ac8bf5517eaac48a95ba783dabe9f64494f9c892d3e8431eaab3610586565b81600c1415610a4a57507f0164a46b3ffff8baca00de7a130a63d105f1578076838502b99488505d5b3d35610586565b81600d1415610a7a57507f145a6f1521c02b250cc76eb35cd67c9b0b22473577de3778e4c51903836c8957610586565b81600e1415610aaa57507f29849fc5b55303a660bad33d986fd156d48516ec58a0f0a561a03b704a802254610586565b81600f1415610ada57507f26639dd486b374e98ac6da34e8651b3fca58c51f1c2f857dd82045f27fc8dbe6610586565b8160101415610b0a57507f2aa39214b887ee877e60afdb191390344c68177c30a0b8646649774174de5e33610586565b8160111415610b3a57507f09b397d253e41a521d042ffe01f8c33ae37d4c7da21af68693aafb63d599d708610586565b8160121415610b6a57507f02fbfd397ad901cea38553239aefec016fcb6a19899038503f04814cbb79a511610586565b8160131415610b9a57507f266640a877ec97a91f6c95637f843eeac8718f53f311bac9cba7d958df646f9d610586565b8160141415610bca57507f29f9a0a07a22ab214d00aaa0190f54509e853f3119009baecb0035347606b0a9610586565b8160151415610bfa57507f0a1fda67bffa0ab3a755f23fdcf922720820b6a96616a5ca34643cd0b935e3d6610586565b8160161415610c2a57507f19507199eb76b5ec5abe538a01471d03efb6c6984739c77ec61ada2ba2afb389610586565b8160171415610c5a57507f26bd93d26b751484942282e27acfb6d193537327a831df6927e19cdfc73c3e64610586565b8160181415610c8a57507f2eb88a9c6b00a4bc6ea253268090fe1d255f6fe02d2eb745517723aae44d7386610586565b8160191415610cba57507f13e50d0bda78be97792df40273cbb16f0dc65c0697d81a82d07d0f6eee80a164610586565b81601a1415610cea57507f2ea95776929000133246ff8d9fdcba179d0b262b9e910558309bac1c1ec03d7a610586565b81601b1415610d1a57507f1a640d6ef66e356c795396c0957b06a99891afe0c493f4d0bdfc0450764bae60610586565b81601c1415610d4a57507f2b17979f2c2048dd9e4ee5f482cced21435ea8cc54c32f80562e39a5016b0496610586565b81601d1415610d7a57507f29ba6a30de50542e261abfc7ee0c68911002d3acd4dd4c02ad59aa96805b20bb610586565b81601e1415610daa57507f103fcf1c8a98ebe50285f6e669077a579308311fd44bb6895d5da7ba7fd3564e610586565b81601f1415610dda57507f166bdd01780976e655f5278260c638dcf10fe7c136f37c9152cbcaabef901f4d610586565b8160201415610e0a57507f2712c601a9b8b2abd396a619327095d3f1ea86a6c07d6df416a3973a1a4b3ce5610586565b60405162461bcd60e51b815260040161031f90611d7f565b7f2fe54c60d3acabf3343a35b6eba15db4821b340f76e741e2249685ed4899af6c81565b7f000000000000000000000000000000000000000000000000000000000000000081565b60006020819052908152604090205481565b7f000000000000000000000000000000000000000000000000000000000000000081565b600254640100000000900463ffffffff1681565b610ebc611481565b610ec9826020015161050d565b610ee55760405162461bcd60e51b815260040161031f90611c19565b60005b6002811015610f5157610f2283604001518260028110610f1857634e487b7160e01b600052603260045260246000fd5b60200201516107c8565b15610f3f5760405162461bcd60e51b815260040161031f90611d4f565b80610f49816120bb565b915050610ee8565b50610f64816020015182606001516102fa565b826080015114610f865760405162461bcd60e51b815260040161031f90611bbe565b610f8f826106cb565b610fab5760405162461bcd60e51b815260040161031f90611d18565b60005b600281101561101e5760016007600085604001518460028110610fe157634e487b7160e01b600052603260045260246000fd5b6020020151815260200190815260200160002060006101000a81548160ff0219169083151502179055508080611016906120bb565b915050610fae565b506000816020015112156111565780516001600160a01b03166110535760405162461bcd60e51b815260040161031f90611c7b565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663a9059cbb826000015183602001516110959061211d565b6040518363ffffffff1660e01b81526004016110b2929190611a95565b602060405180830381600087803b1580156110cc57600080fd5b505af11580156110e0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611104919061184f565b507f443690b64215dd4b5db3361671cc6055c724d6a1d466bd005373e593e6ea3bb6816000015182602001516111399061211d565b8360c0015160405161114d93929190611aae565b60405180910390a15b60608101511561120a577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663a9059cbb826040015183606001516040518363ffffffff1660e01b81526004016111b6929190611a95565b602060405180830381600087803b1580156111d057600080fd5b505af11580156111e4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611208919061184f565b505b6040516370a0823160e01b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906370a0823190611256903090600401611a5d565b60206040518083038186803b15801561126e57600080fd5b505afa158015611282573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112a69190611887565b600455606082015180516020909101516112c091906114ab565b50606082015151600280547ff3843eddcfcac65d12d9f26261dab50671fdbf5dc44441816c8bbdace2411afd929161130591640100000000900463ffffffff16612076565b836080015160405161131993929190611b51565b60405180910390a160608201517ff3843eddcfcac65d12d9f26261dab50671fdbf5dc44441816c8bbdace2411afd906001602002015160025461136c90600190640100000000900463ffffffff16612076565b8360a0015160405161138093929190611b51565b60405180910390a16040828101515190517f5e58f77bbf94b46d8d896e29753e4458c6e59b48581e20ed58c9558e96f297ce916113bc91611b1a565b60405180910390a16040828101516020015190517f5e58f77bbf94b46d8d896e29753e4458c6e59b48581e20ed58c9558e96f297ce916113fb91611b1a565b60405180910390a160408201518051602091820151606085015180519301516080860151600280547f71b14b28e3620b88b0e81f25941af9627f483c13b1fc9542e923320cbb792bc59693929161145f91640100000000900463ffffffff16612076565b60405161147196959493929190611b23565b60405180910390a161066f61168c565b600260035414156114a45760405162461bcd60e51b815260040161031f90611dfc565b6002600355565b6002805460009164010000000090910463ffffffff16906114ed907f000000000000000000000000000000000000000000000000000000000000000090611f49565b63ffffffff168163ffffffff1614156115185760405162461bcd60e51b815260040161031f90611dac565b6000611525600283611ee0565b9050600061153386866103a9565b905060008060015b7f000000000000000000000000000000000000000000000000000000000000000063ffffffff168163ffffffff1610156115fc5761157a6002866120fa565b63ffffffff166115b5578392506115968163ffffffff166107dd565b63ffffffff8216600090815260208190526040902085905591506115d1565b63ffffffff811660009081526020819052604090205492508391505b6115db83836103a9565b93506115e8600286611ee0565b9450806115f4816120d6565b91505061153b565b506002546000906064906116179063ffffffff166001611eb8565b61162191906120fa565b6002805463ffffffff191663ffffffff831690811782556000908152600160205260409020869055909150611657908790611eb8565b6002805463ffffffff929092166401000000000267ffffffff0000000019909216919091179055509394505050505092915050565b6001600355565b60405180604001604052806002906020820280368337509192915050565b80356001600160a01b038116811461058657600080fd5b600082601f8301126116d8578081fd5b6040516040810181811067ffffffffffffffff821117156116fb576116fb612163565b8060405250808385604086011115611711578384fd5b835b6002811015611732578135835260209283019290910190600101611713565b509195945050505050565b600082601f83011261174d578081fd5b813567ffffffffffffffff81111561176757611767612163565b61177a601f8201601f1916602001611e8e565b81815284602083860101111561178e578283fd5b816020850160208301379081016020019190915292915050565b600061010082840312156117ba578081fd5b60405160c0810167ffffffffffffffff82821081831117156117de576117de612163565b8160405282935084359150808211156117f657600080fd5b506118038582860161173d565b8252506020830135602082015261181d84604085016116c8565b604082015261182f84608085016116c8565b606082015260c0830135608082015260e083013560a08201525092915050565b600060208284031215611860578081fd5b8151801515811461039f578182fd5b600060208284031215611880578081fd5b5035919050565b600060208284031215611898578081fd5b5051919050565b600080604083850312156118b1578081fd5b50508035926020909101359150565b600080604083850312156118b1578182fd5b6000602082840312156118e3578081fd5b813567ffffffffffffffff8111156118f9578182fd5b6103a1848285016117a8565b60008060408385031215611917578182fd5b823567ffffffffffffffff8082111561192e578384fd5b61193a868387016117a8565b9350602085013591508082111561194f578283fd5b9084019060e08287031215611962578283fd5b61196c60e0611e8e565b611975836116b1565b81526020830135602082015261198d604084016116b1565b6040820152606083013560608201526080830135828111156119ad578485fd5b6119b98882860161173d565b60808301525060a0830135828111156119d0578485fd5b6119dc8882860161173d565b60a08301525060c0830135828111156119f3578485fd5b6119ff8882860161173d565b60c0830152508093505050509250929050565b60008151808452815b81811015611a3757602081850181015186830182015201611a1b565b81811115611a485782602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b0391909116815260200190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6001600160a01b03929092168252602082015260400190565b600060018060a01b038516825283602083015260606040830152611ad56060830184611a12565b95945050505050565b60408101818360005b6002811015611b06578151835260209283019290910190600101611ae7565b50505092915050565b901515815260200190565b90815260200190565b958652602086019490945260408501929092526060840152608083015263ffffffff1660a082015260c00190565b600084825263ffffffff8416602083015260606040830152611ad56060830184611a12565b6000610100808352611b8a81840186611a12565b91505060208083018460005b6007811015611bb357815183529183019190830190600101611b96565b505050509392505050565b602080825260159082015274125b9d985b1a59081c1d589b1a58c8185b5bdd5b9d605a1b604082015260600190565b602080825260129082015271125b9d985b1a5908195e1d08185b5bdd5b9d60721b604082015260600190565b602080825260139082015272125b9d985b1a59081b595c9adb19481c9bdbdd606a1b604082015260600190565b6020808252818101527f5f6c6566742073686f756c6420626520696e7369646520746865206669656c64604082015260600190565b6020808252601e908201527f43616e277420776974686472617720746f207a65726f20616464726573730000604082015260600190565b60208082526021908201527f5f72696768742073686f756c6420626520696e7369646520746865206669656c6040820152601960fa1b606082015260800190565b6020808252600b908201526a496e76616c69642066656560a81b604082015260600190565b60208082526019908201527f496e76616c6964207472616e73616374696f6e2070726f6f6600000000000000604082015260600190565b602080825260169082015275125b9c1d5d081a5cc8185b1c9958591e481cdc195b9d60521b604082015260600190565b602080825260139082015272496e646578206f7574206f6620626f756e647360681b604082015260600190565b60208082526030908201527f4d65726b6c6520747265652069732066756c6c2e204e6f206d6f7265206c656160408201526f1d995cc818d85b88189948185919195960821b606082015260800190565b6020808252601f908201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c00604082015260600190565b6020808252602a908201527f616d6f756e74206973206c6172676572207468616e206d6178696d756d4465706040820152691bdcda5d105b5bdd5b9d60b21b606082015260800190565b63ffffffff91909116815260200190565b60405181810167ffffffffffffffff81118282101715611eb057611eb0612163565b604052919050565b600063ffffffff808316818516808303821115611ed757611ed7612137565b01949350505050565b600063ffffffff80841680611ef757611ef761214d565b92169190910492915050565b80825b6001808611611f155750611f40565b818704821115611f2757611f27612137565b80861615611f3457918102915b9490941c938002611f06565b94509492505050565b600063ffffffff6103a181828616838616600082611f6957506001612019565b81611f7657506000612019565b8160018114611f8c5760028114611f9657611fc3565b6001915050612019565b60ff841115611fa757611fa7612137565b6001841b915084821115611fbd57611fbd612137565b50612019565b5060208310610133831016604e8410600b8410161715611ff6575081810a83811115611ff157611ff1612137565b612019565b6120038484846001611f03565b80860482111561201557612015612137565b0290505b9392505050565b60008083128015600160ff1b85018412161561203e5761203e612137565b6001600160ff1b038401831381161561205957612059612137565b50500390565b60008282101561207157612071612137565b500390565b600063ffffffff8381169083168181101561209357612093612137565b039392505050565b600063ffffffff8216806120b1576120b1612137565b6000190192915050565b60006000198214156120cf576120cf612137565b5060010190565b600063ffffffff808316818114156120f0576120f0612137565b6001019392505050565b600063ffffffff808416806121115761211161214d565b92169190910692915050565b6000600160ff1b82141561213357612133612137565b0390565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052601260045260246000fd5b634e487b7160e01b600052604160045260246000fdfe30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001a26469706673582212209fccc611aab4c20edbeff9c83e009469869cac3220a0783a0fda5d2e711c449764736f6c63430008000033";

export class PrivacyPool__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _verifier2: string,
    _levels: BigNumberish,
    _hasher: string,
    _token: string,
    _maximumDepositAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<PrivacyPool> {
    return super.deploy(
      _verifier2,
      _levels,
      _hasher,
      _token,
      _maximumDepositAmount,
      overrides || {}
    ) as Promise<PrivacyPool>;
  }
  getDeployTransaction(
    _verifier2: string,
    _levels: BigNumberish,
    _hasher: string,
    _token: string,
    _maximumDepositAmount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _verifier2,
      _levels,
      _hasher,
      _token,
      _maximumDepositAmount,
      overrides || {}
    );
  }
  attach(address: string): PrivacyPool {
    return super.attach(address) as PrivacyPool;
  }
  connect(signer: Signer): PrivacyPool__factory {
    return super.connect(signer) as PrivacyPool__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PrivacyPoolInterface {
    return new utils.Interface(_abi) as PrivacyPoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PrivacyPool {
    return new Contract(address, _abi, signerOrProvider) as PrivacyPool;
  }
}