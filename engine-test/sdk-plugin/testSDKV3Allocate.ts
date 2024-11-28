// @ts-nocheck
import { ethers } from "hardhat";
import {
  AllocateHandler,
  AllocateHandler__factory,
  ERC1155MinterSupply,
  ERC1155MinterSupplyCap,
  ERC20FixedSupplyCap,
  ERC721MinterPauserAutoId,
  ERC721MinterPauserAutoIdCap,
  PoolToken, ProxyIntakeAdmin, RestrictHandler__factory, WhiteListHandler, WhiteListHandler__factory
} from "../../typechain";
import { Contract } from "../../src/chain/contract";
import * as chainHub from "@ruleos/chain-hub";
import { Log, LToken, LUser } from "@ruleos/chain-hub";
import { Signer } from "crypto";
import networkConfig from "../../networks";
import { BaseContract, BigNumberish, BytesLike, utils } from "ethers";

let { isAddress } = utils;


import {
  Cluster,
  DURATION_TYPE,
  Engine,
  FULL_POOL_TOKEN_ROLES,
  TRANSFER_ROLE,
  GroupSlot,
  HANDLER_CMD,
  HANDLER_CMD_EXECUTE_100,
  MINT_DESTROY_ADDRESS,
  Rule,
  RULE_IO_TYPE,
  RuleSlot,
  SELF_ADDRESS,
  Token,
  TokenSlot,
  TokenTemplate as TT,
  RLP
} from "../../src/sdk-v3";
import { deployEngine } from "../../src/sdk-v3/Deploy";
import { ALLOCATE_HANDLER } from "../../src/sdk-v3/Handler";

let rlp = require("rlp");
import { TAllocateHandler } from "../../src/sdk-v3/handler/TAllocateHandler";


let expandTo18Decimals = chainHub.Util.expandTo18Decimals;
let BN = chainHub.Util.BN;
let E18 = chainHub.Util.E18;
let D18 = chainHub.Util.D18;

let engine: Engine;
let poolToken: PoolToken;
let poolTokenInputOwner: PoolToken;
let poolTokenInputUserA: PoolToken;
let poolTokenMint: PoolToken;

let erc20Token: ERC20FixedSupplyCap;
let erc20Token2: ERC20FixedSupplyCap;
let erc1155Token: ERC1155MinterSupplyCap;
let erc721Token: ERC721MinterPauserAutoIdCap;
let erc721Token2: ERC721MinterPauserAutoIdCap;
let erc721TokenCap: ERC721MinterPauserAutoIdCap;
let owner, user, user2, user3, admin: Signer;

let hubChain: chainHub.Chain, hubContract: chainHub.Contract;

let folder = "2023-08-12";

setTimeout(function() {
  test();
}, 50);

let test = async function() {


  [owner, user, user2, user3, admin] = await ethers.getSigners();


  var url = networkConfig.networks[networkConfig.defaultNetwork].url;
  hubChain = new chainHub.Chain(url, await ethers.getSigners());
  hubContract = new chainHub.Contract(url);


  let contracts = await deployEngine(owner, folder);

  engine = await Engine.create(owner, contracts);

  await engine.handler.loadAll([
    await new TAllocateHandler(owner, engine).deploy(folder)
  ]);

  await deployERC();

  await testExpert100();

};


