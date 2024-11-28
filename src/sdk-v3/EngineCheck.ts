// @ts-nocheck
import { BigNumberish, BytesLike, utils } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import {
  IClusterHandlerArea,
  IClusterHandlerArea__factory,
  IERC1155,
  IERC1155__factory,
  IERC20,
  IERC20__factory,
  IERC721,
  IERC721__factory,
  IERCMintBurnClaimRole,
  IERCMintBurnClaimRole__factory,
  ISwapV2Factory__factory,
  ISwapV2Router01__factory,
  PoolToken,
  PoolToken__factory
} from "../../engine-typechain";
import {
  APPROVE,
  ATTRIBUTE_OPT,
  ATTRIBUTE_SUB_SUM_MODE,
  Cluster,
  CLUSTER_STATE,
  ERC,
  GroupSlot,
  InputTokenState,
  InputTokenStateEnum,
  Message,
  MessageList,
  MessageListInput,
  MINT_DESTROY_ADDRESS,
  Rule,
  RULE_IO_TYPE,
  RULE_STATE,
  RuleSlot,
  SELF_ADDRESS,
  Token,
  TOKEN_TEMPLATE_AMOUNT_REQUIRED,
  TOKEN_TEMPLATE_ID_REQUIRED,
  TOKEN_TEMPLATE_TYPE,
  TokenAttributeList,
  TokenSlot,
  ZERO_ADDRESS
} from "./struct";
import * as messages from "./struct/Message";
import { getLogger, ILogger } from "./util";
import { Callback, Engine } from "./Engine";
import { BaseHandler } from "./handler/BaseHandler";
import { POST_HANDLER, PRE_HANDLER, PROCESS_HANDLER } from "./Handler";

let BN = chainHub.Util.BN;
let D18 = chainHub.Util.D18;
let log: ILogger = getLogger();

