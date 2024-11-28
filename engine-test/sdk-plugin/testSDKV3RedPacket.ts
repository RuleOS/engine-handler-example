// @ts-nocheck
import {ethers} from "hardhat";
import {
    ERC1155MinterSupply,
    ERC1155MinterSupplyCap,
    ERC20FixedSupplyCap,
    ERC721MinterPauserAutoId,
    ERC721MinterPauserAutoIdCap,
    PoolToken, ProxyIntakeAdmin
} from "../../typechain";
import {Contract} from "../../src/chain/contract";
import * as chainHub from "@ruleos/chain-hub";
import {Log, LToken, LUser} from "@ruleos/chain-hub";
import {Signer} from "crypto";
import networkConfig from "../../networks";
import { BigNumberish, BytesLike, utils} from "ethers";

import {
    Cluster,
    DURATION_TYPE,
    Engine,
    FULL_POOL_TOKEN_ROLES,
    TRANSFER_ROLE,
    GroupSlot,
    MINT_DESTROY_ADDRESS,
    Rule,
    RULE_IO_TYPE,
    RuleSlot,
    Token,

    TokenSlot,
    TokenTemplate as TT,
    RLP
} from "../../src/sdk-v3";
import {deployEngine} from "../../src/sdk-v3/Deploy";

let rlp = require("rlp");

import {TRedPacketHandler} from "../../src/sdk-v3/handler/TRedPacketHandler";

let BN = chainHub.Util.BN;
let E18 = chainHub.Util.E18;

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
let owner, user, admin, user1, user2, user3, user4, user5: Signer;

let hubChain: chainHub.Chain, hubContract: chainHub.Contract;

let folder = "2023-06-30";
let REDPACKET_HANDLER = "RedPacketHandler"

setTimeout(function () {
    test();
}, 50);


enum IN_BRANCH {
    INPUT_BRANCH = 1,
    GAS_BRANCH_OPEN,
    GAS_BRANCH_CLAIM_REMAIN
}

enum OUT_BRANCH {
    OUTPUT_NOOUTPUT_BRANCH = 100,
    OUTPUT_CLAIM_BRANCH,

}

const CMD_RED_PACKET_NEW = 0;
const CMD_RED_PACKET_OPEN = 1;
const CMD_RED_PACKET_CLAIM_REMAIN = 2;




let test = async function () {
   

    [owner, user, admin, user1, user2, user3, user4, user5] = await ethers.getSigners();
    var url = networkConfig.networks[networkConfig.defaultNetwork].url;
    var chainId = networkConfig.networks[networkConfig.defaultNetwork].chainId;
    hubChain = new chainHub.Chain(url, await ethers.getSigners());
    hubContract = new chainHub.Contract(url);

    let contracts = await deployEngine(owner,folder);

    engine = await Engine.create(owner, contracts);
    let overrides = { gasLimit: 10000000,gasPrice: 1500000000};

    await engine.handler.loadAll([
        await new TRedPacketHandler(owner, engine).deploy(folder)
    ]);
    console.log("------ curBlockTimestamp", await engine.hubChain.getLatestBlockTimestamp(owner));
    await deployERC();

    await testExpert100RedPacketRandom()
   
}