let testExpert100 = async function() {

  //input branch
  let tokenSlot1: TokenSlot = new TokenSlot(TT.newERC20(erc20Token.address, E18(5), E18(5)));
  tokenSlot1.addBranchTimestamp(SELF_ADDRESS, 2);

  let tokenSlot2: TokenSlot = new TokenSlot(TT.newERC1155Range(erc1155Token.address, BN(1), BN(1), E18(10), E18(30)));
  tokenSlot2.addBranchTimestamp(MINT_DESTROY_ADDRESS, 2);

  let groupSlot1: GroupSlot = new GroupSlot(poolTokenInputOwner.address, 1);
  groupSlot1.addTokenSlot(tokenSlot1);
  groupSlot1.addTokenSlot(tokenSlot2);


  let tokenSlot3: TokenSlot = new TokenSlot(TT.newERC721Range(erc721TokenCap.address, 0, 0));
  tokenSlot3.addBranchTimestamp(MINT_DESTROY_ADDRESS, 0, RULE_IO_TYPE.POOL_TOKEN_TRANSFER).addBusiness(2000);
  //output branch 1,60% probability
  let groupSlot2: GroupSlot = new GroupSlot(poolTokenInputOwner.address, 1);
  groupSlot2.addArgs(engine.HA(ALLOCATE_HANDLER), [RLP.to("percent", 6000)]);
  groupSlot2.addTokenSlot(tokenSlot3);
  groupSlot2.addTokenSlot(tokenSlot2);

  //output branch 2,40% probability
  let groupSlot3: GroupSlot = new GroupSlot(poolTokenInputOwner.address, 2);
  groupSlot3.addArgs(engine.HA(ALLOCATE_HANDLER), [RLP.to("percent", 4000)]);
  groupSlot3.addTokenSlot(tokenSlot2);


  let cluster: Cluster = new Cluster(owner.address, owner.address, "", 0, 0);//duration Begin delay
  cluster.addRuleSlot(new RuleSlot(0, [groupSlot1]));
  cluster.addRuleSlot(new RuleSlot(1, [groupSlot2]));

  let rule: Rule = new Rule(0, 1, 100, DURATION_TYPE.TIMESTAMP, 0, 0);

  rule.addProcessHandler(engine.clusterHandlerArea.address, engine.HA(ALLOCATE_HANDLER),
    [RLP.to("execute100", HANDLER_CMD_EXECUTE_100.ON), RLP.to("trialCount", 123)]);

  cluster.addRule(rule);


  await engine.checkCluster(cluster, true);
  let eTask = await engine.regRule(cluster);
  let clusterId = eTask.clusterId;

  //approve
  let e20Token = Token.newERC20(erc20Token.address, E18(5));
  let e1155Token = Token.newERC1155(erc1155Token.address, 1, E18(10));
  let tx = await erc20Token.connect(owner).approve(engine.address, E18(5));
  await tx.wait();
  tx = await erc1155Token.connect(owner).setApprovalForAll(engine.address, true);
  await tx.wait();

  let inTokenList: Token[] = [
    e20Token,
    e1155Token
  ];

  let multiple = 10000;

  //two step,input and excute
  //input
  let eventTask = await input(clusterId, 0, 1, 1, 0, multiple, inTokenList, []);

  //query random state
  await engine.getRandomState(engine.HH(ALLOCATE_HANDLER), 1, 0, 1, eventTask.taskId, true);

  await engine.waitBlock(owner);

  await engine.getRandomState(engine.HH(ALLOCATE_HANDLER), 1, 0, 1, eventTask.taskId, true);

  //excute
  let eventTaskExe = await execute(eventTask.taskId,
    [
      [engine.HA(ALLOCATE_HANDLER), RLP.to("execute", HANDLER_CMD.EXECUTE)]
    ], [0]);


};


