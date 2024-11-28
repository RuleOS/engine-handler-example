// @ts-nocheck
import { BigNumber, BigNumberish, Signer } from "ethers";
import * as chainHub from "@ruleos/chain-hub";
import {
  IExchange,
  IExchange__factory,
  PoolContract,
  PoolContract__factory,
  PoolToken,
  PoolToken__factory,
  ProxyIntake,
  ProxyIntake__factory
} from "../../engine-typechain";
import { ERC, Message, MessageList, MSG_LEVEL, MSG_TYPE, Token, ZERO_ADDRESS } from "./struct";
import { Gas } from "./util";

import IERC20Json from "../../artifacts/contracts/interface/IERC20.sol/IERC20.json";
import IERC721Json from "../../artifacts/contracts/interface/IERC721.sol/IERC721.json";
import IERC1155Json from "../../artifacts/contracts/interface/IERC1155.sol/IERC1155.json";

let E18 = chainHub.Util.E18;
let D18 = chainHub.Util.D18;
const EventState = chainHub.EventState;

export interface Callback {
  (name: string, state: number, event: string): void;
}

export class Exchange {
  exchange: IExchange;
  exchangeProxy: ProxyIntake;

  address: string;
  tokenUtil: chainHub.TokenUtil;
  poolContract: PoolContract;
  poolToken: PoolToken;

  owner: Signer;
  hubChain: chainHub.Chain;
  hubContract: chainHub.Contract;

  constructor(owner: Signer) {
    this.owner = owner;
    this.hubChain = new chainHub.Chain("", [owner]);
    this.hubContract = new chainHub.Contract("");
  }

  public async load(exchangeAddress: string, exchangeProxyAddress: string, poolContractAddress: string, poolTokenAddress: string) {
    this.exchange = <IExchange>await IExchange__factory.connect(exchangeAddress, this.owner);
    this.exchangeProxy = <ProxyIntake>await ProxyIntake__factory.connect(exchangeProxyAddress, this.owner);

    this.exchange = this.exchange.attach(this.exchangeProxy.address);
    this.address = this.exchangeProxy.address;

    this.poolContract = <PoolContract>await PoolContract__factory.connect(poolContractAddress, this.owner);
    this.poolToken = <PoolToken>await PoolToken__factory.connect(poolTokenAddress, this.owner);

    this.tokenUtil = new chainHub.TokenUtil("", this.owner);
    await this.tokenUtil.load(
      { address: ZERO_ADDRESS, abiJson: IERC20Json },
      { address: "", abiJson: IERC20Json },
      { address: "", abiJson: IERC721Json },
      { address: "", abiJson: IERC1155Json }
    );
  }

  public async pause(channel: BigNumberish) {
    console.log("---------- pauseExchange channel", channel);
    await this.exchange.pause(channel, true);
  }

  public async unpause(channel: BigNumberish) {
    console.log("---------- unpauseExchange channel", channel);
    await this.exchange.pause(channel, false);
  }

  public async setTokenRoyaltyRate(deployer: Signer, token: string, royaltyRate: BigNumberish) {

    let msgList = new MessageList("setTokenRoyaltyRate");

    let tokenDeployer = await this.poolContract.deployer(token);
    if (tokenDeployer == ZERO_ADDRESS) {
      msgList.add(new Message(0, 601, MSG_TYPE.NONE, MSG_LEVEL.NORMAL, "",
        "token " + token + " hasn't been registered to PoolContract", ""));
      msgList.print();
      return msgList;
    } else {
      msgList.add(new Message(0, 200, MSG_TYPE.NONE, MSG_LEVEL.NORMAL, "",
        "all cluster outputs are ok", ""));
    }
    msgList.print();
    await this.exchange.connect(deployer).setTokenRoyaltyRate(token, royaltyRate);
  }

