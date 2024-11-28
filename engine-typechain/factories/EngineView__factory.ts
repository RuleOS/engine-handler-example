/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { EngineView, EngineViewInterface } from "../EngineView";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "inAddress",
        type: "address",
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
        internalType: "uint16",
        name: "round",
        type: "uint16",
      },
      {
        internalType: "uint8",
        name: "branch",
        type: "uint8",
      },
    ],
    name: "getBranchInputTokenList",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "idIndex",
            type: "uint256",
          },
        ],
        internalType: "struct Token.TokenHandler[]",
        name: "",
        type: "tuple[]",
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
        name: "outAddress",
        type: "address",
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
        internalType: "bytes",
        name: "args",
        type: "bytes",
      },
      {
        internalType: "uint16",
        name: "round",
        type: "uint16",
      },
      {
        internalType: "uint8",
        name: "branch",
        type: "uint8",
      },
    ],
    name: "getBranchOutputTokenList",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "idIndex",
            type: "uint256",
          },
        ],
        internalType: "struct Token.TokenHandler[]",
        name: "",
        type: "tuple[]",
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
            internalType: "uint32",
            name: "clusterId",
            type: "uint32",
          },
          {
            internalType: "uint32",
            name: "taskId",
            type: "uint32",
          },
          {
            internalType: "address",
            name: "claimer",
            type: "address",
          },
          {
            internalType: "uint8",
            name: "io",
            type: "uint8",
          },
          {
            internalType: "uint16",
            name: "round",
            type: "uint16",
          },
          {
            internalType: "uint8",
            name: "branch",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "tokenSlotIndex",
            type: "uint8",
          },
        ],
        internalType: "struct IHandler.Claim",
        name: "claim",
        type: "tuple",
      },
    ],
    name: "getClaimIOAddressBranchToken",
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
        internalType: "address",
        name: "engine",
        type: "address",
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
        internalType: "uint16",
        name: "round",
        type: "uint16",
      },
    ],
    name: "getInputAddressRound",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
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
        name: "inAddress",
        type: "address",
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
        internalType: "uint16",
        name: "round",
        type: "uint16",
      },
    ],
    name: "getInputAddressRoundBranch",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
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
        name: "stateCounter",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "taskId",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "round",
        type: "uint16",
      },
    ],
    name: "getOutputAddressRound",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
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
        name: "outAddress",
        type: "address",
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
        internalType: "bytes",
        name: "args",
        type: "bytes",
      },
      {
        internalType: "uint16",
        name: "round",
        type: "uint16",
      },
    ],
    name: "getOutputAddressRoundBranch",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
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
            internalType: "uint8",
            name: "erc",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "valueList",
            type: "uint256[]",
          },
        ],
        internalType: "struct Token.TokenTemplate",
        name: "tokenTemplate",
        type: "tuple",
      },
    ],
    name: "swapQuoteTokenTemplate",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50612ed9806100206000396000f3fe608060405234801561001057600080fd5b50600436106100785760003560e01c8063138bd2bf1461007d5780631cc4f041146100a657806350f7f922146100c957806362aa18f4146100ee57806362f0a7f71461010e5780637c8c8f23146101215780639f439b6b14610141578063f8eb258814610154575b600080fd5b61009061008b36600461182d565b610167565b60405161009d919061191a565b60405180910390f35b6100b96100b436600461198d565b6101fb565b604051901515815260200161009d565b6100dc6100d7366004611a55565b610368565b60405160ff909116815260200161009d565b6101016100fc366004611b3a565b610404565b60405161009d9190611be6565b6100dc61011c366004611c3f565b610800565b61013461012f366004611cd5565b610941565b60405161009d9190611d3c565b61013461014f366004611cd5565b610a6f565b610101610162366004611d7d565b610b3f565b6040516373b0333b60e11b815260609073__$1d93808c49adb5062914c75723341b8fb1$__9063e7606676906101a1908590600401611e63565b60006040518083038186803b1580156101b957600080fd5b505af41580156101cd573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526101f59190810190611edc565b92915050565b60006102296040518060600160405280602b8152602001612e44602b9139836080015163ffffffff16610d23565b60408083015160808401519151636c51371d60e11b815263ffffffff90921660048301526000916001600160a01b039091169063d8a26e3a9060240160006040518083038186803b15801561027d57600080fd5b505afa158015610291573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102b9919081019061212b565b90506102e1604051806060016040528060358152602001612e6f603591398260400151610d6c565b80604001516001600160a01b0316631cc4f041846040518263ffffffff1660e01b81526004016103119190612260565b60206040518083038186803b15801561032957600080fd5b505afa15801561033d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610361919061233e565b9392505050565b604051636c51371d60e11b815263ffffffff8316600482015260009081906001600160a01b0386169063d8a26e3a9060240160006040518083038186803b1580156103b257600080fd5b505afa1580156103c6573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526103ee919081019061212b565b90506103f981610db1565b979650505050505050565b604051636c51371d60e11b815263ffffffff851660048201526060906000906001600160a01b0388169063d8a26e3a9060240160006040518083038186803b15801561044f57600080fd5b505afa158015610463573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261048b919081019061212b565b9050600081604001516001600160a01b0316631eda6e4f8b8b85602001518661010001518d8860c001518d8d6040518963ffffffff1660e01b81526004016104da989796959493929190612385565b60006040518083038186803b1580156104f257600080fd5b505afa158015610506573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261052e91908101906123f1565b905060008083602001516001600160a01b0316631424e30c6040518163ffffffff1660e01b815260040160206040518083038186803b15801561057057600080fd5b505afa158015610584573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105a89190612473565b6001600160a01b0316632c34025e8561010001516105c587610de6565b6040516001600160e01b031960e085901b16815263ffffffff92909216600483015261ffff16602482015260ff8916604482015260640160006040518083038186803b15801561061457600080fd5b505afa158015610628573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261065091908101906126dd565b91509150600061065f84610e00565b905060008260000151516001600160401b03811115610680576106806116ae565b6040519080825280602002602001820160405280156106b957816020015b6106a6611604565b81526020019060019003908161069e5790505b50905060005b83515160ff821610156107ee57600084600001518260ff16815181106106e7576106e76127c6565b6020026020010151600001519050600073__$ed1c8bc2f6cc82c25e68a2af235b2f85c8$__631231db5360018b868a600001518860ff168151811061072e5761072e6127c6565b60200260200101518a6040518663ffffffff1660e01b8152600401610757959493929190612a94565b60606040518083038186803b15801561076f57600080fd5b505af4158015610783573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107a79190612bdf565b805190915060001914156107ba57600081525b80848460ff16815181106107d0576107d06127c6565b60200260200101819052505050806107e790612c50565b90506106bf565b509d9c50505050505050505050505050565b604051636c51371d60e11b815263ffffffff8416600482015260009081906001600160a01b0387169063d8a26e3a9060240160006040518083038186803b15801561084a57600080fd5b505afa15801561085e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610886919081019061212b565b9050600081604001516001600160a01b0316631eda6e4f8a8a85602001518661010001518c8860c001518c8c6040518963ffffffff1660e01b81526004016108d5989796959493929190612385565b60006040518083038186803b1580156108ed57600080fd5b505afa158015610901573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261092991908101906123f1565b905061093481611294565b9998505050505050505050565b604051636c51371d60e11b815263ffffffff831660048201526060906000906001600160a01b0386169063d8a26e3a9060240160006040518083038186803b15801561098c57600080fd5b505afa1580156109a0573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109c8919081019061212b565b905080604001516001600160a01b0316634b2dbcb8878360200151846101000151898660c00151896040518763ffffffff1660e01b8152600401610a1196959493929190612c70565b60006040518083038186803b158015610a2957600080fd5b505afa158015610a3d573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610a659190810190612cb3565b9695505050505050565b604051636c51371d60e11b815263ffffffff831660048201526060906000906001600160a01b0386169063d8a26e3a9060240160006040518083038186803b158015610aba57600080fd5b505afa158015610ace573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610af6919081019061212b565b905080604001516001600160a01b0316634b2e9b41878360200151846101000151898660c00151896040518763ffffffff1660e01b8152600401610a1196959493929190612c70565b604051636c51371d60e11b815263ffffffff841660048201526060906000906001600160a01b0387169063d8a26e3a9060240160006040518083038186803b158015610b8a57600080fd5b505afa158015610b9e573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610bc6919081019061212b565b90506000610bd3826112de565b60ff1682610140015151610be79190612ce7565b90506000816001600160401b03811115610c0357610c036116ae565b604051908082528060200260200182016040528015610c3c57816020015b610c29611604565b815260200190600190039081610c215790505b5090506000610c4f8361ffff8916612d09565b90505b82610c5e886001612d28565b61ffff16610c6c9190612d09565b811015610d1657610c7b611604565b8461014001518281518110610c9257610c926127c6565b6020908102919091010151604001518152610140850151805183908110610cbb57610cbb6127c6565b60209081029190910181015160600151908201528083610cdf8661ffff8c16612d09565b610ce99085612d4e565b81518110610cf957610cf96127c6565b60200260200101819052505080610d0f90612d65565b9050610c52565b5098975050505050505050565b610d688282604051602401610d39929190612d80565b60408051601f198184030181529190526020810180516001600160e01b0316632d839cb360e21b179052611319565b5050565b610d688282604051602401610d82929190612da2565b60408051601f198184030181529190526020810180516001600160e01b031663319af33360e01b179052611319565b60006101f58260a00151600860006008610dcb9190612dcc565b610dd6906010612dcc565b610de1906010612dcc565b61133a565b60006101f58260a00151601060006008610dd69190612dcc565b610e08611625565b6000610e1383611359565b90506000610e1f6113a6565b9050610e2a846113ed565b60ff168152610e3884611420565b60ff166020820152610e4984611457565b60ff166060820152610e5a84611294565b60ff166040820152610e6b846114a4565b60ff16610120820152835151600090610e8690600190612d4e565b90505b602061ffff84161061113e5781610120015160ff166001600160401b03811115610eb557610eb56116ae565b604051908082528060200260200182016040528015610ede578160200160208202803683370190505b5061014083015261012082015160ff166001600160401b03811115610f0557610f056116ae565b604051908082528060200260200182016040528015610f2e578160200160208202803683370190505b5061016083015261012082015160ff166001600160401b03811115610f5557610f556116ae565b604051908082528060200260200182016040528015610f7e578160200160208202803683370190505b5061018083015261012082015160ff166001600160401b03811115610fa557610fa56116ae565b604051908082528060200260200182016040528015610fce578160200160208202803683370190505b506101a083015261012082015160ff165b801561112b57855182610ff181612de4565b935081518110611003576110036127c6565b6020026020010151836101a001518261101b90612de4565b9250828151811061102e5761102e6127c6565b6001600160a01b039092166020928302919091019091015285518261105281612de4565b935081518110611064576110646127c6565b60200260200101518361018001518281518110611083576110836127c6565b60ff909216602092830291909101909101528551826110a181612de4565b9350815181106110b3576110b36127c6565b602002602001015183610160015182815181106110d2576110d26127c6565b60209081029190910101528551826110e981612de4565b9350815181106110fb576110fb6127c6565b6020026020010151836101400151828151811061111a5761111a6127c6565b602002602001018181525050610fdf565b50611137602084612dfb565b9250611279565b601061ffff84161061118e57845180518290811061115e5761115e6127c6565b602090810291909101015161010083015261117a601084612dfb565b92508061118681612de4565b915050611279565b600861ffff8416106111c95784518051829081106111ae576111ae6127c6565b602090810291909101015160e083015261117a600884612dfb565b600461ffff8416106112045784518051829081106111e9576111e96127c6565b602090810291909101015160c083015261117a600484612dfb565b600261ffff84161061123e5761121985611533565b63ffffffff1660a083018190526112335761271060a08301525b611137600284612dfb565b600161ffff84161061127957611253856115a1565b62ffffff166080830181905261126b57600160808301525b611276600184612dfb565b92505b61ffff83166112875761128c565b610e89565b509392505050565b60006101f582600001516000815181106112b0576112b06127c6565b6020026020010151600860ff16600060086112cb9190612e1e565b6112d6906004612e1e565b60ff1661133a565b60006101f58260a001516010600060086112f89190612dcc565b611303906010612dcc565b61130e906010612dcc565b610de1906008612dcc565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b91821c9160008061134e600180861b612d4e565b909416949350505050565b60006101f58260000151600081518110611375576113756127c6565b6020026020010151601060ff16600060086113909190612e1e565b61139b906004612e1e565b6112cb906008612e1e565b6113ae611625565b6113b6611625565b6000808252604082018190526127106080830181905260a0830181905260c083019190915260e08201819052610100820152919050565b60006101f58260000151600081518110611409576114096127c6565b6020026020010151600860ff16600060ff1661133a565b60006101f5826000015160008151811061143c5761143c6127c6565b6020026020010151600460ff16600060086112d69190612e1e565b60006101f58260000151600081518110611473576114736127c6565b6020026020010151600460ff166000600861148e9190612e1e565b611499906004612e1e565b6112d6906008612e1e565b60006101f582600001516000815181106114c0576114c06127c6565b6020026020010151600860ff16600060086114db9190612e1e565b6114e6906004612e1e565b6114f1906008612e1e565b6114fc906004612e1e565b611507906010612e1e565b611512906018612e1e565b61151d906020612e1e565b611528906020612e1e565b6112d6906020612e1e565b60006101f5826000015160008151811061154f5761154f6127c6565b6020026020010151602060ff166000600861156a9190612e1e565b611575906004612e1e565b611580906008612e1e565b61158b906004612e1e565b611596906010612e1e565b6112d6906018612e1e565b60006101f582600001516000815181106115bd576115bd6127c6565b6020026020010151601860ff16600060086115d89190612e1e565b6115e3906004612e1e565b6115ee906008612e1e565b6115f9906004612e1e565b6112d6906010612e1e565b60405180606001604052806000815260200160008152602001600081525090565b604051806101c00160405280600060ff168152602001600060ff168152602001600060ff168152602001600060ff168152602001600062ffffff168152602001600063ffffffff168152602001600081526020016000815260200160008152602001600060ff168152602001606081526020016060815260200160608152602001606081525090565b634e487b7160e01b600052604160045260246000fd5b604051606081016001600160401b03811182821017156116e6576116e66116ae565b60405290565b60405161014081016001600160401b03811182821017156116e6576116e66116ae565b60405160a081016001600160401b03811182821017156116e6576116e66116ae565b604080519081016001600160401b03811182821017156116e6576116e66116ae565b60405161018081016001600160401b03811182821017156116e6576116e66116ae565b604051608081016001600160401b03811182821017156116e6576116e66116ae565b604051601f8201601f191681016001600160401b03811182821017156117c0576117c06116ae565b604052919050565b60ff811681146117d757600080fd5b50565b80356117e5816117c8565b919050565b6001600160a01b03811681146117d757600080fd5b80356117e5816117ea565b60006001600160401b03821115611823576118236116ae565b5060051b60200190565b6000602080838503121561184057600080fd5b82356001600160401b038082111561185757600080fd5b908401906060828703121561186b57600080fd5b6118736116c4565b823561187e816117c8565b81528284013561188d816117ea565b818501526040830135828111156118a357600080fd5b80840193505086601f8401126118b857600080fd5b823591506118cd6118c88361180a565b611798565b82815260059290921b830184019184810190888411156118ec57600080fd5b938501935b8385101561190a578435825293850193908501906118f1565b6040830152509695505050505050565b6020808252825182820181905260009190848201906040850190845b8181101561195257835183529284019291840191600101611936565b50909695505050505050565b63ffffffff811681146117d757600080fd5b80356117e58161195e565b803561ffff811681146117e557600080fd5b600061014082840312156119a057600080fd5b6119a86116ec565b6119b1836117ff565b81526119bf602084016117ff565b60208201526119d0604084016117ff565b60408201526119e160608401611970565b60608201526119f260808401611970565b6080820152611a0360a084016117ff565b60a0820152611a1460c084016117da565b60c0820152611a2560e0840161197b565b60e0820152610100611a388185016117da565b90820152610120611a4a8482016117da565b908201529392505050565b600080600080600060a08688031215611a6d57600080fd5b8535611a78816117ea565b94506020860135611a88816117ea565b93506040860135611a98816117ea565b92506060860135611aa88161195e565b9150611ab66080870161197b565b90509295509295909350565b60006001600160401b03821115611adb57611adb6116ae565b50601f01601f191660200190565b600082601f830112611afa57600080fd5b8135611b086118c882611ac2565b818152846020838601011115611b1d57600080fd5b816020850160208301376000918101602001919091529392505050565b600080600080600080600060e0888a031215611b5557600080fd5b8735611b60816117ea565b96506020880135611b70816117ea565b95506040880135611b80816117ea565b94506060880135611b908161195e565b935060808801356001600160401b03811115611bab57600080fd5b611bb78a828b01611ae9565b935050611bc660a0890161197b565b915060c0880135611bd6816117c8565b8091505092959891949750929550565b602080825282518282018190526000919060409081850190868401855b82811015611c325781518051855286810151878601528501518585015260609093019290850190600101611c03565b5091979650505050505050565b60008060008060008060c08789031215611c5857600080fd5b8635611c63816117ea565b95506020870135611c73816117ea565b94506040870135611c83816117ea565b93506060870135611c938161195e565b925060808701356001600160401b03811115611cae57600080fd5b611cba89828a01611ae9565b925050611cc960a0880161197b565b90509295509295509295565b60008060008060808587031215611ceb57600080fd5b8435611cf6816117ea565b93506020850135611d06816117ea565b92506040850135611d168161195e565b9150611d246060860161197b565b905092959194509250565b6001600160a01b03169052565b6020808252825182820181905260009190848201906040850190845b818110156119525783516001600160a01b031683529284019291840191600101611d58565b600080600080600060a08688031215611d9557600080fd5b8535611da0816117ea565b94506020860135611db0816117ea565b93506040860135611dc08161195e565b9250611dce6060870161197b565b91506080860135611dde816117c8565b809150509295509295909350565b600081518084526020808501945080840160005b83811015611e1c57815187529582019590820190600101611e00565b509495945050505050565b60ff815116825260018060a01b0360208201511660208301526000604082015160606040850152611e5b6060850182611dec565b949350505050565b6020815260006103616020830184611e27565b600082601f830112611e8757600080fd5b81516020611e976118c88361180a565b82815260059290921b84018101918181019086841115611eb657600080fd5b8286015b84811015611ed15780518352918301918301611eba565b509695505050505050565b600060208284031215611eee57600080fd5b81516001600160401b03811115611f0457600080fd5b611e5b84828501611e76565b80516117e5816117ea565b80516117e58161195e565b80516117e5816117c8565b600082601f830112611f4257600080fd5b81516020611f526118c88361180a565b82815260059290921b84018101918181019086841115611f7157600080fd5b8286015b84811015611ed15780516001600160401b0380821115611f9457600080fd5b9088019060a0828b03601f19011215611fac57600080fd5b611fb461170f565b86830151611fc1816117c8565b8152604083810151611fd2816117ea565b828901526060848101518284015260808501519083015260a084015183811115611ffc5760008081fd5b8085019450508b603f85011261201457600092508283fd5b8784015192506120266118c88461180a565b83815260069390931b8401810192888101908d8511156120465760008081fd5b948201945b848610156120a05782868f0312156120635760008081fd5b61206b611731565b86516120768161195e565b8152868b0151600481900b811461208d5760008081fd5b818c01528252948201949089019061204b565b6080840152505085525050918301918301611f75565b60005b838110156120d15781810151838201526020016120b9565b838111156120e0576000848401525b50505050565b600082601f8301126120f757600080fd5b81516121056118c882611ac2565b81815284602083860101111561211a57600080fd5b611e5b8260208301602087016120b6565b60006020828403121561213d57600080fd5b81516001600160401b038082111561215457600080fd5b90830190610180828603121561216957600080fd5b612171611753565b61217a83611f10565b815261218860208401611f10565b602082015261219960408401611f10565b60408201526121aa60608401611f10565b60608201526080830151608082015260a083015160a08201526121cf60c08401611f1b565b60c08201526121e060e08401611f1b565b60e08201526101006121f3818501611f1b565b90820152610120612205848201611f26565b90820152610140838101518381111561221d57600080fd5b61222988828701611f31565b828401525050610160808401518381111561224357600080fd5b61224f888287016120e6565b918301919091525095945050505050565b600061014082019050612274828451611d2f565b60208301516122866020840182611d2f565b5060408301516122996040840182611d2f565b5060608301516122b1606084018263ffffffff169052565b5060808301516122c9608084018263ffffffff169052565b5060a08301516122dc60a0840182611d2f565b5060c08301516122f160c084018260ff169052565b5060e083015161230760e084018261ffff169052565b506101008381015160ff908116918401919091526101209384015116929091019190915290565b805180151581146117e557600080fd5b60006020828403121561235057600080fd5b6103618261232e565b600081518084526123718160208601602086016120b6565b601f01601f19169290920160200192915050565b6001600160a01b0389811682528881166020830152878116604083015263ffffffff87811660608401529086166080830152841660a082015261010060c082018190526000906123d783820186612359565b91505061ffff831660e08301529998505050505050505050565b60006020828403121561240357600080fd5b81516001600160401b038082111561241a57600080fd5b908301906020828603121561242e57600080fd5b604051602081018181108382111715612449576124496116ae565b60405282518281111561245b57600080fd5b61246787828601611e76565b82525095945050505050565b60006020828403121561248557600080fd5b8151610361816117ea565b600082601f8301126124a157600080fd5b815160206124b16118c88361180a565b82815260059290921b840181019181810190868411156124d057600080fd5b8286015b84811015611ed15780516124e7816117ea565b83529183019183016124d4565b600082601f83011261250557600080fd5b815160206125156118c88361180a565b82815260059290921b8401810191818101908684111561253457600080fd5b8286015b84811015611ed15780516001600160401b038082111561255757600080fd5b90880190601f196080838c038201121561257057600080fd5b612578611776565b878401518381111561258957600080fd5b84016060818e038401121561259d57600080fd5b6125a56116c4565b9250888101516125b4816117c8565b83526040818101516125c5816117ea565b848b01526060820151858111156125db57600080fd5b6125e98f8c83860101611e76565b82860152508383526125fc818701611f26565b8a840152606086015193508484111561261457600080fd5b6126228e8b86890101612490565b9083015250608084015191508282111561263b57600080fd5b6126498c8984870101611e76565b60608201528652505050918301918301612538565b600082601f83011261266f57600080fd5b8151602061267f6118c88361180a565b82815260059290921b8401810191818101908684111561269e57600080fd5b8286015b84811015611ed15780516001600160401b038111156126c15760008081fd5b6126cf8986838b01016120e6565b8452509183019183016126a2565b600080604083850312156126f057600080fd5b6126f98361232e565b915060208301516001600160401b038082111561271557600080fd5b9084019060a0828703121561272957600080fd5b61273161170f565b82518281111561274057600080fd5b61274c888286016124f4565b82525061275b60208401611f26565b602082015261276c60408401611f10565b604082015260608301518281111561278357600080fd5b61278f88828601612490565b6060830152506080830151828111156127a757600080fd5b6127b38882860161265e565b6080830152508093505050509250929050565b634e487b7160e01b600052603260045260246000fd5b600081518084526020808501808196508360051b810191508286016000805b8681101561289f578385038a528251805160ff168652868101516001600160a01b031687870152604080820151818801526060808301519088015260809182015160a0928801839052805192880183905288019160c088019185915b80831015612889578451805163ffffffff1685528b015160040b8b850152938a01939281019260019290920191612857565b5050509a87019a955050918501916001016127fb565b509298975050505050505050565b600081518084526020808501945080840160005b83811015611e1c5781516001600160a01b0316875295820195908201906001016128c1565b60008151608084526128fb6080850182611e27565b905060ff60208401511660208501526040830151848203604086015261292182826128ad565b9150506060830151848203606086015261293b8282611dec565b95945050505050565b600081518084526020808501945080840160005b83811015611e1c57815160ff1687529582019590820190600101612958565b805160ff16825260006101c06020830151612997602086018260ff169052565b5060408301516129ac604086018260ff169052565b5060608301516129c1606086018260ff169052565b5060808301516129d8608086018262ffffff169052565b5060a08301516129f060a086018263ffffffff169052565b5060c083015160c085015260e083015160e085015261010080840151818601525061012080840151612a268287018260ff169052565b5050610140808401518282870152612a4083870182611dec565b925050506101608084015185830382870152612a5c8382611dec565b925050506101808084015185830382870152612a788382612944565b925050506101a08084015185830382870152610a6583826128ad565b60ff8616815260a06020820152612aaf60a082018651611d2f565b60006020860151612ac360c0840182611d2f565b506040860151612ad660e0840182611d2f565b506060860151610100612aeb81850183611d2f565b60808801519150610120828186015260a08901519250610140838187015260c08a01519350610160612b248188018663ffffffff169052565b60e08b01519450610180612b3f8189018763ffffffff169052565b848c015163ffffffff166101a0890152838c015160ff166101c0890152828c01516101e08901919091529450612b796102208801866127dc565b9450808b01519350505050609f1984830301610200850152612b9b8282612359565b915050612bad604084018760ff169052565b8281036060840152612bbf81866128e6565b90508281036080840152612bd38185612977565b98975050505050505050565b600060608284031215612bf157600080fd5b604051606081018181106001600160401b0382111715612c1357612c136116ae565b80604052508251815260208301516020820152604083015160408201528091505092915050565b634e487b7160e01b600052601160045260246000fd5b600060ff821660ff811415612c6757612c67612c3a565b60010192915050565b6001600160a01b039687168152948616602086015263ffffffff93841660408601529190941660608401529216608082015261ffff90911660a082015260c00190565b600060208284031215612cc557600080fd5b81516001600160401b03811115612cdb57600080fd5b611e5b84828501612490565b600082612d0457634e487b7160e01b600052601260045260246000fd5b500490565b6000816000190483118215151615612d2357612d23612c3a565b500290565b600061ffff808316818516808303821115612d4557612d45612c3a565b01949350505050565b600082821015612d6057612d60612c3a565b500390565b6000600019821415612d7957612d79612c3a565b5060010190565b604081526000612d936040830185612359565b90508260208301529392505050565b604081526000612db56040830185612359565b905060018060a01b03831660208301529392505050565b60008219821115612ddf57612ddf612c3a565b500190565b600081612df357612df3612c3a565b506000190190565b600061ffff83811690831681811015612e1657612e16612c3a565b039392505050565b600060ff821660ff84168060ff03821115612e3b57612e3b612c3a565b01939250505056fe2d2d2d2d2d2d2d20676574436c61696d494f416464726573734272616e6368546f6b656e207461736b49642d2d2d2d2d2d2d20676574436c61696d494f416464726573734272616e6368546f6b656e207461736b2e6c61737448616e646c6572a2646970667358221220d35134fb0e54679f8a9a71376a5426ca582ee86dbd4d675a98a41ceca4e21bcb64736f6c63430008080033";