//APPROVE.ALL  ERC1155 setApprovalForAll , ERC20 approve exact tokens , ERC721 setApprovalForAll
//APPROVE.ONCE ERC1155 setApprovalForAll , ERC20 approve exact tokens , ERC721 approve exact tokenId
export async function checkInput(
  engineInstance: Engine,
  cluster: Cluster,
  ruleSlotIndexInput: BigNumberish,
  groupInputBranch: BigNumberish,
  multiple: BigNumberish,
  inTokenList: Token[],
  approve: APPROVE,
  callBack?: Callback,
  attrSumMode?: number = ATTRIBUTE_SUB_SUM_MODE.PERCENT_FIRST
  ): Promise<MessageListInput> {

  log.info("checkInput", "clusterId", cluster.clusterId, "ruleSlotIndexInput", ruleSlotIndexInput, "groupInputBranch", groupInputBranch, "approve", approve);

  let msgList = new MessageListInput("checkInput");
  if (cluster.state != CLUSTER_STATE.ENABLED) {
    msgList.add(messages.from(messages._301, 0, "0x", [cluster.state]));
    msgList.print();
    return msgList;
  }

  let ruleSlot: RuleSlot;
  for (let d = 0; d < cluster.ruleSlotList.length; ++d) {
    if (cluster.ruleSlotList[d].ruleSlotIndex == ruleSlotIndexInput) {
      ruleSlot = cluster.ruleSlotList[d];
      break;
    }
  }

  let groupSlot = null;
  let j = 0;
  for (; j < ruleSlot.groupSlotList.length; ++j) {
    let gs: GroupSlot = ruleSlot.groupSlotList[j];

    if (gs.branch == groupInputBranch) {
      groupSlot = gs;
      break;
    }
  }

  if (groupSlot == null) {
    msgList.add(messages.from(messages._302, 0, "0x", [groupInputBranch]));
    msgList.print();
    return msgList;
  }

  let coinMap = new Map();
  let coinInputMap = new Map();

  let erc20Map = new Map();
  let erc20InputMap = new Map();

  let erc1155Map = new Map();
  let erc1155InputMap = new Map();

  if (groupSlot.tokenSlotList.length > 0) {
    if (inTokenList.length % groupSlot.tokenSlotList.length != 0) {
      msgList.add(messages.from(messages._303, 0, ""));
      msgList.print();
      return msgList;
    }
  }

  if(inTokenList.length == 0 && groupSlot.tokenSlotList.length == 0){
    if (msgList.length() == 0) {
      msgList.add(messages.from(messages._200, 0, ""));
    }
    return msgList;
  }

  if(inTokenList.length > 0 && groupSlot.tokenSlotList.length == 0){
    msgList.add(messages.from(messages._750));
    return msgList;
  }

  let roundCount = inTokenList.length / groupSlot.tokenSlotList.length;

  let owner = engineInstance.owner;
  let engine = engineInstance.engine;

  let tokenAttrExistList = [];

  for (let round = 0; round < roundCount; ++round) {
    for (let tokenSlotIndex = 0; tokenSlotIndex < groupSlot.tokenSlotList.length; ++tokenSlotIndex) {
      let k = round * groupSlot.tokenSlotList.length + tokenSlotIndex;
      let tokenSlot: TokenSlot = groupSlot.tokenSlotList[tokenSlotIndex];
      let inToken = inTokenList[k];
      let msg = tokenSlot.tokenCheckMatchStd(inToken);
      if (msg != "") {
        msgList.add(messages.from(messages._400, k, tokenSlot.tokenTemplate.token, [msg]));
      }

      let preStr = "ruleSlotIndex " + ruleSlotIndexInput + " groupSlot " + j + " tokenSlot " + k;
      if (tokenSlot.tokenTemplate.erc == ERC.COIN) {

        let key = tokenSlot.tokenTemplate.token + "-" + tokenSlot.tokenTemplate.amountRequired.toString();

        let amount = coinMap.get(key);
        let amountInput = coinInputMap.get(key);
        if (amount == undefined) {
          coinMap.set(key, BN(0));
          amount = BN(0);

          coinInputMap.set(key, BN(0));
          amountInput = BN(0);
        }

        coinMap.set(key, amount.add(tokenSlot.tokenTemplate.amount));
        coinInputMap.set(key, amountInput.add(inToken.amount));

        let inputTokenState = new InputTokenState();
        inputTokenState.tokenSlot = tokenSlot;
        inputTokenState.address = ZERO_ADDRESS;
        inputTokenState.erc = ERC.COIN;
        inputTokenState.user = owner.address;
        inputTokenState.id = BN(0);
        inputTokenState.amountInput = inToken.amount;
        inputTokenState.amountStd = tokenSlot.tokenTemplate.amount;
        msgList.addInputTokenState(round,inputTokenState);

      } else if (tokenSlot.tokenTemplate.erc == ERC.ERC20) {
        let inputTokenState = new InputTokenState();
        inputTokenState.tokenSlot = tokenSlot;
        inputTokenState.address = tokenSlot.tokenTemplate.token;
        inputTokenState.erc = ERC.ERC20;
        inputTokenState.user = owner.address;
        msgList.addInputTokenState(round,inputTokenState);

        let key = tokenSlot.tokenTemplate.token + "-" + tokenSlot.tokenTemplate.amountRequired.toString();
        let amount = erc20Map.get(key);
        let amountInput = erc20InputMap.get(key);

        if (amount == undefined) {
          erc20Map.set(key, BN(0));
          amount = BN(0);

          erc20InputMap.set(key, BN(0));
          amountInput = BN(0);
        }

        erc20Map.set(key, amount.add(tokenSlot.tokenTemplate.amount));
        erc20InputMap.set(key, amountInput.add(inToken.amount));
        inputTokenState.id = BN(0);
        inputTokenState.amountInput = inToken.amount;
        inputTokenState.amountStd = tokenSlot.tokenTemplate.amount;
      } else if (tokenSlot.tokenTemplate.erc == ERC.ERC721) {
        let inputTokenState = new InputTokenState();
        inputTokenState.tokenSlot = tokenSlot;
        inputTokenState.address = tokenSlot.tokenTemplate.token;
        inputTokenState.erc = ERC.ERC721;
        inputTokenState.id = inToken.id
        inputTokenState.amountInput = BN(0);
        inputTokenState.amountStd = BN(0);
        inputTokenState.user = owner.address;

        msgList.addInputTokenState(round,inputTokenState);

        if (tokenSlot.tokenTemplate.idRequired == BN(TOKEN_TEMPLATE_ID_REQUIRED.FALSE) && BN(inToken.id).eq(BN(0))) {
          continue;
        }
        let erc721Contract = <IERC721>await IERC721__factory.connect(tokenSlot.tokenTemplate.token, owner);

        if (tokenSlot.tokenTemplate.idRequired == TOKEN_TEMPLATE_ID_REQUIRED.TRUE
          || tokenSlot.tokenTemplate.idRequired == TOKEN_TEMPLATE_ID_REQUIRED.FALSE && !BN(inToken.id).eq(BN(0))) {


          let attrRangeExistList = tokenSlot.tokenTemplate.getAttributeRangeListByAttrOpt(ATTRIBUTE_OPT.EXIST);
          if(attrRangeExistList.length > 0){
            tokenAttrExistList.push({
              round:round,
              tokenSlotIndex:tokenSlotIndex,
              tokenSlot:tokenSlot,
              attrRangeExistList:attrRangeExistList
            })
          }

          async function isApprovedForAll() {
            return await erc721Contract.isApprovedForAll(owner.address, engine.address);
          }

          async function isApproved() {
            let allowAddress = await erc721Contract.getApproved(inToken.id.toString());
            return allowAddress == engine.address;
          }

          let allow = await isApprovedForAll();
          if (!allow) {
            try {
              allow = await isApproved();
            } catch (e) {
              msgList.add(messages.from(messages._401, k, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.desc(), inToken.id.toString()]));
            }
          }

          if (!allow) {
            if (approve == APPROVE.ALL) {
              try {
                const approveFunc = async () => {
                  return await erc721Contract.connect(owner).setApprovalForAll(engine.address, true);
                };
                await chainHub.Tx.contractCall(
                  "approve_404_" + k,
                  {
                    [chainHub.EventState.PROCESSING]: "start to setApprovalForAll ERC721",
                    [chainHub.EventState.CONFIRMED]: "user confirmed",
                    [chainHub.EventState.CANCELED]: "user canceled",
                    [chainHub.EventState.SUCCESS]: "approve successfully",
                    [chainHub.EventState.FAILURE]: "approve failed"
                  },
                  approveFunc,
                  callBack);
              } catch (e) {
                msgList.add(messages.from(messages._402, k, "tokenSlot.tokenTemplate.token", [preStr, owner.address, tokenSlot.tokenTemplate.desc().e.toString(), inToken.desc()]).addCallback(isApprovedForAll));
              }
            } else if (approve == APPROVE.ONCE) {
              try {
                const approveFunc = async () => {
                  return await erc721Contract.connect(owner).approve(engine.address, inToken.id.toString());
                };
                await chainHub.Tx.contractCall(
                  "approve_404_" + k,
                  {
                    [chainHub.EventState.PROCESSING]: "start to approve ERC721:" + inToken.desc(),
                    [chainHub.EventState.CONFIRMED]: "user confirmed",
                    [chainHub.EventState.CANCELED]: "user canceled",
                    [chainHub.EventState.SUCCESS]: "approve successfully",
                    [chainHub.EventState.FAILURE]: "approve failed"
                  },
                  approveFunc,
                  callBack);
              } catch (e) {
                msgList.add(messages.from(messages._403, k, tokenSlot.tokenTemplate.token, [preStr, owner.address, tokenSlot.tokenTemplate.desc(), inToken.id, e.toString(), inToken.desc()])
                  .addCallback(isApproved));
              }
            } else {
              msgList.add(messages.from(messages._404, k, tokenSlot.tokenTemplate.token, [tokenSlot.tokenTemplate.token, tokenSlot.tokenTemplate.desc(), engineInstance.engine.address, inToken.desc()]));

              msgList.setInputTokenState(inputTokenState,InputTokenStateEnum.NotApproved);
            }
          }
        }

        try {
          let ownerOf721 = await erc721Contract.ownerOf(inToken.id.toString());
          inputTokenState.owner = ownerOf721.toLowerCase();
          if (ownerOf721.toLowerCase() != owner.address.toLowerCase()) {
            msgList.add(messages.from(messages._405, k, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.desc(), ownerOf721, owner.address, inToken.id, inToken.desc()]));

            msgList.setInputTokenState(inputTokenState,InputTokenStateEnum.BalanceNotEnough,BN(0));
          }
          else {
            msgList.setInputTokenState(inputTokenState,InputTokenStateEnum.None,BN(1));
          }
        } catch (e) {
          msgList.add(messages.from(messages._401, k, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.desc(), inToken.id.toString()], [inToken.desc()]));
          inputTokenState.owner = ZERO_ADDRESS;
          msgList.setInputTokenState(inputTokenState,InputTokenStateEnum.BalanceNotEnough,BN(0));
        }

      } else if (tokenSlot.tokenTemplate.erc == ERC.ERC1155) {
        let inputTokenState = new InputTokenState();
        inputTokenState.tokenSlot = tokenSlot;
        inputTokenState.address = tokenSlot.tokenTemplate.token;
        inputTokenState.erc = ERC.ERC1155;
        inputTokenState.id = inToken.id
        inputTokenState.amountStd = tokenSlot.tokenTemplate.amount;
        inputTokenState.amountInput = inToken.amount;
        inputTokenState.user = owner.address;

        msgList.addInputTokenState(round,inputTokenState);

        if ((tokenSlot.tokenTemplate.idRequired == TOKEN_TEMPLATE_ID_REQUIRED.FALSE
            || tokenSlot.tokenTemplate.amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.FALSE)
          && (BN(inToken.id).eq(BN(0)) || BN(inToken.amount).eq(BN(0)))
        ) {
          continue;
        }

        let attrRangeExistList = tokenSlot.tokenTemplate.getAttributeRangeListByAttrOpt(ATTRIBUTE_OPT.EXIST);
        if(attrRangeExistList.length > 0){
          tokenAttrExistList.push({
            round:round,
            tokenSlotIndex:tokenSlotIndex,
            tokenSlot:tokenSlot,
            attrRangeExistList:attrRangeExistList
          })
        }

        let key = tokenSlot.tokenTemplate.token + "-" + inToken.id.toString() + "-" + tokenSlot.tokenTemplate.idRequired.toString();

        // id amount to accumulate
        let amount = erc1155Map.get(key);
        let amountInput = erc1155InputMap.get(key);
        if (amount == undefined) {
          erc1155Map.set(key, BN(0));
          amount = BN(0);
          erc1155InputMap.set(key, BN(0));
          amountInput = BN(0);
        }

        erc1155Map.set(key, amount.add(tokenSlot.tokenTemplate.amount));
        erc1155InputMap.set(key, amountInput.add(inToken.amount));

      }
    }
  }

  //erc1155 amount check
  for (let entry of erc1155Map.entries()) {
    let tokenStdAddress = entry[0];
    let amountStd = entry[1];
    let tokenAddress = tokenStdAddress.split("-")[0];
    let tokenId = tokenStdAddress.split("-")[1];
    let idRequired = tokenStdAddress.split("-")[2];

    let inputTokenStateList = msgList.getInputTokenStateList(tokenAddress,tokenId,idRequired);

    let erc1155Index = 0;
    for (let i = 0; i < inTokenList.length; ++i) {
      if (inTokenList[i].token.toLowerCase() == tokenAddress.toLowerCase() && BN(inTokenList[i].id).eq(BN(tokenId))) {
        erc1155Index = i;
        break;
      }
    }

    let erc1155Contract = <IERC1155>await IERC1155__factory.connect(tokenAddress, owner);
    let balance = await erc1155Contract.balanceOf(owner.address, inTokenList[erc1155Index].id.toString());

    msgList.setInputTokenStateList(inputTokenStateList,undefined,balance);

    let amountInput;
    for (let entry of erc1155InputMap.entries()) {
      let tokenInputAddress = entry[0];
      if (tokenStdAddress == tokenInputAddress) {
        amountInput = entry[1];
        break;
      }
    }


    //approve
    if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED.TRUE
      || (
        (idRequired == TOKEN_TEMPLATE_ID_REQUIRED.FALSE
        )
        && (!BN(tokenId).eq(BN(0)) && !BN(amountInput).eq(BN(0)))
      )
    ) {
      let erc1155Contract = <IERC1155>await IERC1155__factory.connect(tokenAddress, owner);

      async function isApprovedForAll() {
        return await erc1155Contract.isApprovedForAll(owner.address, engine.address);
      }

      let allow = await isApprovedForAll();
      if (!allow) {
        if (approve == APPROVE.ALL || approve == APPROVE.ONCE) {
          const approveFunc = async () => {
            return await erc1155Contract.connect(owner).setApprovalForAll(engine.address, true);
          };
          await chainHub.Tx.contractCall(
            "approve_501_" + erc1155Index,
            {
              [chainHub.EventState.PROCESSING]: "start to approve ERC1155:" + tokenAddress,
              [chainHub.EventState.CONFIRMED]: "user confirmed",
              [chainHub.EventState.CANCELED]: "user canceled",
              [chainHub.EventState.SUCCESS]: "approve successfully",
              [chainHub.EventState.FAILURE]: "approve failed"
            },
            approveFunc,
            callBack);
        } else {

          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.NotApproved);
          msgList.add(messages.from(messages._501, erc1155Index, tokenAddress, [tokenAddress, tokenId+"#"+amountInput.toString(), engine.address, tokenId+"#"+amountInput.toString()]).addCallback(isApprovedForAll));
        }
      }
    }


    if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED.TRUE || idRequired == TOKEN_TEMPLATE_ID_REQUIRED.FALSE && tokenId != 0) {
      if (tokenId == 0 && amountInput == 0) {
      } else {
        if (balance.gte(amountInput) && amountInput.gte(amountStd)) {
        } else {
          if (balance.lt(amountInput)) {
            msgList.add(messages.from(messages._502, erc1155Index, inTokenList[erc1155Index].token, [ruleSlotIndexInput, j, tokenId, owner.address, tokenStdAddress, D18(balance).toString(), D18(amountInput).toString(), inTokenList[erc1155Index].id.toString()]));
            msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
          }

          if (amountInput.lt(amountStd)) {
            msgList.add(messages.from(messages._503, erc1155Index, "", [ruleSlotIndexInput, j, tokenId, owner.address, tokenStdAddress, D18(amountInput).toString(), D18(amountStd).toString(), inTokenList[erc1155Index].id.toString()]));
            msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
          }
        }
      }
    } else if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED.FALSE && tokenId == 0) {
    } else if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED.EXIST) {
      if (balance.gte(amountInput) && amountInput.gte(amountStd)) {
      } else {
        if (balance.lt(amountInput)) {
          msgList.add(messages.from(messages._512, erc1155Index, inTokenList[erc1155Index].token,
            [ruleSlotIndexInput, j, tokenId, owner.address, tokenStdAddress, D18(balance).toString(), D18(amountInput).toString(), inTokenList[erc1155Index].id.toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }
        if (amountInput.lt(amountStd)) {
          msgList.add(messages.from(messages._513, erc1155Index, inTokenList[erc1155Index].token,
            [ruleSlotIndexInput, j, tokenId, owner.address, tokenStdAddress, D18(amountInput).toString(), D18(amountStd).toString(), inTokenList[erc1155Index].id.toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }
      }
    }
  }

  //coin amount check
  let coinIndex = 0;
  for (let entry of coinMap.entries()) {
    let tokenStdAddress = entry[0];
    let amountStd = entry[1].mul(multiple).div(10000);
    let amountRequired = tokenStdAddress.split("-")[1];

    let inputTokenStateList = msgList.getInputTokenStateList(tokenStdAddress,undefined,amountRequired);

    let balance = await engineInstance.hubChain.balance(owner);
    let amountInput;
    for (let entry of coinInputMap.entries()) {
      let tokenInputAddress = entry[0];
      if (tokenStdAddress == tokenInputAddress) {
        amountInput = entry[1].mul(multiple).div(10000);
        break;
      }
    }

    if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.TRUE || amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.FALSE && !amountInput.eq(BN(0))) {
      if (amountInput.gte(amountStd) && balance.gte(amountInput)) {
      } else {
        if (balance.lt(amountInput)) {
          msgList.add(messages.from(messages._701, coinIndex, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, D18(balance).toString(), D18(amountInput).toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }

        if (amountInput.lt(amountStd)) {
          msgList.add(messages.from(messages._702, coinIndex, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, D18(amountInput).toString(), D18(amountStd).toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }
      }
    } else if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.FALSE && amountInput.eq(BN(0))) {

    } else if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.EXIST) {
      if (amountInput.gte(amountStd) && balance.gte(amountInput)) {
      } else {
        if (balance.lt(amountInput)) {
          msgList.add(messages.from(messages._711, coinIndex, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, D18(balance).toString(), D18(amountInput).toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }

        if (amountInput.lt(amountStd)) {
          msgList.add(messages.from(messages._712, coinIndex, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, D18(amountInput).toString(), D18(amountStd).toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }
      }
    }

    coinIndex++;
  }

  //erc20 amount check
  let erc20Index = 0;
  for (let entry of erc20Map.entries()) {
    let tokenStdAddress = entry[0];
    let amountStd = entry[1].mul(multiple).div(10000);

    let tokenAddress = tokenStdAddress.split("-")[0];
    let amountRequired = tokenStdAddress.split("-")[1];

    let inputTokenStateList = msgList.getInputTokenStateList(tokenAddress,undefined,amountRequired);


    let erc20Contract = <IERC20>await IERC20__factory.connect(tokenAddress, owner);

    async function getAllowance() {
      return await erc20Contract.allowance(owner.address, engine.address);
    }

    async function getBalance() {
      return await erc20Contract.balanceOf(owner.address);
    }

    let userAllowance = await getAllowance();
    let balance = await getBalance();

    let amountInput;
    for (let entry of erc20InputMap.entries()) {
      let tokenInputAddress = entry[0];
      if (tokenStdAddress == tokenInputAddress) {
        amountInput = entry[1].mul(multiple).div(10000);
        break;
      }
    }

    if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.TRUE || amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.FALSE && !amountInput.eq(BN(0))) {
      if (userAllowance.gte(amountStd) && amountInput.gte(amountStd)
        && userAllowance.gte(amountInput) && balance.gte(amountInput)) {
      } else {
        if ((approve == APPROVE.ONCE || approve == APPROVE.ALL) && balance.gte(amountInput)) {
          const approveFunc = async () => {
            return await erc20Contract.connect(owner).approve(engine.address, amountInput);
          };
          await chainHub.Tx.contractCall(
            "approve_600_" + erc20Index,
            {
              [chainHub.EventState.PROCESSING]: "start to approve",
              [chainHub.EventState.CONFIRMED]: "user confirmed",
              [chainHub.EventState.CANCELED]: "user canceled",
              [chainHub.EventState.SUCCESS]: "approve successfully",
              [chainHub.EventState.FAILURE]: "approve failed"
            },
            approveFunc,
            callBack);
        } else {
          if (userAllowance.lt(amountStd)) {
            msgList.add(messages.from(messages._601, erc20Index, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, tokenStdAddress, D18(amountStd).toString(), D18(userAllowance).toString()])
              .addCallback(async () => {
                let userAllowance = await getAllowance();
                return userAllowance.gte(amountStd);
              }));
            msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.NotApproved,balance);
          }
          if (userAllowance.lt(amountInput)) {
            msgList.add(messages.from(messages._602, erc20Index, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, tokenStdAddress, D18(userAllowance).toString(), D18(amountInput).toString()])
              .addCallback(async () => {
                let userAllowance = await getAllowance();
                return userAllowance.gte(amountInput);
              }));
            msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.NotApproved,balance);
          }

          if (balance.lt(amountInput)) {
            msgList.add(messages.from(messages._603, erc20Index, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, tokenStdAddress, D18(balance).toString(), D18(amountInput).toString()])
              .addCallback(async () => {
                let balance = await getBalance();
                return balance.gte(amountInput);
              }));
            msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
          }

          if (amountInput.lt(amountStd)) {
            msgList.add(messages.from(messages._604, erc20Index, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, tokenStdAddress, D18(amountInput).toString(), D18(amountStd).toString()])
              .addCallback(async () => {
                let balance = await getBalance();
                return balance.gte(amountStd);
              }));
            msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
          }

          msgList.add(messages.from(messages._600, erc20Index, tokenStdAddress, [tokenStdAddress, D18(amountInput), engineInstance.engine.address]));
        }
      }
    } else if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.FALSE && amountInput.eq(BN(0))) {
    } else if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED.EXIST) {
      if (amountInput.gte(amountStd) && balance.gte(amountInput)) {
      } else {
        if (balance.lt(amountInput)) {
          msgList.add(messages.from(messages._613, erc20Index, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, tokenStdAddress, D18(balance).toString(), D18(amountInput).toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }

        if (amountInput.lt(amountStd)) {
          msgList.add(messages.from(messages._614, erc20Index, tokenStdAddress, [ruleSlotIndexInput, j, owner.address, tokenStdAddress, D18(amountInput).toString(), D18(amountStd).toString()]));
          msgList.setInputTokenStateList(inputTokenStateList,InputTokenStateEnum.BalanceNotEnough,balance);
        }
      }
    }
    erc20Index++;
  }

  //attribute check

  let inTokenAttrCheckList = [];
  for (let round = 0; round < roundCount; ++round) {
    for (let tokenSlotIndex = 0; tokenSlotIndex < groupSlot.tokenSlotList.length; ++tokenSlotIndex) {
      for(let i = 0 ; i < tokenAttrExistList.length; ++i){
        let tokenAttrExist = tokenAttrExistList[i];
        if(tokenAttrExist.round == round && tokenSlotIndex == tokenAttrExist.tokenSlotIndex){
          let tokenSlot:TokenSlot = tokenAttrExist.tokenSlot;
          let attrRangeExistList = tokenAttrExist.attrRangeExistList;
          let inToken = inTokenList[round*groupSlot.tokenSlotList.length + tokenSlotIndex];
          inTokenAttrCheckList.push(inToken);
        }
      }
    }
  }

  let inTokenAttrListArray:TokenAttributeList[] = await engineInstance.getTokenAttrIdList(cluster.clusterId,inTokenAttrCheckList);

  let tokenCheckIndex = -1;
  for (let round = 0; round < roundCount; ++round) {
    for (let tokenSlotIndex = 0; tokenSlotIndex < groupSlot.tokenSlotList.length; ++tokenSlotIndex) {
      for(let i = 0 ; i < tokenAttrExistList.length; ++i){
        let tokenAttrExist = tokenAttrExistList[i];
        if(tokenAttrExist.round == round && tokenSlotIndex == tokenAttrExist.tokenSlotIndex){
          tokenCheckIndex++;

          let inputTokenState = msgList.getInputTokenState(round,tokenSlotIndex);

          let tokenSlot:TokenSlot = tokenAttrExist.tokenSlot;
          let attrRangeExistList = tokenAttrExist.attrRangeExistList;
          let inTokenAttrList = inTokenAttrListArray[tokenCheckIndex];
          inputTokenState.attrOptList = inTokenAttrList.attributeOptList;

          for(let j = 0; j < attrRangeExistList.length; ++j){
            let attrRangeExist = attrRangeExistList[j];

            let found = false;
            for(let ito = 0; ito < inTokenAttrList.attributeOptList.length; ++ito){
              let inTokenAttrOpt = inTokenAttrList.attributeOptList[ito];

              if(BN(inTokenAttrOpt.attrId).eq(attrRangeExist.attrId)){
                inTokenAttrOpt.attrSumMode = attrSumMode
                inTokenAttrOpt.attrSumAmount = inTokenAttrOpt.sumAttrAmount(attrSumMode);
                inTokenAttrOpt.attrAmountBegin = attrRangeExist.amountBegin;
                inTokenAttrOpt.attrAmountEnd = attrRangeExist.amountEnd;

                if(BN(attrRangeExist.amountBegin).lte(inTokenAttrOpt.attrSumAmount) && BN(inTokenAttrOpt.attrSumAmount).lte(attrRangeExist.amountEnd)){
                }
                else {
                  inTokenAttrOpt.state = InputTokenStateEnum.AttributeNotEnough;
                  msgList.setInputTokenState(inputTokenState,InputTokenStateEnum.AttributeNotEnough)
                  msgList.add(messages.from(messages._901, tokenSlotIndex, inTokenAttrOpt.token, [tokenSlotIndex,inTokenAttrOpt.attrSumAmount.toString(),inTokenAttrOpt.attrAmount.toString(),inTokenAttrOpt.attrId.toString(),attrRangeExist.amountBegin.toString(),attrRangeExist.amountEnd.toString()]));
                }

                found = true;
              }
            }

            if(!found){
              msgList.setInputTokenState(inputTokenState,InputTokenStateEnum.AttributeNotEnough)
              msgList.add(messages.from(messages._902, tokenSlotIndex, inTokenAttrList.token, [tokenSlotIndex,attrRangeExist.attrId.toString(),attrRangeExist.amountBegin.toString(),attrRangeExist.amountEnd.toString()]));
            }

          }
        }
      }
    }
  }



  if (msgList.length() == 0) {
    msgList.add(messages.from(messages._200, 0, ""));
  }

  msgList.print();
  return msgList;
}

//check output branch token are conformed.
//user : check before inputing tokens to call engine
export async function checkOutput(engineInstance: Engine, cluster: Cluster, ruleSlotIndexInput: BigNumberish, ruleSlotIndexOutput: BigNumberish) {
  let msgList = new MessageList("checkOutput");
  if (cluster.state != CLUSTER_STATE.ENABLED) {
    msgList.add(messages.from(messages._301, 0, "0x", [cluster.state]));
  }

  let ruleList = cluster.ruleList;

  if (ruleSlotIndexInput != 0 || ruleSlotIndexOutput != 0) {
    if (ruleSlotIndexInput && ruleSlotIndexOutput) {
      if (ruleSlotIndexInput == ruleSlotIndexOutput) {
        msgList.add(messages.from(messages._350, 0, ""));
      }
      ruleList = [];
      for (let i = 0; i < cluster.ruleList.length; ++i) {
        let rule: Rule = cluster.ruleList[i];
        if (rule.ruleSlotIndexInput == ruleSlotIndexInput && rule.ruleSlotIndexOutput == ruleSlotIndexOutput) {
          if (rule.state == RULE_STATE.ENABLED || rule.state == RULE_STATE.ENABLED_FOREVER) {
            ruleList.push(rule);
            break;
          }
        }
      }

      if (ruleList.length == 0) {
        msgList.add(messages.from(messages._351, 0, "", [ruleSlotIndexInput, ruleSlotIndexOutput]));
      }
    }
  }

  if (cluster.ruleSlotList.length == 0) {
    msgList.add(messages.from(messages._304, 0, ""));
  }

  for (let i = 0; i < ruleList.length; ++i) {
    let rule: Rule = ruleList[i];
    msgList.addList(await checkRule(engineInstance, rule, cluster));
  }

  for (let i = 0; i < cluster.ruleSlotList.length; ++i) {
    let ruleSlotIndex = cluster.ruleSlotList[i].ruleSlotIndex;
    let foundOutput: boolean = false;
    for (let d = 0; d < ruleList.length; ++d) {
      let rule: Rule = ruleList[d];

      if (rule.ruleSlotIndexOutput == ruleSlotIndex) {
        foundOutput = true;
        break;
      }
      // log.debug("------ rule ruleSlotIndexInput", rule.ruleSlotIndexInput);
      // log.debug("------ rule ruleSlotIndexOutput", rule.ruleSlotIndexInput);
    }

    if (!foundOutput)
      continue;

    let groupSlotList: [] = cluster.ruleSlotList[i].groupSlotList;
    for (let j = 0; j < groupSlotList.length; ++j) {
      msgList.addList(await checkGroupSlot(engineInstance, j, cluster, groupSlotList[j], true, false, false));
    }
  }

  if (msgList.length() == 0) {
    msgList.add(messages.from(messages._200, 0, "", ["all cluster outputs are ok"]));
  }

  msgList.print();

  return msgList.msgList;
}

//check cluster before addRule
export async function checkCluster(engineInstance: Engine, cluster: Cluster, approve?: boolean, callBack?: Callback) {
  let msgList = new MessageList("checkCluster");
  if (cluster.state != CLUSTER_STATE.ENABLED) {
    msgList.add(messages.from(messages._301, 0, "0x", [cluster.state]));
  }

  let ruleList = cluster.ruleList;
  if (cluster.ruleSlotList.length == 0) {
    msgList.add(messages.from(messages._304, 0, ""));
  }

  for (let i = 0; i < ruleList.length; ++i) {
    let rule: Rule = ruleList[i];
    let found = 0;
    for (let i = 0; i < cluster.ruleSlotList.length; ++i) {
      let ruleSlot = cluster.ruleSlotList[i];
      if (ruleSlot.ruleSlotIndex == rule.ruleSlotIndexInput || ruleSlot.ruleSlotIndex == rule.ruleSlotIndexOutput) {
        found++;
      }
    }

    if (found < 2) {
      throw  Error("rule ruleSlotIndexInput " + rule.ruleSlotIndexInput + " ruleSlotIndexOutput " + rule.ruleSlotIndexOutput + " not match ruleSlotIndexList");
    }

    let ruleMsgList = await checkRule(engineInstance, rule, cluster);
    if (ruleMsgList.length > 0 && ruleMsgList[0].code != 200) {
      msgList.addList(ruleMsgList);
    }
  }

  for (let i = 0; i < cluster.ruleSlotList.length; ++i) {
    let ruleSlot = cluster.ruleSlotList[i];
    let ruleSlotIndex = cluster.ruleSlotList[i].ruleSlotIndex;
    let foundOutput: boolean = false;
    for (let d = 0; d < ruleList.length; ++d) {
      let rule: Rule = ruleList[d];
      if (rule.ruleSlotIndexOutput == ruleSlotIndex) {
        foundOutput = true;
        break;
      }
      // log.debug("------ rule ruleSlotIndexInput", rule.ruleSlotIndexInput);
      // log.debug("------ rule ruleSlotIndexOutput", rule.ruleSlotIndexInput);
    }

    for (let j = 0; j < ruleSlot.groupSlotList.length; ++j) {
      msgList.addList(await checkGroupSlot(engineInstance, j, cluster, ruleSlot.groupSlotList[j], foundOutput, true, approve, callBack));
    }
  }

  checkHandlerCallback(engineInstance,cluster,ruleList,msgList);

  if (msgList.length() == 0) {
    msgList.add(messages.from(messages._200, 0, "", ["all cluster outputs are ok"]));
  }

  msgList.print();

  return msgList.msgList;
}

//addRule true ,use for adding cluster check
//addRule false, user for calling engine
export async function checkGroupSlot(engineInstance: Engine, groupSlotIndex: number, cluster: Cluster, groupSlot: GroupSlot, isOutput: boolean, addRule: boolean, approve: boolean, callBack?: Callback): [] {
  let msgList = new MessageList("checkGroupSlot");
  if (groupSlot.poolToken != ZERO_ADDRESS) {

    if(!utils.isAddress(groupSlot.poolToken)){
      msgList.add(messages.from(messages._493, groupSlotIndex * 1000, groupSlot.poolToken, [groupSlotIndex,groupSlot.poolToken]));
      return msgList.msgList;
    }

    if (groupSlot.poolToken == MINT_DESTROY_ADDRESS || groupSlot.poolToken == SELF_ADDRESS) {
      msgList.add(messages.from(messages._490, groupSlotIndex * 1000, groupSlot.poolToken, [groupSlotIndex]));
    }
    if (isOutput) {
      const CLUSTER_ROLE: BytesLike = utils.keccak256(utils.toUtf8Bytes("CLUSTER_ROLE"));
      let poolToken = <PoolToken>await PoolToken__factory.connect(groupSlot.poolToken, engineInstance.owner);
      try {
        let hasRole = await poolToken.hasRole(CLUSTER_ROLE, engineInstance.owner.address);
        if (!hasRole) {
          msgList.add(messages.from(messages._491, groupSlotIndex * 1000, groupSlot.poolToken, [groupSlotIndex, groupSlot.poolToken]));
        }
      } catch (e) {
        msgList.add(messages.from(messages._492, groupSlotIndex * 1000, groupSlot.poolToken, [groupSlotIndex, groupSlot.poolToken]));
      }
    }
  }
  // checkTokenSlot
  for (let k = 0; k < groupSlot.tokenSlotList.length; ++k) {
    let tokenSlot: TokenSlot = groupSlot.tokenSlotList[k];
    let preStr = `GroupSlot ${groupSlotIndex} TokenSlot ${k}`;

    let tokenIndex = groupSlotIndex * 10000 + k;

    if(!utils.isAddress(tokenSlot.ioAddressList[0])){
      msgList.add(messages.from(messages._554, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0]]));
      continue;
    }

    if (!utils.isAddress(tokenSlot.tokenTemplate.token)) {
      msgList.add(messages.from(messages._656, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token]));
      continue;
    }

    if (tokenSlot.tokenTemplate.getType() == TOKEN_TEMPLATE_TYPE.SWAP_V2) {
      let swapRouter01Address = tokenSlot.tokenTemplate.getSwapRouter01();
      let swapRouter01 = ISwapV2Router01__factory.connect(swapRouter01Address, engineInstance.owner);

      let factory = await swapRouter01.factory();

      let swapFactory = ISwapV2Factory__factory.connect(factory, engineInstance.owner);
      let pair = await swapFactory.getPair(tokenSlot.tokenTemplate.token, tokenSlot.tokenTemplate.getSwapToken());

      if (pair == ZERO_ADDRESS) {
        msgList.add(messages.from(messages._801, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token, tokenSlot.tokenTemplate.getSwapToken(), "Swap"]));
      }
    }

    // output
    if (!isOutput) {
      return msgList.msgList;
    }
    let isContract = await engineInstance.poolContract.isContract(tokenSlot.ioAddressList[0]);
    if (isContract) {
      let GRANT_ROLE: BytesLike;
      let GRANT_ROLE_NAME: string;
      let baseMessage: Message;
      if (groupSlot.tokenSlotList[k].ioTypeList[0] == RULE_IO_TYPE.POOL_TOKEN_TRANSFER) {
        GRANT_ROLE = utils.keccak256(utils.toUtf8Bytes("TRANSFER_ROLE"));
        GRANT_ROLE_NAME = "TRANSFER_ROLE";
        baseMessage = messages._550;
      } else if (groupSlot.tokenSlotList[k].ioTypeList[0] == RULE_IO_TYPE.POOL_TOKEN_MINT_DESTROY) {
        GRANT_ROLE = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));
        GRANT_ROLE_NAME = "MINTER_ROLE";
        baseMessage = messages._551;
      }

      let poolToken = <PoolToken>await PoolToken__factory.connect(tokenSlot.ioAddressList[0], engineInstance.owner);
      try {
        async function hasRole() {
          return await poolToken.hasRole(GRANT_ROLE, engineInstance.engine.address);
        }

        let _hasRole = await hasRole();
        if (!_hasRole) {
          if (approve) {
            const approveFunc = async () => {
              return await poolToken.connect(engineInstance.owner).grantRole(GRANT_ROLE, engineInstance.engine.address);
            };
            await chainHub.Tx.contractCall(
              "grant_" + baseMessage.code + "_" + tokenIndex,
              {
                [chainHub.EventState.PROCESSING]: "start to grant " + GRANT_ROLE_NAME + " for poolToken " + tokenSlot.ioAddressList[0],
                [chainHub.EventState.CONFIRMED]: "user confirmed",
                [chainHub.EventState.CANCELED]: "user canceled",
                [chainHub.EventState.SUCCESS]: "grant successfully",
                [chainHub.EventState.FAILURE]: "grant failed"
              },
              approveFunc,
              callBack);
          } else {
            msgList.add(messages.rewrite(baseMessage, tokenIndex, tokenSlot.ioAddressList[0],
              `{0} PoolToken Contract {1} hasn't granted {2} to Engine`,
              [preStr, tokenSlot.ioAddressList[0], GRANT_ROLE_NAME]).addCallback(hasRole));
          }
        }

        //make sure tokenTemplate has granted MINTER_ROLE to poolTokenMint
        if (groupSlot.tokenSlotList[k].ioTypeList[0] == RULE_IO_TYPE.POOL_TOKEN_MINT_DESTROY) {
          let tokenContract = <IERCMintBurnClaimRole>await IERCMintBurnClaimRole__factory.connect(groupSlot.tokenSlotList[k].tokenTemplate.token, engineInstance.owner);

          async function hasRole() {
            return await tokenContract.hasRole(GRANT_ROLE, poolToken.address);
          }

          let _hasRole = await hasRole();
          if (!_hasRole) {
            if (approve) {
              const approveFunc = async () => {
                return await tokenContract.connect(engineInstance.owner).grantRole(GRANT_ROLE, poolToken.address);
              };
              await chainHub.Tx.contractCall(
                "grant_" + baseMessage.code + "_" + tokenIndex,
                {
                  [chainHub.EventState.PROCESSING]: "start to grant " + GRANT_ROLE_NAME + " for poolToken " + tokenSlot.ioAddressList[0],
                  [chainHub.EventState.CONFIRMED]: "user confirmed",
                  [chainHub.EventState.CANCELED]: "user canceled",
                  [chainHub.EventState.SUCCESS]: "grant successfully",
                  [chainHub.EventState.FAILURE]: "grant failed"
                },
                approveFunc,
                callBack);
            } else {
              msgList.add(messages.rewrite(baseMessage, tokenIndex, tokenSlot.ioAddressList[0],
                `{0} Token Contract {1} hasn't granted {2} to PoolTokenMint`,
                [preStr, tokenContract.address, GRANT_ROLE_NAME]).addCallback(hasRole));
            }
          }
        }
      } catch (e) {
        msgList.add(messages.from(messages._552, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0]]));
      }
      if (addRule) {
        const CLUSTER_ROLE: BytesLike = utils.keccak256(utils.toUtf8Bytes("CLUSTER_ROLE"));
        try {
          let hasRole = await poolToken.hasRole(CLUSTER_ROLE, engineInstance.owner.address);
          if (!hasRole) {
            msgList.add(messages.from(messages._553, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0]]));
          }
        } catch (e) {
          msgList.add(messages.from(messages._552, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0]]));
        }
      }
    } else if (tokenSlot.ioAddressList[0] == MINT_DESTROY_ADDRESS) { // deployer check for minting
      let deployer = await engineInstance.poolContract.deployer(tokenSlot.tokenTemplate.token);

      if (deployer == ZERO_ADDRESS) {
        msgList.add(messages.from(messages._651, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token, tokenSlot.tokenTemplate.desc()]));
      } else if (!cluster.deployerList.includes(deployer.toLowerCase())) { //cluster.deployer != deployer
        msgList.add(messages.from(messages._652, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token, tokenSlot.tokenTemplate.desc()]));
      }

      if (tokenSlot.tokenTemplate.erc != ERC.COIN) {
        const MINTER_ROLE: BytesLike = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));

        let tokenContract = <IERCMintBurnClaimRole>await IERCMintBurnClaimRole__factory.connect(tokenSlot.tokenTemplate.token, engineInstance.owner);
        try {
          async function hasRole() {
            return await tokenContract.hasRole(MINTER_ROLE, engineInstance.engine.address);
          }

          let _hasRole = await hasRole();
          if (!_hasRole) {
            if (approve) {
              const approveFunc = async () => {
                return await tokenContract.grantRole(MINTER_ROLE, engineInstance.engine.address);
              };
              await chainHub.Tx.contractCall(
                "grant_653_" + groupSlotIndex + "_" + k,
                {
                  [chainHub.EventState.PROCESSING]: "start to grant MINTER_ROLE on token " + tokenSlot.tokenTemplate.token,
                  [chainHub.EventState.CONFIRMED]: "user confirmed",
                  [chainHub.EventState.CANCELED]: "user canceled",
                  [chainHub.EventState.SUCCESS]: "grant successfully",
                  [chainHub.EventState.FAILURE]: "grant failed"
                },
                approveFunc,
                callBack);
            } else {
              msgList.add(messages.from(messages._653, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token, tokenSlot.tokenTemplate.desc()]).addCallback(hasRole));
            }
          }
        } catch (e) {
          msgList.add(messages.from(messages._655, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token]));
        }
      } else {
        msgList.add(messages.from(messages._654, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token, "Coin"]));
      }
    } else if (tokenSlot.ioAddressList[0] != SELF_ADDRESS) { // msg.sender as output resource

      if(tokenSlot.tokenTemplate.functionTarget || tokenSlot.tokenTemplate.functionValue || tokenSlot.tokenTemplate.functionData){
        msgList.add(messages.from(messages._761, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0]]));
      }

      if (!cluster.deployerList.includes(tokenSlot.ioAddressList[0])) {
        msgList.add(messages.from(messages._751, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0], cluster.deployerList[0]]));
      }
      if (tokenSlot.tokenTemplate.erc == ERC.COIN) {
        msgList.add(messages.from(messages._752, tokenIndex, tokenSlot.ioAddressList[0], [preStr, "Coin"]));
      } else { // make sure , user address as output source , it must approve engine.
        if (tokenSlot.tokenTemplate.erc == ERC.ERC20) {
          let tokenContract = <IERC20>await IERC20__factory.connect(tokenSlot.tokenTemplate.token, engineInstance.owner);
          async function getAllowance() {
            return await tokenContract.allowance(tokenSlot.ioAddressList[0], engineInstance.engine.address);
          }

          let allowance = await getAllowance();
          if (allowance.lt(tokenSlot.tokenTemplate.amountEnd)) {
            if (approve) {
              const approveFunc = async () => {
                return await tokenContract.connect(engineInstance.owner).approve(engineInstance.engine.address, tokenSlot.tokenTemplate.amountEnd.sub(allowance));
              };
              await chainHub.Tx.contractCall(
                "approve_753_" + groupSlotIndex + "_" + k,
                {
                  [chainHub.EventState.PROCESSING]: "start to approve",
                  [chainHub.EventState.CONFIRMED]: "user confirmed",
                  [chainHub.EventState.CANCELED]: "user canceled",
                  [chainHub.EventState.SUCCESS]: "approve successfully",
                  [chainHub.EventState.FAILURE]: "approve failed"
                },
                approveFunc,
                callBack);
            } else { // danger hint
              msgList.add(messages.from(messages._753, tokenIndex, tokenSlot.ioAddressList[0], [preStr, D18(allowance), D18(tokenSlot.tokenTemplate.amountEnd), tokenSlot.tokenTemplate.desc()])
                .addCallback(async () => {
                  let allowance = await getAllowance();
                  return allowance.gte(tokenSlot.tokenTemplate.amountEnd);
                }));
            }
          }
        } else if (tokenSlot.tokenTemplate.erc == ERC.ERC721) {
          let tokenContract = <IERC721>await IERC721__factory.connect(tokenSlot.tokenTemplate.token, engineInstance.owner);

          async function isApproval() {
            return await tokenContract.isApprovedForAll(tokenSlot.ioAddressList[0], engineInstance.engine.address);
          }

          let _isApproval = await isApproval();
          if (!_isApproval) {
            if (approve) {
              const approveFunc = async () => {
                return await tokenContract.setApprovalForAll(engineInstance.engine.address, true);
              };
              await chainHub.Tx.contractCall(
                "setApproveForAll_754_" + groupSlotIndex + "_" + k,
                {
                  [chainHub.EventState.PROCESSING]: "start to setApproveForAll ERC721 " + tokenSlot.tokenTemplate.token,
                  [chainHub.EventState.CONFIRMED]: "user confirmed",
                  [chainHub.EventState.CANCELED]: "user canceled",
                  [chainHub.EventState.SUCCESS]: "setApproveForAll successfully",
                  [chainHub.EventState.FAILURE]: "setApproveForAll failed"
                },
                approveFunc,
                callBack);
            } else {
              msgList.add(messages.from(messages._754, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0], engineInstance.engine.address, tokenSlot.tokenTemplate.desc()]).addCallback(isApproval));
            }
          }
        } else if (tokenSlot.tokenTemplate.erc == ERC.ERC1155) {
          let tokenContract = <IERC1155>await IERC1155__factory.connect(tokenSlot.tokenTemplate.token, engineInstance.owner);
          async function isApproval() {
            return await tokenContract.isApprovedForAll(tokenSlot.ioAddressList[0], engineInstance.engine.address);
          }

          let _isApproval = await isApproval();
          if (!_isApproval) {
            if (approve) {
              const approveFunc = async () => {
                return await tokenContract.setApprovalForAll(engineInstance.engine.address, true);
              };
              await chainHub.Tx.contractCall(
                "setApproveForAll_755_" + groupSlotIndex + "_" + k,
                {
                  [chainHub.EventState.PROCESSING]: "start to setApproveForAll ERC1155 " + tokenSlot.tokenTemplate.token,
                  [chainHub.EventState.CONFIRMED]: "user confirmed",
                  [chainHub.EventState.CANCELED]: "user canceled",
                  [chainHub.EventState.SUCCESS]: "setApproveForAll successfully",
                  [chainHub.EventState.FAILURE]: "setApproveForAll failed"
                },
                approveFunc,
                callBack);
            } else {
              msgList.add(messages.from(messages._755, tokenIndex, tokenSlot.ioAddressList[0], [preStr, tokenSlot.ioAddressList[0], engineInstance.engine.address, tokenSlot.tokenTemplate.desc()]).addCallback(isApproval));
            }
          }
        }
      }
    }

    // coin as output , can not be minted
    if (tokenSlot.tokenTemplate.erc == ERC.COIN && tokenSlot.ioAddressList[0] == MINT_DESTROY_ADDRESS) {
      msgList.add(messages.from(messages._654, tokenIndex, tokenSlot.tokenTemplate.token, [preStr, tokenSlot.tokenTemplate.token, "Coin"]));
    }

  }

  return msgList.msgList;
}