let testExpert100RedPacketFair= async function () {
    let tokenSlot1: TokenSlot = new TokenSlot(TT.newERC20(erc20Token.address, E18(10000), E18(100000)));
    tokenSlot1.addBranchTimestamp(poolToken.address, 1, RULE_IO_TYPE.POOL_TOKEN_TRANSFER);
    let groupSlotIn1: GroupSlot = new GroupSlot(poolTokenInputOwner.address, IN_BRANCH.INPUT_BRANCH,);
    groupSlotIn1.addTokenSlot(tokenSlot1);

    let groupSlotIn2: GroupSlot = new GroupSlot(poolTokenInputOwner.address, IN_BRANCH.GAS_BRANCH_OPEN);
    groupSlotIn2.addArgs(engine.HA(REDPACKET_HANDLER), []);

    let groupSlotIn3: GroupSlot = new GroupSlot(poolTokenInputOwner.address, IN_BRANCH.GAS_BRANCH_CLAIM_REMAIN);
    groupSlotIn3.addArgs(engine.HA(REDPACKET_HANDLER), []);

    await erc20Token.connect(owner).mint(user1.address, E18(1000000))
    await erc20Token.connect(owner).approve(engine.address, E18(100000));


    let groupSlotOut1: GroupSlot = new GroupSlot(poolTokenInputOwner.address, OUT_BRANCH.OUTPUT_NOOUTPUT_BRANCH);
    groupSlotOut1.addArgs(engine.HA(REDPACKET_HANDLER), []);

    let groupSlotOut2: GroupSlot = new GroupSlot(poolTokenInputOwner.address, OUT_BRANCH.OUTPUT_CLAIM_BRANCH,);
    groupSlotOut2.addTokenSlot(tokenSlot1);
    groupSlotOut2.addArgs(engine.HA(REDPACKET_HANDLER), []);


    let cluster: Cluster = new Cluster(owner.address, owner.address, "", 0, 0);
    cluster.addRuleSlot(new RuleSlot(0, [groupSlotIn1, groupSlotIn2,groupSlotIn3]));
    cluster.addRuleSlot(new RuleSlot(1, [groupSlotOut1, groupSlotOut2]));

    let rule: Rule = new Rule(0, 1, 100, DURATION_TYPE.TIMESTAMP, 0, 0);

    rule.addProcessHandler(engine.clusterHandlerArea.address, engine.HA(REDPACKET_HANDLER), [RLP.to("claimAmountMin", 10)]);
    cluster.addRule(rule);

    await engine.checkCluster(cluster, true);


    let eTask = await engine.regRule(cluster);
    let clusterId = eTask.clusterId;


    let e20Token = Token.newERC20(erc20Token.address, E18(10000));


    let inTokenListInput: Token[] = [
        e20Token
    ]

    let inTokenListForClaim: Token[] = []

    await erc20Token.connect(owner).approve(engine.address, E18(100000));

    let multiple = 10000;

    engine.owner = owner
    let eventTask = await engine.input(clusterId, 0, 1, IN_BRANCH.INPUT_BRANCH, 0, multiple, inTokenListInput, [
        [engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_NEW), RLP.to("count", 5), RLP.to("lastTime", 150), RLP.to("mode", 0)],
    ],);
    engine.owner = user1
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    engine.owner = user2
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    engine.owner = user3
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    engine.owner = user4
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    engine.owner = user5

    await sleep(130000)

    engine.owner = owner
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_CLAIM_REMAIN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_CLAIM_REMAIN)]])

    let hState = await engine.HS(REDPACKET_HANDLER, {
        clusterId: clusterId,
        ruleSlotIndexInput: 0,
        ruleSlotIndexOutput: 1,
        branch: 0,
        taskId: eventTask.taskId,
        cmd: 0,
        args:  [RLP.to("packetId",eventTask.taskId)]
    }, true)
    console.log("success")
}