type EngineViewConstructorParams =
  | [linkLibraryAddresses: EngineViewLibraryAddresses, signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: EngineViewConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => {
  return (
    typeof xs[0] === "string" ||
    (Array.isArray as (arg: any) => arg is readonly any[])(xs[0]) ||
    "_isInterface" in xs[0]
  );
};

export class EngineView__factory extends ContractFactory {
  constructor(...args: EngineViewConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      const [linkLibraryAddresses, signer] = args;
      super(
        _abi,
        EngineView__factory.linkBytecode(linkLibraryAddresses),
        signer
      );
    }
  }

  static linkBytecode(
    linkLibraryAddresses: EngineViewLibraryAddresses
  ): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$1d93808c49adb5062914c75723341b8fb1\\$__", "g"),
      linkLibraryAddresses["contracts/V3/EngineUtil.sol:EngineUtil"]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$ed1c8bc2f6cc82c25e68a2af235b2f85c8\\$__", "g"),
      linkLibraryAddresses[
        "contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil"
      ]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<EngineView> {
    return super.deploy(overrides || {}) as Promise<EngineView>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): EngineView {
    return super.attach(address) as EngineView;
  }
  connect(signer: Signer): EngineView__factory {
    return super.connect(signer) as EngineView__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): EngineViewInterface {
    return new utils.Interface(_abi) as EngineViewInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): EngineView {
    return new Contract(address, _abi, signerOrProvider) as EngineView;
  }
}

export interface EngineViewLibraryAddresses {
  ["contracts/V3/EngineUtil.sol:EngineUtil"]: string;
  ["contracts/V3/util/TokenHandlerUtil.sol:TokenHandlerUtil"]: string;
}