export async function checkRuleSlot(engineInstance: Engine, cluster: Cluster, ruleSlot: GroupSlot[], approve: boolean, callBack?: Callback): [] {
  log.debug("checkRuleSlot", "clusterId", cluster.clusterId);
  let msgList = new MessageList("checkRuleSlot");

  for (let i = 0; i < ruleSlot.length; ++i) {
    for (let j = 0; j < ruleSlot[i].tokenSlotList.length; ++j) {
      ruleSlot[i].tokenSlotList[j].bitEncode();
    }
    let ruleSlot = cluster.ruleSlotList[i];
    let ruleSlotIndex = cluster.ruleSlotList[i].ruleSlotIndex;
    let foundOutput: boolean = false;
    for (let d = 0; d < ruleList.length; ++d) {
      let rule: Rule = ruleList[d];
      if (rule.ruleSlotIndexOutput == ruleSlotIndex) {
        foundOutput = true;
        break;
      }
    }

    msgList.addList(await checkGroupSlot(engineInstance, i, cluster, ruleSlot[i], foundOutput, true, approve, callBack));
  }

  if (msgList.length() == 0) {
    msgList.add(messages.from(messages._200, 0, "", [`ruleSlot is ok in clusterId ${cluster.clusterId}`]));
  }

  msgList.print();
  return msgList.msgList;
}

