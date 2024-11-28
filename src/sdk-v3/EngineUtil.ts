//@ts-nocheck
import { BigNumberish, BytesLike, Signer, utils } from "ethers";
import { ERC, GroupSlot, HANDLER_NAME, Token, TOKEN_IN, TokenSlot } from "./struct";
import { MultiCall, MultiFunc } from "./MultiCall";
import { getLogger, ILogger, RLP } from "./util";
import * as chainHub from "@ruleos/chain-hub";
import { Engine } from "./Engine";
import { PoolToken, PoolToken__factory } from "../../engine-typechain";

let BN = chainHub.Util.BN;
let D18 = chainHub.Util.D18;
let log: ILogger = getLogger();


export class EngineUtil {

  public static async loadMultiCall(owner:Signer):MultiCall {
    let chainId = await owner.getChainId();

    let multiCallAddress = "";
    if (chainId === 56) {
      multiCallAddress = "0x41263cba59eb80dc200f3e2544eda4ed6a90e76c";
    } else if (chainId === 97) {
      multiCallAddress = "0xae11C5B5f29A6a25e955F0CB8ddCc416f522AF5C";
    } else if (chainId === 50001) {
      multiCallAddress = "0x3b21246F9499e3C1BdC88300AC871bdAD8eC836f";
    } else if(chainId === 50002 || chainId === 50103 || chainId === 60001 || chainId === 60002 || chainId === 60103){
      multiCallAddress = "0xc49bc485d4f943b287edadbce45eb1a1220ffdfe";
    } else if (chainId === 1337) {
      multiCallAddress = "0x73CAaB33eB7e354Af9ebCd2725a53bE3B8D28aCc";
    } else if (chainId === 888) {
      multiCallAddress = "0x4de14fb8d24eae9ba93ece21c99093739e00ec46";
    }else if (chainId === 42161) {
      multiCallAddress = "0x89f0b3Ef7Ee182beC6B780fD9532Ce7F8Ae026a3";
    } else if (chainId == 31337) {

    }

    let multiCall = new MultiCall(owner);
    await multiCall.load(multiCallAddress);

    return multiCall;
  }

  //MINTER_ROLE
  //CLUSTER_ROLE
  public async checkPoolTokenRole(owner:Signer,poolTokenAddress: string, role: string, userAddress: string): boolean {
    const ROLE: BytesLike = utils.keccak256(utils.toUtf8Bytes(role));
    let poolToken = <PoolToken>await PoolToken__factory.connect(poolTokenAddress, owner);
    let hasRole = await poolToken.hasRole(ROLE, userAddress);
    log.debug("checkPoolTokenRole", "poolToken", poolTokenAddress, "role", role, "userAddress", userAddress, "hasRole", hasRole);
    return hasRole;
  }

