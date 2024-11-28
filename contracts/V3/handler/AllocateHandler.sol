// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/IVersion.sol";
import "../interface/IHandler.sol";
import "../interface/IClusterArea.sol";
import "../interface/IClusterRuleArea.sol";
import "../rlp/DecodeHelper.sol";
import "../rlp/EncodeHelper.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../util/Gas.sol";
import "../util/RLPUtil.sol";
import "../RandomGenerator.sol";
import "./AllocateHandlerLib.sol";
import "../struct/TokenHandler.sol";
import "../struct/Task.sol";

contract AllocateHandler is Initializable, IHandler, OwnableUpgradeable, Gas {

    using RLPDecode for bytes;
    using RLPDecode for RLPDecode.RLPItem;

    using Counters for Counters.Counter;
    Counters.Counter _clusterId;
    using Rule for Cluster.Cluster;
    using Token for Token.TokenTemplate;
    using TokenHandler for TokenHandler.TokenBranch;
    using Task for Task.Task;

    mapping(string => address) engineArea;

    IOBranch[] ioBranches;
    address public randomGenerator;

    //clusterArea + clusterId + ruleSlotIndexInput + ruleSlotIndexOutput  =>
    mapping(bytes32 => uint128) public ruleConfig;

    //clusterArea + clusterId + ruleSlotIndex + groupSlot.branch => args
    mapping(bytes32 => bytes) public ruleGroupSlotArgs;

    //engine+clusterArea+clusterId+taskId+address+round =>
    mapping(bytes32 => TokenHandler.TokenBranch) engineClusterTaskCallerRoundTokenBranch;

    //engine+clusterArea+clusterId+taskId+Round =>
    mapping(bytes32 => address[]) engineClusterTaskRoundInputAddressList;
    mapping(bytes32 => address[]) engineClusterTaskRoundOutputAddressList;

    modifier onlyEngineArea(string memory areaName) {
//        console.log("-----onlyEngineArea %s %s %s",areaName,msg.sender,engineArea[areaName]);
        require(msg.sender == engineArea[areaName], "sender not match area address");
        _;
    }

    function getState(Handler.StateParams memory params) public view override returns (bytes[] memory){

        bytes32 clusterRuleHash = keccak256(abi.encode(IClusterArea(params.clusterArea).getClusterRuleAreaHandler(), params.clusterId, params.ruleSlotIndexInput, params.ruleSlotIndexOutput));
        uint128 ruleConfig = ruleConfig[clusterRuleHash];

        return AllocateHandlerLib.getAllocateState(params, ruleConfig);
    }

    function version() public pure override returns (uint){
        return 1;
    }

    function cname() public pure override returns (string memory){
        return "Allocate";
    }

    function initialize() public initializer {
        __Ownable_init();
    }

    function setEngineAreaList(address[] memory engineAreaList) public override onlyOwner {
        for (uint i; i < engineAreaList.length; ++i) {
            engineArea[IVersion(engineAreaList[i]).cname()] = engineAreaList[i];
        }

        randomGenerator = engineArea[ENGINE_RANDOM_GENERATOR];
    }

    function getEngineAreaList(string[] memory areaNameList) public override returns (address[] memory){

        address[] memory areaAddressList = new address[](areaNameList.length);

        for (uint i = 0; i < areaAddressList.length; ++i) {
            areaAddressList[i] = engineArea[areaNameList[i]];
        }

        return areaAddressList;
    }


    function getIOBranches() external pure override returns (IOBranch[] memory branches){
        return branches;
    }

    //todo must restrict to clusterRuleAreaHandler to call this function
    function regRule(uint32 clusterId, Cluster.Cluster memory cluster) public override onlyEngineArea(ENGINE_CLUSTER_RULE_AREA_HANDLER) {

    }

    function regRuleGroupSlotArgs(uint32 clusterId, uint16 ruleSlotIndex, uint8 branch, bytes memory args) public override onlyEngineArea(ENGINE_CLUSTER_RULE_AREA) {

        //msg.sender = clusterRuleArea
        bytes32 ruleSlotIndexBranchHash = keccak256(abi.encode(msg.sender, clusterId, ruleSlotIndex, branch));

        console.log("-----------Allocate regRuleGroupSlotArgs branch", branch);
        ruleGroupSlotArgs[ruleSlotIndexBranchHash] = args;
    }

    function getRuleGroupSlotArgs(uint32 clusterId, uint16 ruleSlotIndex, uint8 branch) public view override returns (bytes memory){

        bytes32 ruleSlotIndexBranchHash = keccak256(abi.encode(msg.sender, clusterId, ruleSlotIndex, branch));

        bytes memory args = ruleGroupSlotArgs[ruleSlotIndexBranchHash];

        return args;
    }

    function updateArgs(uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput, uint8 cmd, bytes memory args) public override onlyEngineArea(ENGINE_CLUSTER_RULE_AREA_HANDLER) returns (bool) {

        if (cmd == HANDLER_ARGS_REG || cmd == HANDLER_ARGS_UPDATE) {

            RLPDecode.RLPItem[] memory argsList = RLPUtil.fromHandler(args);

            uint8 execute100Switch = uint8(RLPUtil.fromHandlerUint(args, 0));

            console.log("------- Allocate _updateArgs execute100Switch", execute100Switch);

            uint8 trialMaxCount = 3;
            if (argsList.length > 1) {
                trialMaxCount = uint8(RLPUtil.fromHandlerUint(args, 1));
            }
            RandomGenerator(randomGenerator).updateRandomArgs(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput, trialMaxCount);

            console.log("------- Allocate _updateArgs TrialMaxCount", trialMaxCount);

            //msg.sender = clusterRuleAreaHandler
            bytes32 clusterRuleHash = keccak256(abi.encode(msg.sender, clusterId, ruleSlotIndexInput, ruleSlotIndexOutput));
            uint128 config = ruleConfig[clusterRuleHash];

            config = uint128(Bit.bit(config, execute100Switch, BIT_RULE_EXECUTE_100_SWITCH, BIT_RULE_EXECUTE_100_SWITCH_SHIFT));

            ruleConfig[clusterRuleHash] = config;

        }

        return true;
    }

    function process(
        Handler.Process memory param,
        Handler.Result memory preResult
    ) public override onlyEngineArea(ENGINE) returns (Handler.Result memory){
        gasBegin();

        preResult.handler = address(this);

//        console.log("-------handler process",address(this));

//        uint8 offset = param.task.getHandlerOffset();
//        console.log("-------handler process 0", param.task.getHandlerArg(offset,0).toUint());
//        console.log("-------handler process 1", param.task.getHandlerArg(offset,1).toUint());

        console.log("--- Allocate state %s", param.state);

        if (param.state == HANDLER_PROCESS_STATE_PRE) {

            preResult = processInput(param, preResult);
        }
        else if (param.state == HANDLER_PROCESS_STATE_EXECUTE) {
            //            preResult = processExecute(param,preResult);

//            uint8 offset = param.task.getHandlerOffset();
//            console.log("-------handler process 1", param.task.getHandlerArg(offset,1).toUint());

            RLPDecode.RLPItem[] memory rlpArgsList = param.task.getHandlerArgs();

            console.log("--- Allocate HANDLER_PROCESS_STATE_EXECUTE", rlpArgsList.length);

            if (rlpArgsList.length == 0 || rlpArgsList.length == 1) {
                console.log("--- Allocate first make random");
                if (RandomGenerator(randomGenerator).makeRandomBlock(param.task.clusterArea, param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput(), param.stateCounter, param.task.taskId, param.caller)) {
                    preResult.code = HANDLER_CODE_MAKE_RANDOM;
                } else {
                    preResult.msg = "make random exceed std times";
                    preResult.code = HANDLER_CODE_FAILURE;
                }

                return preResult;
            }


            uint8 cmd = uint8(param.task.getHandlerArg(rlpArgsList, 0).toUint());
            console.log("--- Allocate process cmd", cmd);

            if (cmd == HANDLER_CMD_MAKE_RANDOM) {
                console.log("--- Allocate cmd 100 make random");
                if (RandomGenerator(randomGenerator).makeRandomBlock(param.task.clusterArea, param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput(), param.stateCounter, param.task.taskId, param.caller)) {
                    preResult.code = HANDLER_CODE_MAKE_RANDOM;
                } else {
                    preResult.msg = "make random exceed std times";
                    preResult.code = HANDLER_CODE_FAILURE;
                }
                return preResult;
            }

            if (cmd == HANDLER_CMD_EXECUTE || cmd == HANDLER_CMD_EXECUTE_100) {
                console.log("--- Allocate EXECUTE cmd", cmd);
                preResult = processExecute(param, preResult, cmd);
                preResult.code = HANDLER_CODE_FINISH;
            }
        }

        return preResult;
    }

    function processInput(Handler.Process memory param, Handler.Result memory preResult) private returns (Handler.Result memory){

        return preResult;
    }

    function makeRandomList(Handler.Process memory param, uint8 cmd) internal returns (uint256[] memory randomList){
        uint256[] memory randomList = new uint256[](param.task.getGroupInputRound());

        for (uint r; r < param.task.getGroupInputRound(); ++r) {

            randomList[r] = 1;
            if (cmd == HANDLER_CMD_EXECUTE_100) {
                bytes32 clusterRuleHash = keccak256(abi.encode(IClusterArea(param.task.clusterArea).getClusterRuleAreaHandler(), param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput()));
                uint128 config = ruleConfig[clusterRuleHash];
                uint8 execute100Switch = uint8(Bit.bitValue(config, BIT_RULE_EXECUTE_100_SWITCH, BIT_RULE_EXECUTE_100_SWITCH_SHIFT));
                console.log("------Allocate execute100Switch", execute100Switch);
                if (execute100Switch == HANDLER_CMD_EXECUTE_100_ON) {
                    randomList[r] = 0;
                }
            }

            if (randomList[r] > 0) {
                uint256 random = RandomGenerator(randomGenerator).makeRandom(new bytes(r), param.task.clusterArea, param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput(), param.stateCounter, param.task.taskId, param.caller);

                require(random != HANDLER_RANDOM_BLOCK_PASSED_256, "allocate random has passed 256 block");
                require(random != HANDLER_RANDOM_BLOCK_NOT_REACH, "allocate random block not reach");
                randomList[r] = random % 10000;
            }

            console.log("--- Allocate random", randomList[r]);
        }

        return randomList;
    }

    function processBranchList(Handler.Process memory param, uint256[] memory randomList) internal returns (uint8[] memory){
        uint8[] memory outBranchList = IClusterRuleArea(IClusterArea(param.task.clusterArea).getClusterRuleArea()).getGroupSlotBranchList(param.task.clusterId, param.task.getRuleSlotIndexOutput());

        //        gas("--- Allocate --- 2");
        console.log("--- Allocate outBranchList.length", outBranchList.length);

        uint16[] memory rateList = new uint16[](param.task.getGroupInputRound());
        uint8[] memory branchList = new uint8[](param.task.getGroupInputRound());
        bool[] memory foundList = new bool[](param.task.getGroupInputRound());

        for (uint i; i < outBranchList.length; ++i) {
            for (uint r; r < param.task.getGroupInputRound(); ++r) {

                //                gas("--- Allocate --- 3");
                console.log("--------------- Allocate param.task.clusterArea", param.task.clusterArea);
                console.log("--------------- Allocate param.task.clusterId", param.task.clusterId);
                console.log("--------------- Allocate param.task.getRuleSlotIndexOutput()", param.task.getRuleSlotIndexOutput());
                console.log("--------------- Allocate param.outBranchList[i]", outBranchList[i]);


                bytes32 ruleSlotIndexBranchHash = keccak256(abi.encode(IClusterArea(param.task.clusterArea).getClusterRuleArea(), param.task.clusterId, param.task.getRuleSlotIndexOutput(), outBranchList[i]));

                bytes memory args = ruleGroupSlotArgs[ruleSlotIndexBranchHash];
                console.log("--------------- Allocate args", string(args));

                //                gas("--- Allocate --- 4");

                uint randomRate = RLPUtil.fromHandlerUint(args, 0);

                console.log("--------------- Allocate args randomRate", randomRate);

                //                gas("--- Allocate --- 5");
                rateList[r] += uint16(randomRate);
                if (rateList[r] >= randomList[r] && foundList[r] == false) {
                    branchList[r] = outBranchList[i];
                    foundList[r] = true;

                    console.log("--- Allocate rate", rateList[r]);
                    console.log("--- Allocate branch", branchList[r]);
                }
                gas("--- Allocate --- 6");
            }
        }

        console.log("--- Allocate process 2");

        return branchList;
    }

    function processExecute(Handler.Process memory param, Handler.Result memory preResult, uint8 cmd) private returns (Handler.Result memory){

        gas("--- Allocate --- 0");

        uint256[] memory randomList = makeRandomList(param, cmd);

        //        gas("--- Allocate --- 1");


        console.log("--- Allocate caller", param.caller);
        //        console.log("--- Allocate clusterArea",param.task.clusterArea);
        console.log("--- Allocate clusterId", param.task.clusterId);
        console.log("--- Allocate taskId", param.task.taskId);

        uint8[] memory branchList = processBranchList(param, randomList);

        //generate output branch token list

        for (uint16 round; round < branchList.length; ++round) {
            //to save gas
            //            gas("--- Allocate --- 7");

            TokenHandler.TokenBranchParams memory params = TokenHandler.makeParams();
            params.outBranch = branchList[round];
            params.inBranch = param.task.getGroupInputBranch();
            params.inBranchProcess = TokenHandler.TOKEN_HANDLER_IN_BRANCH_PROCESS_TRUE;
            params.random = randomList[round];
            params.multiple = param.task.getMultiple();

            TokenHandler.TokenBranch memory tokenBranch;
            tokenBranch.setParams(params);

            //            TokenHandler.TokenBranchParams memory params2 = tokenBranch.getParams();
            //            console.log("--- Allocate random",tokenBranch.getParams().random);

            bytes32 hash = Handler.makeEngineClusterTaskCallerRoundHash(msg.sender, param.task.clusterArea, param.task.clusterId, param.stateCounter, param.task.taskId, param.caller, round);

            engineClusterTaskCallerRoundTokenBranch[hash] = tokenBranch;

            //            gas("--- Allocate --- 8");
        }

        return preResult;
    }

    function getInputAddressRound(address engine, address clusterArea, uint32 clusterId, address stateCounter, uint32 taskId, uint16 round) public override view returns (address[] memory){
        bytes32 engineClusterTaskRoundHash = keccak256(abi.encode(engine, clusterArea, clusterId, stateCounter, taskId, round));
        return engineClusterTaskRoundInputAddressList[engineClusterTaskRoundHash];
    }

    function getOutputAddressRound(address engine, address clusterArea, uint32 clusterId, address stateCounter, uint32 taskId, uint16 round) public override view returns (address[] memory){
        bytes32 engineClusterTaskRoundHash = keccak256(abi.encode(engine, clusterArea, clusterId, stateCounter, taskId, round));
        return engineClusterTaskRoundOutputAddressList[engineClusterTaskRoundHash];
    }

    function getTokenBranch(
        address engine,
        address outAddress,
        address clusterArea,
        uint32 clusterId,
        address stateCounter,
        uint32 taskId,
        bytes memory args,
        uint16 round
    ) public view override returns (TokenHandler.TokenBranch memory){

        bytes32 hash = Handler.makeEngineClusterTaskCallerRoundHash(
            engine, clusterArea, clusterId, stateCounter, taskId, outAddress, round);

        console.log("----------getTokenBranch taskId", taskId);
        console.log("----------getTokenBranch args");
        console.logBytes(args);

        return engineClusterTaskCallerRoundTokenBranch[hash];
    }


    function getClaimIOAddressBranchToken(Claim memory claim) public override view returns (bool){

        bytes32 hash = Handler.makeEngineClusterTaskCallerRoundHash(
            claim.engine,
            claim.clusterArea,
            claim.clusterId, claim.stateCounter, claim.taskId,
            claim.claimer,
            claim.round);

        console.log("-------------- Allocate getClaimIOAddressBranchToken", claim.clusterId);

        TokenHandler.TokenBranch memory tokenBranch = engineClusterTaskCallerRoundTokenBranch[hash];

        //        console.log("-------------- Allocate getClaimIOAddressBranchToken InBranch",tokenBranch.getInBranch());

        bool claimed;

        if (claim.io == RULE_IO_INPUT) {
            claimed = tokenBranch.getClaimInput(uint8(claim.tokenSlotIndex));
        } else {
            claimed = tokenBranch.getClaimOutput(uint8(claim.tokenSlotIndex));
        }
        return claimed;
    }

    function claimIOAddressBranchToken(Claim memory claim) public override onlyEngineArea(ENGINE) returns (bool) {

        bytes32 hash = Handler.makeEngineClusterTaskCallerRoundHash(
            msg.sender,
            claim.clusterArea,
            claim.clusterId, claim.stateCounter, claim.taskId,
            claim.claimer,
            claim.round);

        //        console.log("--- Allocate claimIOAddressBranchToken engineClusterTaskHash",S.b2s(engineClusterTaskHash));

        console.log("--- Allocate tokenClaim round", claim.round);
        console.log("--- Allocate tokenClaim", claim.io == RULE_IO_INPUT ? "input" : "output");
        //        console.log("--- Allocate tokenClaim ioAddress",claim.ioAddress);
        //        console.log("--- Allocate tokenClaim clusterId",claim.clusterId);
        //        console.log("--- Allocate tokenClaim taskId",claim.taskId);
        //        console.log("--- Allocate tokenClaim branch",claim.branch);
        console.log("--- Allocate tokenClaim tokenSlotIndex", claim.tokenSlotIndex);
        //        console.log("--- Allocate tokenClaim-before",tokenClaim);

        //for delay speed up input
        TokenHandler.TokenBranch storage tokenBranch = engineClusterTaskCallerRoundTokenBranch[hash];
        if (tokenBranch.valueList.length == 0) {
            tokenBranch.valueList.push(0);
        }

        console.log("--------- Allocate InBranch", tokenBranch.getInBranch());

        bool claimed;

        if (claim.io == RULE_IO_INPUT) {
            claimed = tokenBranch.getClaimInput(uint8(claim.tokenSlotIndex));
        } else {
            claimed = tokenBranch.getClaimOutput(uint8(claim.tokenSlotIndex));
        }

        if (!claimed) {
            if (claim.io == RULE_IO_INPUT) {
                tokenBranch.setClaimInput(uint8(claim.tokenSlotIndex));
            } else {
                tokenBranch.setClaimOutput(uint8(claim.tokenSlotIndex));
            }
        }

        console.log("------tokenClaim-claimed", claimed);
        return claimed;
    }

}