export async function checkRule(engineInstance: Engine, rule: Rule, cluster?: Cluster, approve?: boolean, callBack?: Callback): [] {
  let msgList = new MessageList("checkRule");

  if (rule.ruleSlotIndexOutput == rule.ruleSlotIndexInput) {
    msgList.add(messages.from(messages._350, 0, ""));
    msgList.print();
    return msgList.msgList;
  }

  for (let j = 0; j < rule.preHandlerList.length; ++j) {
    let clusterHandlerArea = <IClusterHandlerArea>await IClusterHandlerArea__factory.connect(rule.preHandlerPoolList[j], engineInstance.owner);
    let exist = await clusterHandlerArea.isAvailable(rule.preHandlerList[j]);
    if (!exist) {
      msgList.add(messages.from(messages._353, j, rule.preHandlerList[j], [rule.preHandlerList[j], rule.preHandlerPoolList[j]]));
    }
  }

  for (let j = 0; j < rule.processHandlerList.length; ++j) {
    let clusterHandlerArea = <IClusterHandlerArea>await IClusterHandlerArea__factory.connect(rule.processHandlerPoolList[j], engineInstance.owner);
    let exist = await clusterHandlerArea.isAvailable(rule.processHandlerList[j]);
    if (!exist) {
      msgList.add(messages.from(messages._354, j, rule.processHandlerList[j], [rule.processHandlerList[j], rule.processHandlerPoolList[j]]));
    }
  }

  for (let j = 0; j < rule.postHandlerList.length; ++j) {
    let clusterHandlerArea = <IClusterHandlerArea>await IClusterHandlerArea__factory.connect(rule.postHandlerPoolList[j], engineInstance.owner);
    let exist = await clusterHandlerArea.isAvailable(rule.postHandlerList[j]);
    if (!exist) {
      msgList.add(messages.from(messages._355, j, rule.postHandlerList[j], [rule.postHandlerList[j], rule.postHandlerPoolList[j]]));
    }
  }

  if (cluster) {
    // let groupSlotList = cluster.ruleSlotList[rule.ruleSlotIndexOutput];
    for (const ruleSlot of cluster.ruleSlotList) {
      if (rule.ruleSlotIndexOutput == ruleSlot.ruleSlotIndex) {
        msgList.addList(await checkRuleSlot(engineInstance, cluster, ruleSlot, approve, callBack));
      }
    }
  }

  if (cluster) {
    if (msgList.length() == 0) {
      msgList.add(messages.rewrite(messages._200, 0, "",
          `rule[{0}-{1}] is ok in clusterId {2}`),
        [rule.ruleSlotIndexInput, rule.ruleSlotIndexOutput, cluster.clusterId]
      );
    }
    msgList.print();
  }

  return msgList.msgList;
}