let input = async function(clusterId: BigNumberish,
                           ruleSlotIndexInput: BigNumberish,
                           ruleSlotIndexOutput: BigNumberish,
                           groupInputBranch: BigNumberish,
                           taskId: BigNumberish,
                           multiple: BigNumberish,
                           inTokenList: Token[],
                           args: []) {

  let eventTask;
  console.log("---------- inputToken");
  await Log.monitor(hubChain,
    [
      LUser.new("owner", owner.address),
      LUser.new("user", user.address),
      LUser.new("engine", engine.address),
      LUser.new("destroy", MINT_DESTROY_ADDRESS),
      LUser.new("poolToken", poolToken.address),
      LUser.new("poolTokenInput", engine.poolTokenInput.address),
      LUser.new("poolTokenInputOwner", poolTokenInputOwner.address)
    ],
    [
      LToken.new(),
      LToken.new("erc20Token", erc20Token),
      LToken.new("erc20Token2", erc20Token2),
      LToken.new("erc1155Token", erc1155Token, [1, 2]),
      LToken.new("erc721Token", erc721Token, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      LToken.new("erc721Token2", erc721Token2, [101, 102, 103, 104, 105]),
      LToken.new("erc721Cap", erc721TokenCap, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    ],
    async function() {
      eventTask = await engine.input(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput, groupInputBranch, taskId, multiple, inTokenList, args);
    },
    "inputToken",
    ["diff"]
  );
  return eventTask;
};

let execute = async function(taskId, args: [], roundList: BigNumberish[] = [], value: BigNumberish = 0) {

  let eventTask;
  await Log.monitor(hubChain,
    [
      LUser.new("owner", owner.address),
      LUser.new("user", user.address),
      LUser.new("engine", engine.address),
      LUser.new("destroy", MINT_DESTROY_ADDRESS),
      LUser.new("poolToken", poolToken.address),
      LUser.new("poolTokenInput", engine.poolTokenInput.address),
      LUser.new("poolTokenInputOwner", poolTokenInputOwner.address)
    ],
    [
      LToken.new(),
      LToken.new("erc20Token", erc20Token),
      LToken.new("erc1155Token", erc1155Token, [1, 2]),
      LToken.new("erc721TokenCap", erc721TokenCap, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      LToken.new("erc721Token", erc721Token, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    ],
    async function() {
      eventTask = await engine.execute(taskId, args, roundList, value);
    },
    "execute",
    ["diff"]
  );

  return eventTask;
};

let claim = async function(taskId: BigNumberish, args: [], roundList: BigNumberish[]) {

  await Log.monitor(hubChain,
    [
      LUser.new("owner", owner.address),
      LUser.new("user", user.address),
      LUser.new("engine", engine.address),
      LUser.new("destroy", MINT_DESTROY_ADDRESS),
      LUser.new("poolToken", poolToken.address),
      LUser.new("poolTokenInput", engine.poolTokenInput.address),
      LUser.new("poolTokenInputOwner", poolTokenInputOwner.address)
    ],
    [
      LToken.new(),
      LToken.new("erc20Token", erc20Token),
      LToken.new("erc1155Token", erc1155Token, [1, 2]),
      LToken.new("erc721Token", erc721Token, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      LToken.new("erc721Token2", erc721Token2, [101, 102, 103, 104, 105])
    ],
    async function() {

      // setTimeout(function(){
      await engine.claim(taskId, args, roundList);
      // },6000)

    },
    "claim",
    ["diff"]
  );

};

let revoke = async function(taskId: BigNumberish) {

  await Log.monitor(hubChain,
    [
      LUser.new("owner", owner.address),
      LUser.new("user", user.address),
      LUser.new("engine", engine.address),
      LUser.new("destroy", MINT_DESTROY_ADDRESS),
      LUser.new("poolToken", poolToken.address),
      LUser.new("poolTokenInput", engine.poolTokenInput.address),
      LUser.new("poolTokenInputOwner", poolTokenInputOwner.address)
    ],
    [
      LToken.new(),
      LToken.new("erc20Token", erc20Token),
      LToken.new("erc1155Token", erc1155Token, [1, 2]),
      LToken.new("erc721Token", erc721Token, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      LToken.new("erc721Token2", erc721Token2, [101, 102, 103, 104, 105])
    ],
    async function() {

      // setTimeout(function(){
      await engine.revoke(taskId);
      // },6000)

    },
    "revoke",
    ["diff"]
  );

};

let loadERC = async function(chainId: number) {
  poolTokenInputOwner = <poolToken>await Contract.getByDeployment(chainId, "PoolToken", owner, {
    name: "poolTokenInputOwner",
    folder: folder,
    saveName: "inputOwner"
  });
  poolTokenInputUserA = <poolToken>await Contract.getByDeployment(chainId, "PoolToken", user, {
    name: "poolTokenInputUserA",
    folder: folder,
    saveName: "inputUserA"
  });
  poolToken = <poolToken>await Contract.getByDeployment(chainId, "PoolToken", owner, {
    name: "PoolToken",
    folder: folder,
    saveName: ""
  });
  erc20Token = <ERC20FixedSupplyCap>await Contract.getByDeployment(chainId, "ERC20FixedSupplyCap", owner, {
    name: "erc20-token",
    folder: folder,
    saveName: "token-1"
  });
  erc1155Token = <ERC1155MinterSupply>await Contract.getByDeployment(chainId, "ERC1155MinterSupplyCap", owner, {
    name: "erc1155-token",
    folder: folder,
    saveName: "token-1"
  });
  erc721Token = <ERC721MinterPauserAutoId>await Contract.getByDeployment(chainId, "ERC721MinterPauserAutoIdCap", owner,
    { name: "erc721-token", folder: folder, saveName: "token-1" });
  erc721Token2 = <ERC721MinterPauserAutoId>await Contract.getByDeployment(chainId, "ERC721MinterPauserAutoIdCap", owner,
    { name: "erc721-token-2", folder: folder, saveName: "token-2" });

  erc721TokenCap = <ERC721MinterPauserAutoIdCap>await Contract.getByDeployment(chainId, "ERC721MinterPauserAutoIdCap", owner,
    { name: "erc721-token-Cap", folder: folder, saveName: "token-Cap" });
};

let deployERC = async function() {

  console.log("--------------------- deploy Engine Pool ---------------------------");

  let overrides = {
    gasLimit: 8000000
  };
  let proxyIntakeAdmin = <ProxyIntakeAdmin>await Contract.deploy("ProxyIntakeAdmin", owner, [overrides], {
    folder: folder,
    saveName: "PoolToken"
  });

  let poolTokenAllocationOwner = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", owner, [overrides], {
    folder: folder,
    saveName: "inputOwner"
  }, proxyIntakeAdmin.address, null, false);
  poolTokenInputOwner = <poolToken>await Contract.deployProxy("PoolToken", owner, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationOwner.address, "PoolToken", "PT", overrides], {
    folder: folder,
    saveName: "inputOwner"
  }, proxyIntakeAdmin.address);

  let poolTokenAllocationA = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", owner, [overrides], {
    folder: folder,
    saveName: "inputUserA"
  }, proxyIntakeAdmin.address, null, false);
  poolTokenInputUserA = <poolToken>await Contract.deployProxy("PoolToken", owner, [FULL_POOL_TOKEN_ROLES, poolTokenAllocationA.address, "PoolToken", "PT", overrides], {
    folder: folder,
    saveName: "inputUserA"
  }, proxyIntakeAdmin.address);

  let poolTokenAllocation = <PoolTokenAllocation>await Contract.deployProxy("PoolTokenAllocation", owner, [overrides], {
    folder: folder,
    saveName: "inputUserA"
  }, proxyIntakeAdmin.address, null, false);
  poolToken = <poolToken>await Contract.deployProxy("PoolToken", owner, [FULL_POOL_TOKEN_ROLES, poolTokenAllocation.address, "PoolToken", "PT", overrides], {
    folder: folder,
    saveName: "inputUserA"
  }, proxyIntakeAdmin.address);

  await poolTokenInputOwner.grantRole(TRANSFER_ROLE, engine.address, overrides);
  await poolToken.grantRole(TRANSFER_ROLE, engine.address, overrides);

  console.log("------admin role", await poolToken.DEFAULT_ADMIN_ROLE());

  console.log("--------------------- deploy ERC ---------------------------");

  erc20Token = <ERC20FixedSupplyCap>await Contract.deploy("ERC20FixedSupplyCap", owner, [
      "in20", "in20",
      ethers.utils.parseEther("100000000"),
      ethers.utils.parseEther("10000000000"),
      owner.address,
      engine.poolTokenMint.address,
      overrides],
    { name: "erc20-token", folder: folder, saveName: "token-1" });

  await erc20Token.transfer(user.address, E18(1000000));
  await erc20Token.transfer(owner.address, E18(1000000));
  await erc20Token.transfer(poolTokenInputOwner.address, E18(1000000));
  await erc20Token.transfer(poolToken.address, E18(1000000));


  erc20Token2 = <ERC20FixedSupplyCap>await Contract.deploy("ERC20FixedSupplyCap", owner, [
      "in20", "in20",
      ethers.utils.parseEther("100000000"),
      ethers.utils.parseEther("10000000000"),
      owner.address,
      engine.poolTokenMint.address,
      overrides],
    { name: "erc20-token", folder: folder, saveName: "token-1" });

  await erc20Token2.transfer(user.address, E18(1000000));
  await erc20Token2.transfer(owner.address, E18(1000000));
  await erc20Token2.transfer(poolTokenInputOwner.address, E18(1000000));
  await erc20Token2.transfer(poolToken.address, E18(1000000));


  erc1155Token = <ERC1155MinterSupplyCap>await Contract.deploy("ERC1155MinterSupplyCap", owner, ["0x", engine.poolTokenMint.address, overrides],
    { name: "erc1155-token", folder: folder, saveName: "token-1" });

  console.log("-------10");
  await erc1155Token.addCap(BN(1), E18(100000));
  await erc1155Token.addCap(BN(2), E18(100000));
  await erc1155Token.mint(user.address, BN(1), E18(5000), "0x");
  await erc1155Token.mint(owner.address, BN(1), E18(5000), "0x");
  await erc1155Token.mint(owner.address, BN(2), E18(5000), "0x");
  console.log("-------14");
  await erc1155Token.mint(user.address, BN(2), E18(5000), "0x");
  console.log("-------15");
  console.log("-------0");
  await erc1155Token.connect(user).setApprovalForAll(engine.address, true);

  console.log("-------1");
  await erc1155Token.safeTransferFrom(owner.address, poolToken.address, BN(2), E18(3000), "0x");
  console.log("-------2");

  console.log("-------3");

  erc721Token = <ERC721MinterPauserAutoIdCap>await Contract.deploy("ERC721MinterPauserAutoIdCap", owner,
    ["ERC721", "ERC721", "", 1000000, engine.poolTokenMint.address, overrides],
    { name: "erc721-token", folder: folder, saveName: "token-1" });

  erc721Token2 = <ERC721MinterPauserAutoIdCap>await Contract.deploy("ERC721MinterPauserAutoIdCap", owner,
    ["ERC721-2", "ERC721-2", "", 1000000, engine.poolTokenMint.address, overrides],
    { name: "erc721-token-2", folder: folder, saveName: "token-2" });

  erc721TokenCap = <ERC721MinterPauserAutoIdCap>await Contract.deploy("ERC721MinterPauserAutoIdCap", owner,
    ["ERC721-Cap", "ERC721-Cap", "", 0, engine.poolTokenMint.address, overrides],
    { name: "erc721-token-Cap", folder: folder, saveName: "token-Cap" });

  await erc721Token.claim(1, owner.address);
  await erc721Token.claim(2, owner.address);
  await erc721Token.claim(3, owner.address);

  await hubChain.balance(owner.address, { name: "owner" });

  console.log("----erc20 user balance : ", utils.formatEther(await erc20Token.balanceOf(user.address)));
  console.log("----erc1155 user id-1 : ", utils.formatEther(await erc1155Token.balanceOf(user.address, BN(1))));

  const MINTER_ROLE: BytesLike = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));//"0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

  await erc20Token.grantRole(MINTER_ROLE, engine.address);
  await erc20Token2.grantRole(MINTER_ROLE, engine.address);
  // await erc1155Token.grantRole(MINTER_ROLE,engine.address);
  await erc721Token.grantRole(MINTER_ROLE, engine.address);
  await erc721Token2.grantRole(MINTER_ROLE, engine.address);


  await erc20Token.grantRole(MINTER_ROLE, engine.poolTokenMint.address);
  await erc20Token2.grantRole(MINTER_ROLE, engine.poolTokenMint.address);
  await erc1155Token.grantRole(MINTER_ROLE, engine.poolTokenMint.address);
  await erc721Token.grantRole(MINTER_ROLE, engine.poolTokenMint.address);
  await erc721Token2.grantRole(MINTER_ROLE, engine.poolTokenMint.address);


  await erc20Token.grantRole(MINTER_ROLE, poolTokenInputOwner.address);
  await erc20Token2.grantRole(MINTER_ROLE, poolTokenInputOwner.address);
  await erc1155Token.grantRole(MINTER_ROLE, poolTokenInputOwner.address);
  await erc721Token.grantRole(MINTER_ROLE, poolTokenInputOwner.address);
  await erc721Token2.grantRole(MINTER_ROLE, poolTokenInputOwner.address);


  // await erc721TokenCap.grantRole(MINTER_ROLE,engine.poolTokenMint.address);


  await engine.regDeployer(owner.address, BN(erc20Token.deployTransaction.nonce));
  await engine.regDeployer(owner.address, BN(erc20Token2.deployTransaction.nonce));
  await engine.regDeployer(owner.address, BN(erc1155Token.deployTransaction.nonce));
  await engine.regDeployer(owner.address, erc721Token.deployTransaction.nonce);
  await engine.regDeployer(owner.address, erc721Token2.deployTransaction.nonce);
  await engine.regDeployer(owner.address, erc721TokenCap.deployTransaction.nonce);


  // let tokenContract = await chainHub.TokenUtil.getTokenContract("",owner,erc1155Token.address,{name:"token"});
  // let i = 0;

  await Log.monitor(hubChain,
    [
      LUser.new("owner", owner.address),
      LUser.new("poolToken", poolToken.address)
    ],
    [
      LToken.new("erc721Token2", erc721Token2, [101, 102, 103, 104, 105, 106]),
      LToken.new("erc721TokenCap", erc721TokenCap, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    ],
    async function() {

      await erc721Token2.claim(BN(101), poolToken.address);
      // await erc721Token2.claim(BN(102),poolToken.address);
      // await erc721Token2.claim(BN(103),poolToken.address);
      // await erc721Token2.claim(BN(104),poolToken.address);
      // await erc721Token2.claim(BN(105),poolToken.address);
      // await erc721Token2.claim(BN(106),poolToken.address);


      await erc721TokenCap.mint(owner.address);
      await erc721TokenCap.mintBatch(owner.address, BN(2), overrides);
    },
    "mintToken",
    ["diff"]
  );

  // await erc20Token.connect(owner).approve(engine.address,E18(100000));

};