  public async makeBatchSell(user: Signer, tokenList: Token[], callBack?: Callback = () => {
  }, gasLimit?: number = 6000000) {

    console.log("----- exchange makeBatchSell");

    console.log("----- exchange makeBatchSell check token approval");

    let checkApprovalResult = await this.tokenUtil.checkApprovalTokenList(user, tokenList, this.exchange.address, true);

    console.log("----- exchange makeBatchSell check token balance");

    let checkBalanceResult = await this.tokenUtil.checkBalanceTokenList(user, tokenList);

    if (checkBalanceResult != "") {
      callBack("makeBatchSell", EventState.FAILURE, "makeBatchSell failed, checkBalanceResult: " + checkBalanceResult);
      return checkBalanceResult;
    }

    let overrides = {
      gasLimit: gasLimit
    };

    const makeBatchSellOrder = async () => {

      let tx = await Gas.estimateGasTx(
        user,
        this.exchange,
        "makeBatchSellOrder",
        [tokenList],
        overrides);

      return tx;

    };
    const { tx, receipt } = await chainHub.Tx.contractCallSimple(
      "makeBatchSell",
      makeBatchSellOrder,
      callBack);

    // console.log('---receipt', receipt.logs);
    let eventLogList = await this.hubContract.decodeEvent(this.exchange, receipt, "Sell");

    for (let i = 0; i < eventLogList.length; ++i) {
      let token = eventLogList[i].eventLog.token;
      let sellIndex = eventLogList[i].eventLog.sellIndex;

      // if(token == tokenList[i]){
      tokenList[i].sellIndex = sellIndex;
      // }
    }

    return [tokenList, tx];
  }

  public async makeBatchBuy(user: Signer, tokenList: Token[], callBack?: Callback = () => {
  }, gasLimit?: number = 6000000) {

    console.log("----- exchange makeBatchBuy");

    let totalPrice = 0;
    for (let i = 0; i < tokenList.length; ++i) {
      let token = tokenList[i];

      if (token.erc == ERC.ERC20 || token.erc == ERC.ERC1155) {
        totalPrice += D18(token.price) * (D18(token.amount));
      } else {
        totalPrice += D18(token.price);
      }

    }

    let payableOverrides = {
      value: E18(totalPrice),
      gasLimit: gasLimit
    };

    const makeBatchBuyOrder = async () => {

      let tx = await Gas.estimateGasTx(
        user,
        this.exchange,
        "makeBatchBuyOrder",
        [tokenList],
        payableOverrides);

      return tx;
    };
    const { tx, receipt } = await chainHub.Tx.contractCallSimple(
      "makeBatchBuy",
      makeBatchBuyOrder,
      callBack);


    // console.log('---receipt', receipt.logs);
    let eventLogList = await this.hubContract.decodeEvent(this.exchange, receipt, "Buy");

    for (let i = 0; i < eventLogList.length; ++i) {
      let token = eventLogList[i].eventLog.token;
      let buyIndex = eventLogList[i].eventLog.buyIndex;

      tokenList[i].buyIndex = buyIndex;
    }

    return [tokenList, tx];
  }

  public async cancelBatchSell(user: Signer, sellIndexList: BigNumber[], callBack?: Callback = () => {
  }, gasLimit?: number = 6000000) {

    console.log("----- exchange cancelBatchSell");

    if (sellIndexList.length == 0) {
      console.log("----- exchange must sellIndexList.length > 0");
      callBack("cancelBatchSell", EventState.FAILURE, "cancelBatchSell failed");
      return "";
    }

    let overrides = {
      gasLimit: gasLimit
    };

    const cancelBatchSellOrder = async () => {
      let tx = await Gas.estimateGasTx(
        user,
        this.exchange,
        "cancelBatchSellOrder",
        [sellIndexList],
        overrides);

      return tx;
    };
    const { tx, receipt } = await chainHub.Tx.contractCallSimple(
      "cancelBatchSell",
      cancelBatchSellOrder,
      callBack);

    // console.log('---receipt', receipt.logs);
    let eventLogList = await this.hubContract.decodeEvent(this.exchange, receipt, "CancelSell");

    return [eventLogList, tx];
  }

  public async cancelBatchBuy(user: Signer, buyIndexList: BigNumber[], callBack?: Callback = () => {
  }, gasLimit?: number = 6000000) {

    console.log("----- exchange cancelBatchBuy");

    if (buyIndexList.length == 0) {
      console.log("----- exchange must buyIndexList.length > 0");
      callBack("cancelBatchBuy", EventState.FAILURE, "cancelBatchBuy failed, exchange must buyIndexList.length > 0");
      return "";
    }

    let overrides = {
      gasLimit: gasLimit
    };

    const cancelBatchBuyOrder = async () => {
      let tx = await Gas.estimateGasTx(
        user,
        this.exchange,
        "cancelBatchBuyOrder",
        [buyIndexList],
        overrides);

      return tx;
    };
    const { tx, receipt } = await chainHub.Tx.contractCallSimple(
      "cancelBatchBuy",
      cancelBatchBuyOrder,
      callBack);


    // console.log('---receipt', receipt.logs);
    let eventLogList = await this.hubContract.decodeEvent(this.exchange, receipt, "CancelBuy");

    return [eventLogList, tx];
  }