let testExpert100RedPacketRandom= async function () {
    //input branch 1,create a redPacket
    let tokenSlot1: TokenSlot = new TokenSlot(TT.newERC20(erc20Token.address, E18(10000), E18(100000)));
    tokenSlot1.addBranchTimestamp(poolToken.address, 1, RULE_IO_TYPE.POOL_TOKEN_TRANSFER);
    let groupSlotIn1: GroupSlot = new GroupSlot(poolTokenInputOwner.address, IN_BRANCH.INPUT_BRANCH,);
    groupSlotIn1.addTokenSlot(tokenSlot1);

    //input branch 2,open a redPacket
    let groupSlotIn2: GroupSlot = new GroupSlot(poolTokenInputOwner.address, IN_BRANCH.GAS_BRANCH_OPEN);
    groupSlotIn2.addArgs(engine.HA(REDPACKET_HANDLER), []);

    //input branch 3,if a redPacket expires without being fully claimed, the sender can reclaim the remaining amount.
    let groupSlotIn3: GroupSlot = new GroupSlot(poolTokenInputOwner.address, IN_BRANCH.GAS_BRANCH_CLAIM_REMAIN);
    groupSlotIn3.addArgs(engine.HA(REDPACKET_HANDLER), []);


    let groupSlotOut1: GroupSlot = new GroupSlot(poolTokenInputOwner.address, OUT_BRANCH.OUTPUT_NOOUTPUT_BRANCH);
    groupSlotOut1.addArgs(engine.HA(REDPACKET_HANDLER), []);

    let groupSlotOut2: GroupSlot = new GroupSlot(poolTokenInputOwner.address, OUT_BRANCH.OUTPUT_CLAIM_BRANCH,);
    groupSlotOut2.addTokenSlot(tokenSlot1);
    groupSlotOut2.addArgs(engine.HA(REDPACKET_HANDLER), []);


    let cluster: Cluster = new Cluster(owner.address, owner.address, "", 0, 0);
    cluster.addRuleSlot(new RuleSlot(0, [groupSlotIn1, groupSlotIn2,groupSlotIn3]));
    cluster.addRuleSlot(new RuleSlot(1, [groupSlotOut1, groupSlotOut2]));

    let rule: Rule = new Rule(0, 1, 100, DURATION_TYPE.TIMESTAMP, 0, 0);

    rule.addProcessHandler(engine.clusterHandlerArea.address, engine.HA(REDPACKET_HANDLER), [RLP.to("claimAmountMin", 10)]);
    cluster.addRule(rule);

    await engine.checkCluster(cluster, true);


    let eTask = await engine.regRule(cluster);
    let clusterId = eTask.clusterId;


    let e20Token = Token.newERC20(erc20Token.address, E18(10000));


    let inTokenListInput: Token[] = [
        e20Token
    ]

    let inTokenListForClaim: Token[] = []

    await erc20Token.connect(owner).approve(engine.address, E18(100000));

    let multiple = 10000;
    //create a redPacket
    engine.owner = owner
    let eventTask = await engine.input(clusterId, 0, 1, IN_BRANCH.INPUT_BRANCH, 0, multiple, inTokenListInput, [
        [engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_NEW), RLP.to("count", 5), RLP.to("lastTime", 150), RLP.to("mode", 1)],
    ],);
    //user1 claim
    engine.owner = user1
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    //user2 claim
    engine.owner = user2
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    //user3 claim
    engine.owner = user3
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    //user4 claim
    engine.owner = user4
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_OPEN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_OPEN)]]);
    //the redPacket expires
    await sleep(130000)

    //creator reclaim
    engine.owner = owner
    await input(clusterId, 0, 1, IN_BRANCH.GAS_BRANCH_CLAIM_REMAIN, eventTask.taskId, multiple, inTokenListForClaim, [[engine.HA(REDPACKET_HANDLER), RLP.to("cmd", CMD_RED_PACKET_CLAIM_REMAIN)]])

    let hState = await engine.HS(REDPACKET_HANDLER, {
        clusterId: clusterId,
        ruleSlotIndexInput: 0,
        ruleSlotIndexOutput: 1,
        branch: 0,
        taskId: eventTask.taskId,
        cmd: 0,
        args:  [RLP.to("packetId",eventTask.taskId)]
    }, true)
    console.log("success")
}


let sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

let input = async function (clusterId: BigNumberish,
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
            LUser.new("user1", user1.address),
            LUser.new("user2", user2.address),
            LUser.new("user3", user3.address),
            LUser.new("user4", user4.address),
            LUser.new("user5", user5.address),

            LUser.new("engine", engine.address),
            LUser.new("destroy", MINT_DESTROY_ADDRESS),
            LUser.new("poolToken", poolToken.address),
            LUser.new("poolTokenInput", engine.poolTokenInput.address),
            LUser.new("poolTokenInputOwner", poolTokenInputOwner.address),
        ],
        [
            LToken.new(),
            LToken.new("erc20Token", erc20Token),
            LToken.new("erc1155Token", erc1155Token, [1, 2]),
            LToken.new("erc721Token", erc721Token, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ],
        async function () {
            eventTask = await engine.input(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput, groupInputBranch, taskId, multiple, inTokenList, args);
        },
        "inputToken",
        ["diff"]
    );
    return eventTask;
}

