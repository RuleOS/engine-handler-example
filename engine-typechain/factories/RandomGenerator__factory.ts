/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  RandomGenerator,
  RandomGeneratorInterface,
} from "../RandomGenerator";

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
    inputs: [],
    name: "cname",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "handler",
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
    name: "getRandomState",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "handler",
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
        internalType: "struct RandomGenerator.RandomState",
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
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
    ],
    name: "getTaskRandom",
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
    name: "makeRandomHash",
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
    name: "makeRandomPast",
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
  {
    inputs: [],
    name: "version",
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
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061174b806100206000396000f3fe608060405234801561001057600080fd5b50600436106100a45760003560e01c8063063738cb146100a957806334c76b25146100d1578063495fb7ec14610102578063524562271461011757806354fd4d50146101385780636209182e1461013f5780638a5ab27e14610152578063a3ee869214610165578063a8b6733214610185578063c0ca78c6146101a5578063edd2b62e146101c5578063f41fdf58146101e5575b600080fd5b6100bc6100b73660046110b2565b6101f8565b60405190151581526020015b60405180910390f35b604080518082018252600f81526e2930b73237b6a3b2b732b930ba37b960891b602082015290516100c89190611185565b6101156101103660046110b2565b610410565b005b61012a6101253660046111b5565b61043b565b6040519081526020016100c8565b600161012a565b61011561014d3660046112db565b61079f565b61012a6101603660046111b5565b6107d4565b61012a610173366004611337565b60016020526000908152604090205481565b61012a610193366004611337565b60026020526000908152604090205481565b6101b86101b3366004611350565b610a00565b6040516100c89190611391565b61012a6101d3366004611337565b60009081526002602052604090205490565b61012a6101f33660046111b5565b610b1d565b60008061020b338a8a8a8a8a8a8a610d8b565b600081815260016020908152604082205492935061022b90839083610e04565b90506102556040518060600160405280602c81526020016115df602c91398263ffffffff16610e23565b600061026d8360086102688460206114bf565b610e04565b9050600061027d338d8d8d610e6c565b6000818152602081815260409182902054825160608101909352602c80845293945060ff16926102b8929161160b908301398260ff16610e23565b6102dd6040518060600160405280602581526020016116f1602591398460ff16610e23565b63ffffffff841661034757610300856102f74360026114bf565b60206000610ec5565b9450610327856103118560016114d7565b60ff166008610322600060206114bf565b610ec5565b600096875260016020819052604090972055509394506104059350505050565b6040805160608101909152602280825263ffffffff8616409182916103759190611658602083013982610e23565b8015801561038857508563ffffffff1643115b156103f85760ff831661039c8660016114d7565b60ff1611156103b657600098505050505050505050610405565b6103c5876102f74360026114bf565b96506103d6876103118760016114d7565b6000988952600160208190526040909920555095965061040595505050505050565b6001985050505050505050505b979650505050505050565b60006104223389898989898989610d8b565b6000908152600160205260408120555050505050505050565b60008061044e338a8a8a8a8a8a8a610d8b565b600081815260016020908152604082205492935061046e90839083610e04565b90506104ae6040518060400160405280601c81526020017b16969696969696b6b0b5b2a930b73237b69036b9b39739b2b73232b960211b81525033610eea565b6104ed6040518060400160405280601d81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d20636c7573746572417265610000008152508c610eea565b6105306040518060400160405280601b81526020017a0b4b4b4b4b4b4b5b585ad954985b991bdb4818db1d5cdd195c9259602a1b8152508b63ffffffff16610e23565b610570604051806040016040528060188152602001770b4b4b4b4b4b4b5b585ad954985b991bdb481d185cdad25960421b8152508763ffffffff16610e23565b6105aa6040518060400160405280601881526020017716969696969696b6b0b5b2a930b73237b69031b0b63632b960411b81525086610eea565b6105e96040518060400160405280601e81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d20626c6f636b2e6e756d626572000081525043610e23565b61061160405180606001604052806023815260200161167a602391398263ffffffff16610e23565b6040805180820190915260198152780b4b4b4b4b4b4b5b585ad954985b991bdb481a185cda125b9d603a1b602082015263ffffffff8216409081906106569082610e23565b60008363ffffffff164311156106e557816106945761068c60405180606001604052806032815260200161169d60329139610f2f565b5060016106e9565b81156106e0576106a48f84610f75565b90506106e0604051806040016040528060188152602001772d2d2d2d2d2d2d6d616b6552616e646f6d2072616e646f6d60401b81525082610e23565b6106e9565b5060025b600381106107035760008681526002602052604090208190555b808d63ffffffff168f6001600160a01b03167f52e3fe42d8346380423537ead5419d357dc7032ccf34168bf0095498f407b4ae8f8f8f8f8f60405161074c9594939291906114fc565b60405180910390a461078d6040518060400160405280601881526020017705a5a5a5a5a5a5adac2d6caa4c2dcc8deda40ccd2dcd2e6d60431b815250610f2f565b9e9d5050505050505050505050505050565b60006107ad33868686610e6c565b6000908152602081905260409020805460ff191660ff939093169290921790915550505050565b6000806107e7338a8a8a8a8a8a8a610d8b565b600081815260016020908152604082205492935061080790839083610e04565b90506108476040518060400160405280601c81526020017b16969696969696b6b0b5b2a930b73237b69036b9b39739b2b73232b960211b81525033610eea565b6108866040518060400160405280601d81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d20636c7573746572417265610000008152508c610eea565b6108c96040518060400160405280601b81526020017a0b4b4b4b4b4b4b5b585ad954985b991bdb4818db1d5cdd195c9259602a1b8152508b63ffffffff16610e23565b610909604051806040016040528060188152602001770b4b4b4b4b4b4b5b585ad954985b991bdb481d185cdad25960421b8152508763ffffffff16610e23565b6109436040518060400160405280601881526020017716969696969696b6b0b5b2a930b73237b69031b0b63632b960411b81525086610eea565b6109826040518060400160405280601e81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d20626c6f636b2e6e756d626572000081525043610e23565b6109aa60405180606001604052806023815260200161167a602391398263ffffffff16610e23565b6040805180820190915260198152780b4b4b4b4b4b4b5b585ad954985b991bdb481a185cda125b9d603a1b602082015263ffffffff8216409081906109ef9082610e23565b9d9c50505050505050505050505050565b610a08610ff4565b6000610a1a8a8a8a8a8a8a8a8a610d8b565b9050610a24610ff4565b6001600160a01b03808c1682528a8116602080840191909152858216606084015263ffffffff808c16608085015261ffff808c1660a08601528a1660c085015291881660408085019190915287831660e0850152438316610120850152429092166101008401526000848152600182529182205491610aa4918391610e04565b63ffffffff16610180830152610ac2816008610268600060206114bf565b60ff1661016083015261018082015163ffffffff16406101a083018190526101c08301526000610af48d8c8c8c610e6c565b60009081526020819052604090205460ff1661014084015250909b9a5050505050505050505050565b600080610b30338a8a8a8a8a8a8a610d8b565b9050610b716040518060400160405280602081526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d50617374206d73672e73656e64657281525033610eea565b610b93604051806060016040528060218152602001611637602191398a610eea565b610bd86040518060400160405280601f81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d5061737420636c75737465724964008152508963ffffffff16610e23565b610c1d6040518060400160405280601c81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d50617374207461736b4964000000008152508563ffffffff16610e23565b610c5c6040518060400160405280601c81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d506173742063616c6c65720000000081525084610eea565b610c7e6040518060600160405280602281526020016116cf6022913943610e23565b6000610c8b600143611536565b4090506000610c9a8c83610f75565b6000848152600260209081526040918290208390558151808301909252601c82527f2d2d2d2d2d2d2d6d616b6552616e646f6d506173742072616e646f6d0000000090820152909150610ced9082610e23565b808a63ffffffff168c6001600160a01b03167f52e3fe42d8346380423537ead5419d357dc7032ccf34168bf0095498f407b4ae8c8c8c8c8c604051610d369594939291906114fc565b60405180910390a4610d7c6040518060400160405280601c81526020017f2d2d2d2d2d2d2d6d616b6552616e646f6d506173742066696e69736800000000815250610f2f565b9b9a5050505050505050505050565b604080516001600160a01b03998a16602080830191909152988a168183015263ffffffff978816606082015261ffff96871660808201529490951660a085015291871660c084015290931660e0820152919093166101008083019190915283518083039091018152610120909101909252815191012090565b91821c91600080610e18600180861b611536565b909416949350505050565b610e688282604051602401610e3992919061154d565b60408051601f198184030181529190526020810180516001600160e01b0316632d839cb360e21b179052610fd3565b5050565b604080516001600160a01b038616602082015263ffffffff85169181019190915261ffff80841660608301528216608082015260009060a001604051602081830303815290604052805190602001209050949350505050565b600083821b8183610ed9600180881b611536565b901b19969096161795945050505050565b610e688282604051602401610f0092919061156f565b60408051601f198184030181529190526020810180516001600160e01b031663319af33360e01b179052610fd3565b610f7281604051602401610f439190611185565b60408051601f198184030181529190526020810180516001600160e01b031663104c13eb60e21b179052610fd3565b50565b6000805a90506000813a42864189604051602001610f9896959493929190611599565b60408051808303601f190181529181528151602092830120326000908152600393849052919091208054909202019081905595945050505050565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b604080516101e081018252600080825260208201819052918101829052606081018290526080810182905260a0810182905260c0810182905260e08101829052610100810182905261012081018290526101408101829052610160810182905261018081018290526101a081018290526101c081019190915290565b80356001600160a01b038116811461108757600080fd5b919050565b803563ffffffff8116811461108757600080fd5b803561ffff8116811461108757600080fd5b600080600080600080600060e0888a0312156110cd57600080fd5b6110d688611070565b96506110e46020890161108c565b95506110f2604089016110a0565b9450611100606089016110a0565b935061110e60808901611070565b925061111c60a0890161108c565b915061112a60c08901611070565b905092959891949750929550565b6000815180845260005b8181101561115e57602081850181015186830182015201611142565b81811115611170576000602083870101525b50601f01601f19169290920160200192915050565b6020815260006111986020830184611138565b9392505050565b634e487b7160e01b600052604160045260246000fd5b600080600080600080600080610100898b0312156111d257600080fd5b883567ffffffffffffffff808211156111ea57600080fd5b818b0191508b601f8301126111fe57600080fd5b8135818111156112105761121061119f565b604051601f8201601f19908116603f011681019083821181831017156112385761123861119f565b816040528281528e602084870101111561125157600080fd5b82602086016020830137600060208483010152809c50505050505061127860208a01611070565b965061128660408a0161108c565b955061129460608a016110a0565b94506112a260808a016110a0565b93506112b060a08a01611070565b92506112be60c08a0161108c565b91506112cc60e08a01611070565b90509295985092959890939650565b600080600080608085870312156112f157600080fd5b6112fa8561108c565b9350611308602086016110a0565b9250611316604086016110a0565b9150606085013560ff8116811461132c57600080fd5b939692955090935050565b60006020828403121561134957600080fd5b5035919050565b600080600080600080600080610100898b03121561136d57600080fd5b61137689611070565b975061127860208a01611070565b6001600160a01b03169052565b60006101e0820190506113a5828451611384565b60208301516113b76020840182611384565b5060408301516113ca6040840182611384565b5060608301516113dd6060840182611384565b5060808301516113f5608084018263ffffffff169052565b5060a083015161140b60a084018261ffff169052565b5060c083015161142160c084018261ffff169052565b5060e083015161143960e084018263ffffffff169052565b506101008381015163ffffffff90811691840191909152610120808501518216908401526101408085015160ff90811691850191909152610160808601519091169084015261018080850151909116908301526101a080840151908301526101c092830151929091019190915290565b634e487b7160e01b600052601160045260246000fd5b600082198211156114d2576114d26114a9565b500190565b600060ff821660ff84168060ff038211156114f4576114f46114a9565b019392505050565b61ffff95861681529390941660208401526001600160a01b03918216604084015263ffffffff166060830152909116608082015260a00190565b600082821015611548576115486114a9565b500390565b6040815260006115606040830185611138565b90508260208301529392505050565b6040815260006115826040830185611138565b905060018060a01b03831660208301529392505050565b86815285602082015284604082015283606082015260018060a01b038316608082015260c060a082015260006115d260c0830184611138565b9897505050505050505056fe2d2d2d2d2d2d2d2d2d2d206d616b6552616e646f6d426c6f636b20667574757265426c6f636b4e756d6265722d2d2d2d2d2d2d2d2d2d206d616b6552616e646f6d426c6f636b2072756c65547269616c4d6178436f756e742d2d2d2d2d2d2d6d616b6552616e646f6d5061737420636c7573746572417265612d2d2d2d2d2d2d2d2d2d206d616b6552616e646f6d426c6f636b2068617368496e742d2d2d2d2d2d2d6d616b6552616e646f6d20667574757265426c6f636b4e756d6265722d2d2d2d2d2d2d6d616b6552616e646f6d20626c6f636b2e6e756d626572203e20667574757265426c6f636b4e756d6265722d2d2d2d2d2d2d6d616b6552616e646f6d5061737420626c6f636b2e6e756d6265722d2d2d2d2d2d2d2d2d2d206d616b6552616e646f6d426c6f636b20747269616c436f756e74a264697066735822122005655790ee29804cf80521c901ebf0919043872da8183b335927af5137d131cf64736f6c63430008080033";

export class RandomGenerator__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<RandomGenerator> {
    return super.deploy(overrides || {}) as Promise<RandomGenerator>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): RandomGenerator {
    return super.attach(address) as RandomGenerator;
  }
  connect(signer: Signer): RandomGenerator__factory {
    return super.connect(signer) as RandomGenerator__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RandomGeneratorInterface {
    return new utils.Interface(_abi) as RandomGeneratorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RandomGenerator {
    return new Contract(address, _abi, signerOrProvider) as RandomGenerator;
  }
}