  public async takeBatchSell(user: Signer, tokenList: Token[], callBack?: Callback = () => {
  }, gasLimit?: number = 6000000) {

    console.log("----- exchange takeBatchSell");

    let sellIndexList = [];
    let totalPrice = 0;
    for (let i = 0; i < tokenList.length; ++i) {
      let token = tokenList[i];
      if (token.sellIndex == undefined) {
        console.log("----- exchange takeBatchSell token.sellIndex undefined no." + i);
        return;
      }

      if (token.erc == ERC.ERC20 || token.erc == ERC.ERC1155) {
        totalPrice += D18(token.price) * (D18(token.amount));
      } else {
        totalPrice += D18(token.price);
      }

      sellIndexList.push(token.sellIndex);
    }

    let payableOverrides = {
      value: E18(totalPrice),
      gasLimit: gasLimit
    };

    const takeBatchSellOrder = async () => {
      let tx = await Gas.estimateGasTx(
        user,
        this.exchange,
        "takeBatchSellOrder",
        [sellIndexList, tokenList],
        payableOverrides);

      return tx;
    };
    const { tx, receipt } = await chainHub.Tx.contractCallSimple(
      "takeBatchSell",
      takeBatchSellOrder,
      callBack);

    // console.log('---receipt', receipt.logs);
    let eventLogList = await this.hubContract.decodeEvent(this.exchange, receipt, "TakeSell");

    return [eventLogList, tx];
  }

  public async takeBatchBuy(user: Signer, tokenList: Token[], callBack?: Callback = () => {
  }, gasLimit?: number = 6000000) {

    console.log("----- exchange takeBatchBuy");

    console.log("----- exchange takeBatchBuy check token approval");

    let checkApprovalResult = await this.tokenUtil.checkApprovalTokenList(user, tokenList, this.exchange.address, true);

    console.log("----- exchange takeBatchBuy check token balance");

    let checkBalanceResult = await this.tokenUtil.checkBalanceTokenList(user, tokenList);

    if (checkBalanceResult != "") {
      callBack("takeBatchBuy", EventState.FAILURE, "takeBatchBuy failed");
      return checkBalanceResult;
    }

    let buyIndexList = [];

    for (let i = 0; i < tokenList.length; ++i) {
      let token = tokenList[i];
      if (token.buyIndex == undefined) {
        console.log("----- exchange takeBatchBuy token.buyIndex undefined no." + i);
        callBack("takeBatchBuy", EventState.FAILURE, "takeBatchBuy failed, exchange takeBatchBuy token.buyIndex undefined no." + i);
        return;
      }
      buyIndexList.push(token.buyIndex);
    }

    let overrides = {
      gasLimit: gasLimit
    };


    const takeBatchBuyOrder = async () => {
      let tx = await Gas.estimateGasTx(
        user,
        this.exchange,
        "takeBatchBuyOrder",
        [buyIndexList, tokenList],
        overrides);

      return tx;
    };
    const { tx, receipt } = await chainHub.Tx.contractCallSimple(
      "takeBatchBuy",
      takeBatchBuyOrder,
      callBack);

    // console.log('---receipt', receipt.logs);
    let eventLogList = await this.hubContract.decodeEvent(this.exchange, receipt, "TakeBuy");

    return [eventLogList, tx];
  }

  public async matchBatchOrder(user: Signer, tokenMatchList: Token[], callBack?: Callback = () => {
  }, gasLimit?: number = 6000000) {

    console.log("----- exchange matchBatchOrder");

    let buyIndexList = [], sellIndexList = [];
    for (let i = 0; i < tokenMatchList.length; ++i) {
      let token = tokenMatchList[i];

      if (token.buyIndex == undefined || token.sellIndex == undefined) {
        console.log("----- exchange matchBatchOrder token buySellIndex is undefined no." + i);
        callBack("matchBatchOrder", EventState.FAILURE, "matchBatchOrder failed, exchange matchBatchOrder token buySellIndex is undefined no." + i);
        return;
      }

      buyIndexList.push(token.buyIndex);
      sellIndexList.push(token.sellIndex);
    }
    let overrides = {
      gasLimit: gasLimit
    };

    const matchBatchOrder = async () => {
      let tx = await Gas.estimateGasTx(
        user,
        this.exchange,
        "matchBatchOrder",
        [buyIndexList, sellIndexList],
        overrides);

      return tx;
    };

    const { tx, receipt } = await chainHub.Tx.contractCallSimple(
      "matchBatchOrder",
      matchBatchOrder,
      callBack);

    let eventLogList = await this.hubContract.decodeEvent(this.exchange, receipt, "MatchOrder");

    return [eventLogList, tx];
  }
}