  public static async matchBatch(
                          owner:Signer,
                          engine: Engine,
                          clusterId: BigNumberish,
                          ruleSlotIndexInputList: BigNumberish[],
                          ruleSlotIndexOutputList: BigNumberish[],
                          groupInputBranchList: BigNumberish[],
                          taskIdList: BigNumberish[],
                          holdingTokenList: Token[]) {

    log.debug("------------- Engine match clusterId", clusterId);
    log.debug("------------- Engine match holdingTokenList length", holdingTokenList.length);

    let funcList = [];
    for (let i = 0; i < ruleSlotIndexInputList.length; ++i) {
      let ruleSlotIndexInput = ruleSlotIndexInputList[i];
      let ruleSlotIndexOutput = ruleSlotIndexOutputList[i];
      let groupInputBranch = groupInputBranchList[i];

      log.debug("ruleSlotIndexInput", ruleSlotIndexInput, "ruleSlotIndexOutput", ruleSlotIndexOutput, "groupInputBranch", groupInputBranch);

      funcList.push(new MultiFunc(engine.clusterRuleArea, "getGroupSlot", [clusterId, ruleSlotIndexInput, groupInputBranch]));
    }

    let multiCall = await EngineUtil.loadMultiCall(owner);

    let resCall = await multiCall.call(funcList);
    let groupSlotInputListList = [];

    for (let k = 0; k < resCall.length; ++k) {
      let groupSlotInputContract = resCall[k][1];
      let groupSlotInput = new GroupSlot();
      groupSlotInputListList.push([groupSlotInput]);

      await groupSlotInput.copyFromContract(groupSlotInputContract);

      let tmpHoldingTokenList = [];
      for (let h = 0; h < holdingTokenList.length; ++h) {
        let token = new Token();
        token.copy(holdingTokenList[h]);
        tmpHoldingTokenList.push(token);
      }

      for (let i = 0; i < groupSlotInput.tokenSlotList.length; ++i) {
        let tokenSlot: TokenSlot = groupSlotInput.tokenSlotList[i];
        let tt = tokenSlot.tokenTemplate;

        for (let j = 0; j < tmpHoldingTokenList.length; ++j) {
          let token: Token = tmpHoldingTokenList[j];

          if (tt.erc == ERC.COIN && token.erc == ERC.COIN && !BN(token.amount).eq(0)) {
            if (token.amount.gte(tt.amount)) {
              tt.tokenInList.push(Token.newCoin(tt.amount));
              tt.tokenInMatch.push(TOKEN_IN.MATCHED);
              token.amount = token.amount.sub(tt.amount);
            } else {
              tt.tokenInList.push(Token.newCoin(token.amount));
              tt.tokenInMatch.push(TOKEN_IN.FAILED);
              token.amount = BN(0);
            }
          } else if (tt.erc == ERC.ERC20 && token.erc == ERC.ERC20 && tt.token.toLowerCase() == token.token.toLowerCase() && !BN(token.amount).eq(0)) {
            if (token.amount.gte(tt.amount)) {
              tt.tokenInList.push(Token.newERC20(tt.token, tt.amount));
              tt.tokenInMatch.push(TOKEN_IN.MATCHED);
              token.amount = token.amount.sub(tt.amount);
            } else {
              tt.tokenInList.push(Token.newERC20(tt.token, token.amount));
              tt.tokenInMatch.push(TOKEN_IN.FAILED);
              token.amount = BN(0);
            }
          } else if (tt.erc == ERC.ERC1155 && token.erc == ERC.ERC1155 && tt.token.toLowerCase() == token.token.toLowerCase() && !BN(token.amount).eq(0)) {
            if (tt.idList.length > 0) {
              for (let k = 0; k < tt.idList.length; ++k) {
                if (token.id.eq(tt.idList[k])) {
                  if (token.amount.gte(tt.amount)) {
                    tt.tokenInList.push(Token.newERC1155(token.token, token.id, tt.amount));
                    tt.tokenInMatch.push(TOKEN_IN.MATCHED);
                    token.amount = token.amount.sub(tt.amount);
                  } else {
                    tt.tokenInList.push(Token.newERC1155(token.token, token.id, token.amount));
                    tt.tokenInMatch.push(TOKEN_IN.FAILED);
                    token.amount = BN(0);
                  }
                }
              }
            } else {
              // tt.id <= token.id <= tt.idEnd
              if (tt.id.lte(token.id) && token.id.lte(tt.idEnd)) {
                if (token.amount.gte(tt.amount)) {
                  tt.tokenInList.push(Token.newERC1155(token.token, token.id, tt.amount));
                  tt.tokenInMatch.push(TOKEN_IN.MATCHED);
                  token.amount = token.amount.sub(tt.amount);
                } else {
                  tt.tokenInList.push(Token.newERC1155(token.token, token.id, token.amount));
                  tt.tokenInMatch.push(TOKEN_IN.FAILED);
                  token.amount = BN(0);
                }
              }
            }
          } else if (tt.erc == ERC.ERC721 && token.erc == ERC.ERC721 && tt.token.toLowerCase() == token.token.toLowerCase()) {

            if (tt.idList.length > 0) {
              for (let k = 0; k < tt.idList.length; ++k) {
                if (token.id.eq(tt.idList[k])) {
                  tt.tokenInList.push(Token.newERC721(token.token, token.id));
                  tt.tokenInMatch.push(TOKEN_IN.MATCHED);
                  token.id = BN(0);
                }
              }
            } else {
              if (tt.id.eq(BN(0)) && tt.idEnd.eq(BN(0)) || tt.id.lte(token.id) && token.id.lte(tt.idEnd)) {
                tt.tokenInList.push(Token.newERC721(token.token, token.id));
                tt.tokenInMatch.push(TOKEN_IN.MATCHED);
                token.id = BN(0);
              }
            }
          }
        }
      }
    }


    funcList = [];
    for (let i = 0; i < ruleSlotIndexInputList.length; ++i) {
      let ruleSlotIndexInput = ruleSlotIndexInputList[i];
      let ruleSlotIndexOutput = ruleSlotIndexOutputList[i];
      let groupInputBranch = groupInputBranchList[i];

      funcList.push(new MultiFunc(engine.clusterRuleAreaHandler, "getPreHandlerList", [clusterId, ruleSlotIndexInput, ruleSlotIndexOutput]));
      funcList.push(new MultiFunc(engine.clusterRuleAreaHandler, "getProcessHandlerList", [clusterId, ruleSlotIndexInput, ruleSlotIndexOutput]));
      funcList.push(new MultiFunc(engine.clusterRuleArea, "getGroupSlotBranchList", [clusterId, ruleSlotIndexOutput]));
    }

    resCall = await multiCall.call(funcList);


    funcList = [];
    let callIndex = 0;
    for (let i = 0; i < ruleSlotIndexInputList.length; ++i) {
      let ruleSlotIndexInput = ruleSlotIndexInputList[i];
      let ruleSlotIndexOutput = ruleSlotIndexOutputList[i];
      let groupInputBranch = groupInputBranchList[i];

      let k = i * 3;
      let preHandlerList = resCall[callIndex++][0];
      let processHandlerList = resCall[callIndex++][0];
      let branchList = resCall[callIndex++][0];

      for (let i = 0; i < branchList.length; ++i) {
        funcList.push(new MultiFunc(engine.clusterRuleArea, "getGroupSlot", [clusterId, ruleSlotIndexOutput, branchList[i]]));
        let lastHandler = processHandlerList[processHandlerList.length - 1];
        funcList.push(new MultiFunc(engine.clusterRuleArea, "getGroupSlotHandlerArgs", [clusterId, ruleSlotIndexOutput, branchList[i], lastHandler]));
      }
    }

    let groupSlotOutputListList = [];

    let resGroupSlotCall = await multiCall.call(funcList);

    callIndex = 0;
    for (let i = 0; i < ruleSlotIndexInputList.length; ++i) {
      let ruleSlotIndexInput = ruleSlotIndexInputList[i];
      let ruleSlotIndexOutput = ruleSlotIndexOutputList[i];
      let groupInputBranch = groupInputBranchList[i];

      let k = i * 3;
      let preHandlerList = resCall[k][0];
      let processHandlerList = resCall[k + 1][0];
      let branchList = resCall[k + 2][0];


      let groupSlotOutputList: GroupSlot[] = [];
      for (let i = 0; i < branchList.length; ++i) {
        let groupSlotContract = resGroupSlotCall[callIndex++][1];

        let groupSlot = new GroupSlot();
        await groupSlot.copyFromContract(groupSlotContract);

        let lastHandler = processHandlerList[processHandlerList.length - 1];

        groupSlot.handlerList.push(lastHandler);

        let args = resGroupSlotCall[callIndex++][0];
        if (args !== undefined && args !== "0x") {
          groupSlot.argsList.push(args);
          groupSlot.argsValueList.push(RLP.fromList(args));
        }

        groupSlotOutputList.push(groupSlot);
      }

      groupSlotOutputListList.push(groupSlotOutputList);
    }


    for (let k = 0; k < ruleSlotIndexInputList.length; ++k) {
      let ruleSlotIndexInput = ruleSlotIndexInputList[k];
      let ruleSlotIndexOutput = ruleSlotIndexOutputList[k];
      let groupInputBranch = groupInputBranchList[k];

      let [groupSlotInput] = groupSlotInputListList[k];

      log.debug("---------- groupSlotInput Match " + k + "--------------");
      for (let i = 0; i < groupSlotInput.tokenSlotList.length; ++i) {
        let tokenSlot = groupSlotInput.tokenSlotList[i];
        for (let j = 0; j < tokenSlot.tokenTemplate.tokenInList.length; ++j) {
          log.debug("-------", tokenSlot.tokenTemplate.tokenInMatch[j] == 1 ? "matched" : "unmatched", tokenSlot.tokenTemplate.desc(), "-", tokenSlot.tokenTemplate.tokenInList[j].desc());
        }

      }

      let groupSlotOutputList = groupSlotOutputListList[k];
      log.debug();
      log.debug("---------- groupSlotOutputList Match " + k + "--------------");
      for (let g = 0; g < groupSlotOutputList.length; ++g) {
        let groupSlot = groupSlotOutputList[g];
        ``;
        log.debug("---------- groupSlot argValues " + (groupSlot.argsValueList.length > 0 ? groupSlot.argsValueList[0] : "-") + "--------------");

        for (let i = 0; i < groupSlot.tokenSlotList.length; ++i) {
          let tokenSlot = groupSlot.tokenSlotList[i];
          log.debug("------- groupSlot branch " + groupSlot.branch + " tokenSlot " + tokenSlot.tokenTemplate.desc());
        }
      }
    }

    funcList = [];

    for (let d = 0; d < ruleSlotIndexInputList.length; ++d) {
      let ruleSlotIndexInput = ruleSlotIndexInputList[d];
      let ruleSlotIndexOutput = ruleSlotIndexOutputList[d];
      let groupInputBranch = groupInputBranchList[d];

      funcList.push(new MultiFunc(engine.clusterRuleArea, "getRuleLeftCount", [clusterId, ruleSlotIndexInput, ruleSlotIndexOutput]));
      funcList.push(new MultiFunc(engine.clusterRuleArea, "getRuleTotalCount", [clusterId, ruleSlotIndexInput, ruleSlotIndexOutput]));
    }


    let ruleLeftCountList = [];
    let ruleTotalCountList = [];

    let resRuleCountCall = await multiCall.call(funcList);
    callIndex = 0;
    for (let d = 0; d < ruleSlotIndexInputList.length; ++d) {
      let ruleSlotIndexInput = ruleSlotIndexInputList[d];
      let ruleSlotIndexOutput = ruleSlotIndexOutputList[d];
      let groupInputBranch = groupInputBranchList[d];

      let ruleLeftCount = resRuleCountCall[callIndex++][0];
      let ruleTotalCount = resRuleCountCall[callIndex++][0];

      ruleLeftCountList.push(ruleLeftCount);
      ruleTotalCountList.push(ruleTotalCount);
    }


    for (let i = 0; i < ruleLeftCountList.length; ++i) {
      log.debug("--------------- Engine match " + i + " ruleLeftCount", ruleLeftCountList[i]);
      log.debug("--------------- Engine match " + i + " ruleTotalCount", ruleTotalCountList[i]);
    }


    return {
      "groupSlotInputListList": groupSlotInputListList,
      "groupSlotOutputListList": groupSlotOutputListList,
      "ruleTotalCountList": ruleTotalCountList,
      "ruleLeftCountList": ruleLeftCountList
    };
  }


  
}