function checkHandlerCallback(engineInstance:Engine,cluster:Cluster,ruleList:Rule[],msgList:MessageList){

  //callback to THandler
  //pre handler
  for (let i = 0; i < ruleList.length; ++i) {
    let rule: Rule = ruleList[i];

    for(let j = 0; j < rule.preHandlerList.length; ++j){
      let handlerAddress = rule.preHandlerList[j];
      let handler:BaseHandler = engineInstance.handler.addressToTHandler(handlerAddress);

      if(handler){
        let [ruleSlotInput,ruleSlotOutput] = getRuleSlotIO(cluster,rule);
        msgList.addList(handler.checkCluster(PRE_HANDLER,rule,ruleSlotInput,ruleSlotOutput));
      }
    }
  }

  //process handler

  for (let i = 0; i < ruleList.length; ++i) {
    let rule: Rule = ruleList[i];

    for(let j = 0; j < rule.processHandlerList.length; ++j){
      let handlerAddress = rule.processHandlerList[j];
      let handler:BaseHandler = engineInstance.handler.addressToTHandler(handlerAddress);

      if(handler) {
        let [ruleSlotInput, ruleSlotOutput] = getRuleSlotIO(cluster, rule);
        msgList.addList(handler.checkCluster(PROCESS_HANDLER, rule, ruleSlotInput, ruleSlotOutput));
      }
    }
  }

  //post handler

  for (let i = 0; i < ruleList.length; ++i) {
    let rule: Rule = ruleList[i];

    for(let j = 0; j < rule.postHandlerList.length; ++j){
      let handlerAddress = rule.postHandlerList[j];
      let handler:BaseHandler = engineInstance.handler.addressToTHandler(handlerAddress);

      if(handler) {
        let [ruleSlotInput, ruleSlotOutput] = getRuleSlotIO(cluster, rule);
        msgList.addList(handler.checkCluster(POST_HANDLER, rule, ruleSlotInput, ruleSlotOutput));
      }
    }
  }

}

function getRuleSlotIO(cluster:Cluster,rule:Rule):[RuleSlot,RuleSlot] {

  let ruleSlotInput:RuleSlot;
  let ruleSlotOutput:RuleSlot;

  for (let s = 0; s < cluster.ruleSlotList.length; ++s) {
    let ruleSlot = cluster.ruleSlotList[s];
    let ruleSlotIndex = cluster.ruleSlotList[s].ruleSlotIndex;

    if(rule.ruleSlotIndexInput == ruleSlotIndex){
      ruleSlotInput = ruleSlot;
    }
    else if(rule.ruleSlotIndexOutput == ruleSlotIndex){
      ruleSlotOutput = ruleSlot;
    }
  }

  return [ruleSlotInput,ruleSlotOutput];
}