let execute = async function (taskId, args: [], roundList: BigNumberish[] = [], value: BigNumberish = 0) {

    let eventTask;
    await Log.monitor(hubChain,
        [
            LUser.new("owner", owner.address),
            LUser.new("user1", user1.address),
            LUser.new("user2", user2.address),
            LUser.new("user3", user3.address),
            LUser.new("user4", user4.address),
            LUser.new("user5", user5.address),

            LUser.new("engine", engine.address),
            LUser.new("destroy", MINT_DESTROY_ADDRESS),
            LUser.new("poolToken", poolToken.address),
            LUser.new("poolTokenInput", engine.poolTokenInput.address),
            LUser.new("poolTokenInputOwner", poolTokenInputOwner.address),
        ],
        [
            LToken.new(),
            LToken.new("erc20Token", erc20Token),
            LToken.new("erc20Token2", erc20Token2),
            LToken.new("erc1155Token", erc1155Token, [1, 2]),
            LToken.new("erc721Token", erc721Token, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ],
        async function () {
            eventTask = await engine.execute(taskId, args, roundList, value);
        },
        "execute",
        ["diff"]
    );

    return eventTask;
}

let claim = async function (taskId: BigNumberish, roundList: BigNumberish[]) {

    await Log.monitor(hubChain,
        [
            LUser.new("owner", owner.address),
            LUser.new("user", user.address),
            LUser.new("user1", user1.address),
            LUser.new("user2", user2.address),
            LUser.new("user3", user3.address),
            LUser.new("user4", user4.address),
            LUser.new("user5", user5.address),

            LUser.new("engine", engine.address),
            LUser.new("destroy", MINT_DESTROY_ADDRESS),
            LUser.new("poolToken", poolToken.address),
            LUser.new("poolTokenInput", engine.poolTokenInput.address),
            LUser.new("poolTokenInputOwner", poolTokenInputOwner.address),
        ],
        [
            LToken.new(),
            LToken.new("erc20Token", erc20Token),
            LToken.new("erc20Token2", erc20Token2),

        ],
        async function () {

            await engine.claim(taskId, roundList);

        },
        "claim",
        ["diff"]
    );

}

let revoke = async function (taskId: BigNumberish) {

    await Log.monitor(hubChain,
        [
            LUser.new("owner", owner.address),
            LUser.new("user", user.address),
            LUser.new("engine", engine.address),
            LUser.new("destroy", MINT_DESTROY_ADDRESS),
            LUser.new("poolToken", poolToken.address),
            LUser.new("poolTokenInput", engine.poolTokenInput.address),
            LUser.new("poolTokenInputOwner", poolTokenInputOwner.address),
        ],
        [
            LToken.new(),
            LToken.new("erc20Token", erc20Token),
            LToken.new("erc1155Token", erc1155Token, [1, 2]),
            LToken.new("erc721Token", erc721Token, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            LToken.new("erc721Token2", erc721Token2, [101, 102, 103, 104, 105]),
        ],
        async function () {

            // setTimeout(function(){
            await engine.revoke(taskId);
            // },6000)

        },
        "revoke",
        ["diff"]
    );

}

let loadERC = async function (chainId: number) {
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
        {name: "erc721-token", folder: folder, saveName: "token-1"});
    erc721Token2 = <ERC721MinterPauserAutoId>await Contract.getByDeployment(chainId, "ERC721MinterPauserAutoIdCap", owner,
        {name: "erc721-token-2", folder: folder, saveName: "token-2"});

    erc721TokenCap = <ERC721MinterPauserAutoIdCap>await Contract.getByDeployment(chainId, "ERC721MinterPauserAutoIdCap", owner,
        {name: "erc721-token-Cap", folder: folder, saveName: "token-Cap"});
}

let deployERC = async function () {

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
        {name: "erc20-token", folder: folder, saveName: "token-1"});

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
        {name: "erc20-token", folder: folder, saveName: "token-1"});

    await erc20Token2.transfer(user.address, E18(1000000));
    await erc20Token2.transfer(owner.address, E18(1000000));
    await erc20Token2.transfer(poolTokenInputOwner.address, E18(1000000));
    await erc20Token2.transfer(poolToken.address, E18(1000000));


    erc1155Token = <ERC1155MinterSupplyCap>await Contract.deploy("ERC1155MinterSupplyCap", owner, ["0x", engine.poolTokenMint.address, overrides],
        {name: "erc1155-token", folder: folder, saveName: "token-1"});

    console.log("-------10")
    await erc1155Token.addCap(BN(1), E18(100000));
    await erc1155Token.addCap(BN(2), E18(100000));
    await erc1155Token.mint(user.address, BN(1), E18(5000), "0x");
    await erc1155Token.mint(owner.address, BN(1), E18(5000), "0x");
    await erc1155Token.mint(poolToken.address, BN(1), E18(5000), "0x");

    await erc1155Token.mint(owner.address, BN(2), E18(5000), "0x");
    console.log("-------14")
    await erc1155Token.mint(user.address, BN(2), E18(5000), "0x");
    console.log("-------15")
    console.log("-------0")
    await erc1155Token.connect(user).setApprovalForAll(engine.address, true);

    console.log("-------1")
    await erc1155Token.safeTransferFrom(owner.address, poolToken.address, BN(2), E18(3000), "0x");
    console.log("-------2")

    console.log("-------3")


    erc721Token = <ERC721MinterPauserAutoIdCap>await Contract.deploy("ERC721MinterPauserAutoIdCap", owner,
        ["ERC721", "ERC721", "", 1000000, engine.poolTokenMint.address, overrides],
        {name: "erc721-token", folder: folder, saveName: "token-1"});

    erc721Token2 = <ERC721MinterPauserAutoIdCap>await Contract.deploy("ERC721MinterPauserAutoIdCap", owner,
        ["ERC721-2", "ERC721-2", "", 1000000, engine.poolTokenMint.address, overrides],
        {name: "erc721-token-2", folder: folder, saveName: "token-2"});

    erc721TokenCap = <ERC721MinterPauserAutoIdCap>await Contract.deploy("ERC721MinterPauserAutoIdCap", owner,
        ["ERC721-Cap", "ERC721-Cap", "", 0, engine.poolTokenMint.address, overrides],
        {name: "erc721-token-Cap", folder: folder, saveName: "token-Cap"});

    await erc721Token.claim(1, owner.address);
    await erc721Token.claim(2, owner.address);
    await erc721Token.claim(3, owner.address);

    await hubChain.balance(owner.address, {name: "owner"});

    console.log("----erc20 user balance : ", utils.formatEther(await erc20Token.balanceOf(user.address)));
    console.log("----erc1155 user id-1 : ", utils.formatEther(await erc1155Token.balanceOf(user.address, BN(1))));

    const MINTER_ROLE: BytesLike = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));
    await erc20Token.grantRole(MINTER_ROLE, engine.address);
    await erc20Token2.grantRole(MINTER_ROLE, engine.address);
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

    await engine.regDeployer(owner.address, BN(erc20Token.deployTransaction.nonce));
    await engine.regDeployer(owner.address, BN(erc20Token2.deployTransaction.nonce));
    await engine.regDeployer(owner.address, BN(erc1155Token.deployTransaction.nonce));
    await engine.regDeployer(owner.address, erc721Token.deployTransaction.nonce);
    await engine.regDeployer(owner.address, erc721Token2.deployTransaction.nonce);
    await engine.regDeployer(owner.address, erc721TokenCap.deployTransaction.nonce);


    await Log.monitor(hubChain,
        [
            LUser.new("owner", owner.address),
            LUser.new("poolToken", poolToken.address),
        ],
        [
            LToken.new("erc721Token2", erc721Token2, [101, 102, 103, 104, 105, 106]),
            LToken.new("erc721TokenCap", erc721TokenCap, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
        ],
        async function () {

            await erc721Token2.claim(BN(101), poolToken.address);
            await erc721TokenCap.mint(owner.address);
            await erc721TokenCap.mintBatch(owner.address, BN(2), overrides);
        },
        "mintToken",
        ["diff"]
    );


}




