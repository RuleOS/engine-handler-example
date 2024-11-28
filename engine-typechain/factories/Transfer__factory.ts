/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Transfer, TransferInterface } from "../Transfer";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "allocationId",
        type: "uint16",
      },
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
        internalType: "uint8",
        name: "erc",
        type: "uint8",
      },
    ],
    name: "MintError",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "allocationId",
        type: "uint16",
      },
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
        internalType: "uint8",
        name: "erc",
        type: "uint8",
      },
    ],
    name: "TransferError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "io",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "ioType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "erc",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "ids",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    name: "InputOutput",
    type: "event",
  },
];

const _bytecode =
  "0x6139cf61003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600436106100615760003560e01c806326a675161461006657806348e0db2e1461008857806352a13914146100a857806374533e1e146100da578063e94f8ad7146100fa575b600080fd5b81801561007257600080fd5b50610086610081366004611e4e565b61011a565b005b81801561009457600080fd5b506100866100a3366004611f00565b6106ca565b8180156100b457600080fd5b506100c86100c3366004612044565b610aae565b60405190815260200160405180910390f35b8180156100e657600080fd5b506100c86100f53660046120c8565b61107b565b81801561010657600080fd5b50610086610115366004612171565b611576565b61012d8989868860ff168b8b8989611977565b60ff85166102a157610141612710826121f1565b6101519063ffffffff1683612214565b915061017560405180606001604052806031815260200161335c6031913984611a4d565b6101976040518060600160405280603381526020016128866033913988611a96565b6101b96040518060600160405280603181526020016134ce6031913987611a96565b6101db6040518060600160405280603581526020016127936035913983611a4d565b826101ef576101ea8683611adb565b6106bf565b604051637a681b7d60e01b81526001600160a01b03881690637a681b7d90610220906000908a908790600401612241565b600060405180830381600087803b15801561023a57600080fd5b505af192505050801561024b575060015b6101ea576102706040518060600160405280603581526020016129e260359139611bf6565b868685600086868a604051630e2702d560e21b81526004016102989796959493929190612266565b60405180910390fd5b60ff851660011415610446576102b9612710826121f1565b6102c99063ffffffff1683612214565b91506102ed604051806060016040528060358152602001612ced6035913985611a96565b61030f60405180606001604052806034815260200161281e6034913988611a96565b6103316040518060600160405280603281526020016135d76032913987611a96565b61035360405180606001604052806036815260200161356f6036913983611a4d565b6040516323b872dd60e01b81526001600160a01b038516906323b872dd90610383908a908a9087906004016122ad565b602060405180830381600087803b15801561039d57600080fd5b505af19250505080156103cd575060408051601f3d908101601f191682019092526103ca918101906122d1565b60015b6103f25761027060405180606001604052806035815260200161332760359139611bf6565b80610440576104186040518060600160405280603a8152602001612ada603a9139611bf6565b878786600087878b604051630e2702d560e21b81526004016102989796959493929190612266565b506106bf565b60ff85166002141561055a57610474604051806060016040528060368152602001612b146036913985611a96565b610496604051806060016040528060358152602001612c156035913988611a96565b6104b8604051806060016040528060338152602001612c4a6033913987611a96565b6104da60405180606001604052806033815260200161310c6033913984611a4d565b6040516323b872dd60e01b81526001600160a01b038516906323b872dd9061050a908a908a9088906004016122ad565b600060405180830381600087803b15801561052457600080fd5b505af1925050508015610535575060015b6101ea576102706040518060600160405280603681526020016130d660369139611bf6565b60ff8516600314156106bf57610572612710826121f1565b6105829063ffffffff1683612214565b91506105a6604051806060016040528060378152602001612cb66037913985611a96565b6105c8604051806060016040528060368152602001612bdf6036913988611a96565b6105ea604051806060016040528060348152602001612f8b6034913987611a96565b61060c6040518060600160405280603481526020016137756034913984611a4d565b61062e604051806060016040528060388152602001612d6b6038913983611a4d565b60408051600081526020810191829052637921219560e11b9091526001600160a01b0385169063f242432a9061066f908a908a908890889060248101612347565b600060405180830381600087803b15801561068957600080fd5b505af192505050801561069a575060015b6106bf5761027060405180606001604052806037815260200161385460379139611bf6565b505050505050505050565b60ff85166107e9576106de612710826121f1565b6106ee9063ffffffff1683612214565b91506107186040518060a00160405280606381526020016130346063913989868a61ffff16611c3c565b61073b6040518060800160405280604c8152602001612f01604c91398784611c8b565b604051637a681b7d60e01b81526001600160a01b03891690637a681b7d9061076c906000908a908790600401612241565b600060405180830381600087803b15801561078657600080fd5b505af1925050508015610797575060015b6107e4576107bc60405180608001604052806041815260200161388b60419139611bf6565b878685600086868a604051630e2702d560e21b81526004016102989796959493929190612266565b610aa4565b60ff8516600114156108e057610801612710826121f1565b6108119063ffffffff1683612214565b915061083b6040518060a00160405280606481526020016137116064913989868a61ffff16611c3c565b61085e6040518060800160405280604d8152602001612995604d91398784611c8b565b6040516306b8bb1d60e31b81526001600160a01b038916906335c5d8e8906108909087908b908b908890600401612381565b600060405180830381600087803b1580156108aa57600080fd5b505af19250505080156108bb575060015b6107e4576107bc60405180608001604052806042815260200161352d60429139611bf6565b60ff8516600214156109b9576109146040518060a0016040528060658152602001612de66065913989868a61ffff16611c3c565b6109376040518060800160405280604a81526020016133f2604a91398785611c8b565b604051637507dae160e11b81526001600160a01b0389169063ea0fb5c2906109699087908b908b908990600401612381565b600060405180830381600087803b15801561098357600080fd5b505af1925050508015610994575060015b6107e4576107bc604051806080016040528060438152602001612da360439139611bf6565b60ff851660031415610aa4576109ed6040518060a00160405280606681526020016137ee6066913989868a61ffff16611c3c565b610a116040518060800160405280605681526020016127c860569139878585611cd2565b604080516000815260208101918290526322fc9e1360e21b9091526001600160a01b03891690638bf2784c90610a549087908b908b9089908990602481016123af565b600060405180830381600087803b158015610a6e57600080fd5b505af1925050508015610a7f575060015b610aa4576107bc60405180608001604052806044815260200161325a60449139611bf6565b5050505050505050565b60008360ff871660011415610bf057610adf6040518060600160405280603181526020016131f46031913987611a96565b610b016040518060600160405280602e81526020016134ff602e913989611a96565b610b23604051806060016040528060328152602001612ecf6032913985611a4d565b6040516340c10f1960e01b81526001600160a01b038716906340c10f1990610b51908b9088906004016123ff565b600060405180830381600087803b158015610b6b57600080fd5b505af1925050508015610b7c575060015b610beb57610ba160405180606001604052806031815260200161349d60319139611bf6565b6040516319541d3560e21b81526001600160a01b03808a1660048301528716602482015260006044820152606481018690526084810185905260ff881660a482015260c401610298565b61104e565b60ff871660021415610f38578315610d3257610c24604051806060016040528060388152602001612e976038913986611a4d565b610c466040518060600160405280603281526020016135a56032913987611a96565b610c68604051806060016040528060398152602001612c7d6039913989611a96565b610c8a6040518060600160405280603d8152602001612958603d913985611a4d565b604051630922dc7f60e21b81526001600160a01b0387169063248b71fc90610cb8908b9088906004016123ff565b600060405180830381600087803b158015610cd257600080fd5b505af1925050508015610d0757506040513d6000823e601f3d908101601f19168201604052610d049190810190612418565b60015b610d2c57610ba160405180606001604052806032815260200161338d60329139611bf6565b5061104e565b600085118015610d40575083155b15610e2b57610d676040518060600160405280603281526020016135a56032913987611a96565b610d896040518060600160405280603581526020016132256035913989611a96565b610dab6040518060600160405280603581526020016136dc6035913986611a4d565b604051636eeaf0d960e11b8152600481018690526001600160a01b03898116602483015287169063ddd5e1b290604401600060405180830381600087803b158015610df557600080fd5b505af1925050508015610e06575060015b610beb57610beb60405180606001604052806032815260200161338d60329139611bf6565b84610beb57610e526040518060600160405280603281526020016135a56032913987611a96565b610e746040518060600160405280603e8152602001612f4d603e913989611a96565b6040516335313c2160e11b81526001600160a01b03871690636a62784290610ea0908b906004016124b1565b602060405180830381600087803b158015610eba57600080fd5b505af1925050508015610eea575060408051601f3d908101601f19168201909252610ee7918101906124c5565b60015b610f0f57610ba160405180606001604052806032815260200161338d60329139611bf6565b610f316040518060600160405280603481526020016128526034913982611a4d565b905061104e565b60ff87166003141561104e57610f66604051806060016040528060338152602001612fbf6033913987611a96565b610f88604051806060016040528060358152602001612b4a6035913989611a96565b610faa60405180606001604052806035815260200161313f6035913986611a4d565b610fcc6040518060600160405280603981526020016131746039913985611a4d565b60405163731133e960e01b81526001600160a01b0387169063731133e990610ffe908b908990899089906004016124de565b600060405180830381600087803b15801561101857600080fd5b505af1925050508015611029575060015b61104e57610ba16040518060600160405280603381526020016133bf60339139611bf6565b6110706040518060600160405280602d815260200161396d602d913982611a4d565b979650505050505050565b60008360ff87166001141561115c576110b2604051806080016040528060608152602001612b7f606091398b888c61ffff16611c3c565b6110d5604051806080016040528060498152602001612d22604991398986611c8b565b60405163042ad7eb60e41b81526001600160a01b038b16906342ad7eb0906111079089908d908d908a90600401612381565b600060405180830381600087803b15801561112157600080fd5b505af1925050508015611132575060015b61115757610ba16040518060600160405280603e815260200161329e603e9139611bf6565b611547565b60ff87166002141561146957831561125d576111966040518060a001604052806061815260200161343c606191398b888c61ffff16611c3c565b6111b9604051806080016040528060548152602001612904605491398986611c8b565b6111db6040518060800160405280604581526020016137a96045913986611a4d565b6040516328d8d86560e01b81526001600160a01b038b16906328d8d8659061120d9089908d908d908a90600401612381565b600060405180830381600087803b15801561122757600080fd5b505af1925050508015611238575060015b61115757610ba16040518060600160405280603f81526020016138cc603f9139611bf6565b60008511801561126b575083155b1561134d576112986040518060a001604052806061815260200161343c606191398b888c61ffff16611c3c565b6112bb6040518060800160405280604c8152602001612e4b604c91398987611c8b565b604051631869033960e21b81526001600160a01b03878116600483015261ffff8b1660248301526044820187905289811660648301528b16906361a40ce490608401600060405180830381600087803b15801561131757600080fd5b505af1925050508015611328575060015b611157576111576040518060600160405280603f81526020016138cc603f9139611bf6565b84611157576113746040518060600160405280603f8152602001613097603f913987611a96565b6113966040518060800160405280604b81526020016128b9604b913989611a96565b6040516350b576f760e11b81526001600160a01b03878116600483015261ffff8b16602483015289811660448301528b169063a16aedee90606401602060405180830381600087803b1580156113eb57600080fd5b505af192505050801561141b575060408051601f3d908101601f19168201909252611418918101906124c5565b60015b61144057610ba16040518060600160405280603f81526020016138cc603f9139611bf6565b6114626040518060800160405280604181526020016136496041913982611a4d565b9050611547565b60ff8716600314156115475761149d6040518060a001604052806062815260200161390b606291398b888c61ffff16611c3c565b6114c160405180608001604052806052815260200161368a60529139898787611cd2565b60405163b5e32f4d60e01b81526001600160a01b038b169063b5e32f4d906114f79089908d908d908b908b908b906004016123af565b600060405180830381600087803b15801561151157600080fd5b505af1925050508015611522575060015b61154757610ba160405180606001604052806040815260200161360960409139611bf6565b6115696040518060600160405280603a8152602001612a5f603a913982611a4d565b9998505050505050505050565b60ff851661162a5761271061159163ffffffff831684612214565b61159b9190612515565b91506115c16040518060800160405280604781526020016131ad60479139848885611d1b565b81866001600160a01b031631101561161b5760405162461bcd60e51b815260206004820152601d60248201527f434f494e2062616c616e636520636865636b206578697374206661696c0000006044820152606401610298565b6116258683611adb565b61196f565b60ff8516600114156117455761271061164963ffffffff831684612214565b6116539190612515565b91506116796040518060800160405280604b81526020016132dc604b9139858885611c3c565b6040516370a0823160e01b815282906001600160a01b038616906370a08231906116a7908a906004016124b1565b60206040518083038186803b1580156116bf57600080fd5b505afa1580156116d3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116f791906124c5565b10156116255760405162461bcd60e51b815260206004820152601e60248201527f45524332302062616c616e636520636865636b206578697374206661696c00006044820152606401610298565b60ff85166002141561184557611775604051806080016040528060488152602001612a1760489139858886611c3c565b6040516331a9108f60e11b8152600481018490526001600160a01b038088169190861690636352211e9060240160206040518083038186803b1580156117ba57600080fd5b505afa1580156117ce573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117f29190612529565b6001600160a01b0316146116255760405162461bcd60e51b815260206004820152601a602482015279115490cdcc8c481a590818da1958dac8195e1a5cdd0819985a5b60321b6044820152606401610298565b60ff85166003141561196f57611874604051806080016040528060428152602001612ff2604291398588611d64565b611897604051806080016040528060418152602001612a99604191398484611dab565b604051627eeac760e11b815282906001600160a01b0386169062fdd58e906118c5908a9088906004016123ff565b60206040518083038186803b1580156118dd57600080fd5b505afa1580156118f1573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061191591906124c5565b101561196f5760405162461bcd60e51b815260206004820152602360248201527f455243313135352069642e62616c616e636520636865636b2065786973742066604482015262185a5b60ea1b6064820152608401610298565b505050505050565b6040805160018082528183019092526000916020808301908036833701905050905082816000815181106119ad576119ad612546565b602090810291909101015260408051600180825281830190925260009181602001602082028036833701905050905082816000815181106119f0576119f0612546565b6020026020010181815250507fb07024e91aef8d640dd486ad128e9c6144c3e46a9df4cb6dc6a1a6dd0df3d79d8a8a8a8a8a8a8888604051611a39989796959493929190612597565b60405180910390a150505050505050505050565b611a928282604051602401611a63929190612607565b60408051601f198184030181529190526020810180516001600160e01b0316632d839cb360e21b179052611dee565b5050565b611a928282604051602401611aac929190612629565b60408051601f198184030181529190526020810180516001600160e01b031663319af33360e01b179052611dee565b80471015611b2b5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a20696e73756666696369656e742062616c616e63650000006044820152606401610298565b6000826001600160a01b03168260405160006040518083038185875af1925050503d8060008114611b78576040519150601f19603f3d011682016040523d82523d6000602084013e611b7d565b606091505b5050905080611bf15760405162461bcd60e51b815260206004820152603a60248201527f416464726573733a20756e61626c6520746f2073656e642076616c75652c20726044820152791958da5c1a595b9d081b585e481a185d99481c995d995c9d195960321b6064820152608401610298565b505050565b611c3981604051602401611c0a9190612653565b60408051601f198184030181529190526020810180516001600160e01b031663104c13eb60e21b179052611dee565b50565b611c8584848484604051602401611c569493929190612666565b60408051601f198184030181529190526020810180516001600160e01b0316638ef3f39960e01b179052611dee565b50505050565b611bf1838383604051602401611ca39392919061269c565b60408051601f198184030181529190526020810180516001600160e01b0316630d26b92560e01b179052611dee565b611c8584848484604051602401611cec94939291906126ca565b60408051601f198184030181529190526020810180516001600160e01b0316637c7a8d8f60e11b179052611dee565b611c8584848484604051602401611d359493929190612702565b60408051601f198184030181529190526020810180516001600160e01b03166327827ee360e11b179052611dee565b611bf1838383604051602401611d7c9392919061273a565b60408051601f198184030181529190526020810180516001600160e01b03166307e763af60e51b179052611dee565b611bf1838383604051602401611dc39392919061276d565b60408051601f198184030181529190526020810180516001600160e01b031663ca47c4eb60e01b1790525b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b803560ff81168114611e2057600080fd5b919050565b6001600160a01b0381168114611c3957600080fd5b803563ffffffff81168114611e2057600080fd5b60008060008060008060008060006101208a8c031215611e6d57600080fd5b611e768a611e0f565b9850611e8460208b01611e0f565b975060408a0135611e9481611e25565b965060608a0135611ea481611e25565b9550611eb260808b01611e0f565b945060a08a0135611ec281611e25565b935060c08a0135925060e08a01359150611edf6101008b01611e3a565b90509295985092959850929598565b803561ffff81168114611e2057600080fd5b600080600080600080600080610100898b031215611f1d57600080fd5b8835611f2881611e25565b9750611f3660208a01611eee565b96506040890135611f4681611e25565b9550611f5460608a01611e0f565b94506080890135611f6481611e25565b935060a0890135925060c08901359150611f8060e08a01611e3a565b90509295985092959890939650565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b0381118282101715611fcd57611fcd611f8f565b604052919050565b600082601f830112611fe657600080fd5b81356001600160401b03811115611fff57611fff611f8f565b612012601f8201601f1916602001611fa5565b81815284602083860101111561202757600080fd5b816020850160208301376000918101602001919091529392505050565b60008060008060008060c0878903121561205d57600080fd5b863561206881611e25565b955061207660208801611e0f565b9450604087013561208681611e25565b9350606087013592506080870135915060a08701356001600160401b038111156120af57600080fd5b6120bb89828a01611fd5565b9150509295509295509295565b600080600080600080600080610100898b0312156120e557600080fd5b88356120f081611e25565b97506120fe60208a01611eee565b9650604089013561210e81611e25565b955061211c60608a01611e0f565b9450608089013561212c81611e25565b935060a0890135925060c0890135915060e08901356001600160401b0381111561215557600080fd5b6121618b828c01611fd5565b9150509295985092959890939650565b60008060008060008060c0878903121561218a57600080fd5b863561219581611e25565b95506121a360208801611e0f565b945060408701356121b381611e25565b935060608701359250608087013591506121cf60a08801611e3a565b90509295509295509295565b634e487b7160e01b600052601260045260246000fd5b600063ffffffff80841680612208576122086121db565b92169190910492915050565b600081600019048311821515161561223c57634e487b7160e01b600052601160045260246000fd5b500290565b61ffff9390931683526001600160a01b03919091166020830152604082015260600190565b6001600160a01b039788168152958716602087015293909516604085015261ffff919091166060840152608083015260a082019290925260ff90911660c082015260e00190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b6000602082840312156122e357600080fd5b815180151581146122f357600080fd5b9392505050565b6000815180845260005b8181101561232057602081850181015186830182015201612304565b81811115612332576000602083870101525b50601f01601f19169290920160200192915050565b6001600160a01b03868116825285166020820152604081018490526060810183905260a060808201819052600090611070908301846122fa565b6001600160a01b03948516815261ffff93909316602084015292166040820152606081019190915260800190565b6001600160a01b03878116825261ffff8716602083015285166040820152606081018490526080810183905260c060a082018190526000906123f3908301846122fa565b98975050505050505050565b6001600160a01b03929092168252602082015260400190565b6000602080838503121561242b57600080fd5b82516001600160401b038082111561244257600080fd5b818501915085601f83011261245657600080fd5b81518181111561246857612468611f8f565b8060051b9150612479848301611fa5565b818152918301840191848101908884111561249357600080fd5b938501935b838510156123f357845182529385019390850190612498565b6001600160a01b0391909116815260200190565b6000602082840312156124d757600080fd5b5051919050565b60018060a01b038516815283602082015282604082015260806060820152600061250b60808301846122fa565b9695505050505050565b600082612524576125246121db565b500490565b60006020828403121561253b57600080fd5b81516122f381611e25565b634e487b7160e01b600052603260045260246000fd5b600081518084526020808501945080840160005b8381101561258c57815187529582019590820190600101612570565b509495945050505050565b60ff8981168252881660208201526001600160a01b038781166040830152606082018790528581166080830152841660a082015261010060c082018190526000906125e48382018661255c565b905082810360e08401526125f8818561255c565b9b9a5050505050505050505050565b60408152600061261a60408301856122fa565b90508260208301529392505050565b60408152600061263c60408301856122fa565b905060018060a01b03831660208301529392505050565b6020815260006122f360208301846122fa565b60808152600061267960808301876122fa565b6001600160a01b0395861660208401529390941660408201526060015292915050565b6060815260006126af60608301866122fa565b6001600160a01b039490941660208301525060400152919050565b6080815260006126dd60808301876122fa565b6001600160a01b03959095166020830152506040810192909252606090910152919050565b60808152600061271560808301876122fa565b6020830195909552506001600160a01b03929092166040830152606090910152919050565b60608152600061274d60608301866122fa565b6001600160a01b0394851660208401529290931660409091015292915050565b60608152600061278060608301866122fa565b6020830194909452506040015291905056fe2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220434f494e20616d6f756e742d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e204552433131353520746f3a25732c2069643a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e736665722045524332302066726f6d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243373231206d696e742069642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220434f494e2066726f6d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20455243373231206d696e7420696e6372656d656e7420746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20455243373231206d696e74426174636820746f3a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243373231206d696e74426174636820616d6f756e742d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e20455243323020746f3a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220434f494e206572726f72312d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c69622062616c616e63652045524337323120746f6b656e3a25732c2066726f6d3a25732c2069643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20746f6b656e49642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c69622062616c616e636520455243313135352069643a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e73666572204552433230206572726f72206661696c2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e736665722045524337323120746f6b656e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e742045524331313535206d696e7420746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20455243323020706f6f6c546f6b656e3a25732c20746f6b656e3a25732c20616c6c6f636174696f6e49643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220455243313135352066726f6d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e73666572204552433732312066726f6d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e736665722045524337323120746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243373231206d696e74426174636820746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e73666572204552433131353520746f6b656e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220455243323020746f6b656e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20455243323020746f3a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e73666572204552433131353520616d6f756e742d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e20455243373231206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e2045524337323120706f6f6c546f6b656e3a25732c20746f6b656e3a25732c20616c6c6f636174696f6e49643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e2045524337323120636c61696d20746f3a25732c2069643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243373231206964287573656c657373292d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243323020616d6f756e742d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e20434f494e20746f3a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243373231206d696e7420696e6372656d656e7420746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e73666572204552433131353520746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e74204552433131353520746f6b656e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c69622062616c616e6365204552433131353520746f6b656e3a25732c2066726f6d3a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e20434f494e20706f6f6c546f6b656e3a25732c20746f6b656e3a25732c20616c6c6f636174696f6e49643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e2045524337323120746f6b656e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220455243373231206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e73666572204552433732312069642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e742045524331313535206d696e742069642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e742045524331313535206d696e7420616d6f756e742d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c69622062616c616e636520434f494e2069643a25732c2066726f6d3a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243323020746f6b656e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e742045524337323120636c61696d20746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e2045524331313535206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e204552433230206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c69622062616c616e636520455243323020746f6b656e3a25732c2066726f6d3a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e73666572204552433230206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220434f494e2069642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243373231206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e742045524331313535206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e2045524337323120746f3a25732c2069643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e2045524337323120706f6f6c546f6b656e3a25732c20746f6b656e3a25732c20616c6c6f636174696f6e49643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e74204552433230206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220434f494e20746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420455243323020746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e204552433230206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220455243323020616d6f756e742d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e742045524337323120746f6b656e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220455243323020746f2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e2045524331313535206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20455243373231206d696e742069642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e204552433131353520746f3a25732c2069643a25732c20616d6f756e743a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e742045524337323120636c61696d2069642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e20455243323020706f6f6c546f6b656e3a25732c20746f6b656e3a25732c20616c6c6f636174696f6e49643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657220455243313135352069642d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20455243373231206964287573656c657373292d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e204552433131353520706f6f6c546f6b656e3a25732c20746f6b656e3a25732c20616c6c6f636174696f6e49643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e736665722045524331313535206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962207472616e7366657246726f6d506f6f6c546f6b656e20434f494e206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e20455243373231206572726f722d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7446726f6d506f6f6c546f6b656e204552433131353520706f6f6c546f6b656e3a25732c20746f6b656e3a25732c20616c6c6f636174696f6e49643a25732d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d206c6962206d696e7420746f6b656e4964a2646970667358221220bc31db7e1a140fde2f9d47dfdba652bbe186ad97a548c5c3b05b3e776152db2364736f6c63430008080033";

export class Transfer__factory extends ContractFactory {
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
  ): Promise<Transfer> {
    return super.deploy(overrides || {}) as Promise<Transfer>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Transfer {
    return super.attach(address) as Transfer;
  }
  connect(signer: Signer): Transfer__factory {
    return super.connect(signer) as Transfer__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TransferInterface {
    return new utils.Interface(_abi) as TransferInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Transfer {
    return new Contract(address, _abi, signerOrProvider) as Transfer;
  }
}
