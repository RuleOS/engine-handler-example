// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../rlp/RLPDecode.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../interface/IHandler.sol";
import "../interface/IClusterRuleArea.sol";
import "../util/RLPUtil.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../RandomGenerator.sol";
import "../interface/IStateCounter.sol";
import "./AreaHandler.sol";

contract RedPacketHandler is Initializable, AreaHandler {
    using RLPDecode for bytes;
    using RLPDecode for RLPDecode.RLPItem;
    using Task for Task.Task;
    using TokenHandler for TokenHandler.TokenBranch;
    using Token for Token.TokenTemplate;
    using RLPUtil for bytes;

    enum MODE{
        FAIR_MODE,
        RANDOM_MODE
    }

    struct RedPacketCore {
        uint256 remainAmount;
        uint256 totalAmount;
        uint16 count;
        uint16 claimCount;
        MODE mode;
        address creator;
        uint32 deadLine;
        uint32 startTime;

    }

    struct RedPacketConfig {
        uint256 claimAmountMin;
    }

    event RedPacketOpen(bytes32 indexed ruleHash,uint256 indexed packageId, address indexed opener, uint256 amount,uint time);
    event RedPacketCreate(bytes32 indexed ruleHash,uint256 indexed packageId, address indexed creator,uint amount, uint time);
    event RedPacketClaimRemain(bytes32 indexed ruleHash,uint256 indexed packageId,address indexed caller, uint amount,uint time);

    uint8 constant INPUT_BRANCH = 1;
    uint8 constant GAS_BRANCH_OPEN = 2;
    uint8 constant GAS_BRANCH_CLAIM_REMAIN = 3;
    uint8 constant OUTPUT_NO_OUTPUT_BRANCH = 100;
    uint8 constant OUTPUT_CLAIM_BRANCH = 101;
    uint8 constant CMD_RED_PACKET_NEW = 0;
    uint8 constant CMD_RED_PACKET_OPEN = 1;
    uint8 constant CMD_RED_PACKET_CLAIM_REMAIN = 2;

    uint32 claimAmountMin;

    mapping(uint256 => mapping(address => bool)) private hasOpen;
    mapping(bytes32 => RedPacketCore) private _redPacketCores;
    mapping(bytes32 => TokenHandler.TokenBranch) engineClusterTaskCallerRoundTokenBranch;
    mapping(bytes32 => RedPacketConfig) config;

    function initialize() public initializer {
        __Ownable_init();
    }

    function getIOBranches() external pure override returns (IOBranch[] memory branches){
        return branches;
    }

    function getState(Handler.StateParams memory params) public view override returns (bytes[] memory){
        bytes[] memory res;
        uint packetId = RLPUtil.fromHandlerUint(params.args,0);
        bytes32 clusterRuleHash = keccak256(abi.encode(params.clusterId, params.ruleSlotIndexInput, params.ruleSlotIndexOutput));
        clusterRuleHash=keccak256(abi.encode(clusterRuleHash, packetId));
        RedPacketCore storage core = _redPacketCores[clusterRuleHash];
        res= new bytes[](8);
        res[0] = RLPUtil.toUint("remainAmount", core.remainAmount);
        res[1] = RLPUtil.toUint("totalAmount",core.totalAmount);
        res[2] = RLPUtil.toUint("count",core.count);
        res[3] = RLPUtil.toUint("claimCount",core.claimCount);
        res[4] = RLPUtil.toUint("mode",uint256(core.mode));
        res[5] = RLPUtil.toAddress("creator",core.creator);
        res[6] = RLPUtil.toUint("deadLine",core.deadLine);
        res[7] = RLPUtil.toUint("startTime",core.startTime);
        return res;

    }

    function regRuleGroupSlotArgs(uint32 clusterId, uint16 ruleSlotIndex, uint8 branch, bytes memory args) public override onlyEngineArea(ENGINE_CLUSTER_RULE_AREA) {

    }

    function getRuleGroupSlotArgs(uint32 clusterId, uint16 ruleSlotIndex, uint8 branch) public view override returns (bytes memory){
        return "";
    }

    function version() external pure override returns (uint){
        return 0;
    }

    function cname() external pure override returns (string memory){
        return "";
    }

    function regRule(uint32 clusterId, Cluster.Cluster memory cluster) public override onlyEngineArea(ENGINE_CLUSTER_RULE_AREA_HANDLER) {
    }


    function _initializeRedPacket(RedPacketCore storage redPacketCore, Handler.Process memory param, RLPDecode.RLPItem[] memory rlpArgsList, bytes32 ruleHash) internal {
        redPacketCore.count = uint16(param.task.getHandlerArg(rlpArgsList, 1).toUint());
        redPacketCore.remainAmount = param.task.inTokenList[0].amount;
        redPacketCore.totalAmount = param.task.inTokenList[0].amount;
        redPacketCore.deadLine = uint32(block.timestamp + param.task.getHandlerArg(rlpArgsList, 2).toUint());
        redPacketCore.startTime=uint32(block.timestamp);
        redPacketCore.mode = MODE(uint8(param.task.getHandlerArg(rlpArgsList, 3).toUint()));
        redPacketCore.creator = param.caller;
        uint256 amountAtLeast = redPacketCore.count * config[ruleHash].claimAmountMin;
        require(amountAtLeast <= redPacketCore.totalAmount, "amount not enough");
    }

    function _checkCMD(Handler.Process memory param, uint8 cmd) internal {
        if (cmd == CMD_RED_PACKET_NEW || cmd == CMD_RED_PACKET_OPEN || cmd == CMD_RED_PACKET_CLAIM_REMAIN) {
            uint8 inputBranch = param.task.getGroupInputBranch();
            if (cmd == CMD_RED_PACKET_NEW) {
                require(inputBranch == INPUT_BRANCH, "CMD_RED_PACKET_NEW branch error");
            }
            if (cmd == CMD_RED_PACKET_OPEN) {
                require(inputBranch == GAS_BRANCH_OPEN, "CMD_RED_PACKET_OPEN branch error");
            }
            if (cmd == CMD_RED_PACKET_CLAIM_REMAIN) {
                require(inputBranch == GAS_BRANCH_CLAIM_REMAIN, "CMD_RED_PACKET_CLAIM_REMAIN error");
            }
        }

    }

    function process(
        Handler.Process memory param,
        Handler.Result memory preResult
    ) public override onlyEngineArea(ENGINE) returns (Handler.Result memory) {
        preResult.handler = address(this);
        RLPDecode.RLPItem[] memory rlpArgsList = param.task.getHandlerArgs();
        bytes32 clusterRuleHash = keccak256(abi.encode(param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput()));
        uint8 cmd = uint8(param.task.getHandlerArg(rlpArgsList, 0).toUint());
        bytes32 hash = Handler.makeEngineClusterTaskCallerRoundHash(msg.sender, param.task.clusterArea, param.task.clusterId, param.stateCounter, param.task.parentTaskId == 0 ? param.task.taskId : param.task.parentTaskId, param.caller, 0);
        uint256 packetId = param.task.parentTaskId == 0 ? param.task.taskId : param.task.parentTaskId;
        bytes32 clusterRuleIdHash = keccak256(abi.encode(clusterRuleHash, packetId));
        RedPacketCore storage redPacketCore = _redPacketCores[clusterRuleIdHash];
        _checkCMD(param, cmd);
        if (cmd == CMD_RED_PACKET_NEW) {
            _initializeRedPacket(redPacketCore, param, rlpArgsList, clusterRuleHash);
            emit RedPacketCreate(clusterRuleHash,packetId, param.caller, param.task.inTokenList[0].amount,uint32(block.timestamp));
        } else if (cmd == CMD_RED_PACKET_OPEN) {
            require(redPacketCore.deadLine >= block.timestamp, "deadLine has reached");
            require(redPacketCore.claimCount < redPacketCore.count, "redpacket no remain");
            require(!hasOpen[packetId][param.caller], "caller has claimed");
            hasOpen[packetId][param.caller] = true;
            uint256 claimAmount = _processClaim(param, hash, redPacketCore);
            emit RedPacketOpen(clusterRuleHash,packetId, param.caller, claimAmount,block.timestamp);
        } else if (cmd == CMD_RED_PACKET_CLAIM_REMAIN) {
            require(redPacketCore.deadLine < block.timestamp, "deadLine has not reached");
            require(redPacketCore.creator == param.caller, "caller is not creator");
            require(redPacketCore.remainAmount >0, "redPacket no remain");
            uint256 claimAmount = _processClaim(param, hash, redPacketCore);
            emit RedPacketClaimRemain(clusterRuleHash,packetId,param.caller, claimAmount,block.timestamp);
        }
        if (cmd == CMD_RED_PACKET_NEW) {
            processInput(param, hash, cmd);
        }
        preResult.code = HANDLER_CODE_FINISH;
        return preResult;
    }

    function _computeClaimAmount(Handler.Process memory param, RedPacketCore storage redPacketCore) internal returns (uint256){
        uint16 count = redPacketCore.count;
        uint16 claimCount = redPacketCore.claimCount;

        uint256 res = 0;
        if (redPacketCore.deadLine >= block.timestamp) {
            if (count == claimCount + 1) {
                res = redPacketCore.remainAmount;
            } else {
                if (redPacketCore.mode == MODE.FAIR_MODE) {
                    res = redPacketCore.totalAmount / count;
                } else {
                    uint max = (redPacketCore.remainAmount / (count - claimCount)) * 2;
                    {
                        uint maxBound = redPacketCore.remainAmount - (count - claimCount - 1) * claimAmountMin;
                        max = max < maxBound ? max : maxBound;
                    }
                    if (claimAmountMin == max) {
                        res = claimAmountMin;
                    } else {
                        res = claimAmountMin + (RandomGenerator(engineArea[ENGINE_RANDOM_GENERATOR]).makeRandomPast("0x", param.task.clusterArea, param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput(), param.stateCounter, param.task.taskId, param.caller)) % (max - claimAmountMin + 1);
                    }
                }
            }
            redPacketCore.claimCount = claimCount + 1;
        } else {
            res = redPacketCore.remainAmount;
        }
        return res;
    }

    function _processClaim(Handler.Process memory param, bytes32 hash, RedPacketCore storage redPacketCore) internal returns (uint256){
        TokenHandler.TokenBranchParams memory params = TokenHandler.makeParams();
        TokenHandler.TokenBranch memory tokenBranch;
        params.outBranchProcess = TokenHandler.TOKEN_HANDLER_OUT_BRANCH_PROCESS_TRUE;
        params.outBranch = OUTPUT_CLAIM_BRANCH;
        params.inBranch = block.timestamp>redPacketCore.deadLine?GAS_BRANCH_CLAIM_REMAIN:GAS_BRANCH_OPEN;
        params.tokenIdList = new uint256[](1);
        params.tokenAmountList = new uint256[](1);
        params.tokenCount = 1;
        (,Rule.GroupSlot memory groupSlot) = IClusterRuleArea(IClusterArea(param.task.clusterArea).getClusterRuleArea()).getGroupSlot(param.task.clusterId, param.task.getRuleSlotIndexOutput(), OUTPUT_CLAIM_BRANCH);
        if (groupSlot.tokenSlotList[0].tokenTemplate.erc == TOKEN_ERC_ERC1155) {
            uint256[] memory ids = groupSlot.tokenSlotList[0].tokenTemplate.getIdRange();
            params.tokenIdList[0] = ids[0];
        }
        params.tokenAmountList[0] = _computeClaimAmount(param, redPacketCore);
        redPacketCore.remainAmount = redPacketCore.remainAmount - params.tokenAmountList[0];
        tokenBranch.setParams(params);
        engineClusterTaskCallerRoundTokenBranch[hash] = tokenBranch;
        return params.tokenAmountList[0];
    }

    function processInput(Handler.Process memory param, bytes32 hash, uint8 cmd) private {
        TokenHandler.TokenBranchParams memory params = TokenHandler.makeParams();
        TokenHandler.TokenBranch memory tokenBranch;
        params.outBranch = OUTPUT_NO_OUTPUT_BRANCH;
        params.inBranchProcess = TokenHandler.TOKEN_HANDLER_IN_BRANCH_PROCESS_TRUE;
        tokenBranch.setParams(params);
        engineClusterTaskCallerRoundTokenBranch[hash] = tokenBranch;
    }


    function processInput(Handler.Process memory param, Handler.Result memory preResult) private returns (Handler.Result memory){
        return preResult;
    }

    function updateArgs(uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput, uint8 cmd, bytes memory args) public override onlyEngineArea(ENGINE_CLUSTER_RULE_AREA_HANDLER) returns (bool){
        bytes32 clusterRuleHash = keccak256(abi.encode(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput));
        config[clusterRuleHash].claimAmountMin = uint32(RLPUtil.fromHandlerUint(args, 0));
        return true;
    }

    function getInputAddressRound(address engine, address clusterArea, uint32 clusterId, address stateCounter, uint32 taskId, uint16 round) external view override returns (address[] memory){
        address[] memory res = new address[](1);
        return res;
    }

    function getOutputAddressRound(address engine, address clusterArea, uint32 clusterId, address stateCounter, uint32 taskId, uint16 round) external view override returns (address[] memory){
        address[] memory res = new address[](1);
        return res;
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
    ) external view override returns (TokenHandler.TokenBranch memory){
        bytes32 hash = Handler.makeEngineClusterTaskCallerRoundHash(engine, clusterArea, clusterId, stateCounter, taskId, outAddress, 0);
        TokenHandler.TokenBranch memory res = engineClusterTaskCallerRoundTokenBranch[hash];
        return res;
    }

    function getClaimIOAddressBranchToken(Claim memory claim) public override view returns (bool){
        return false;
    }

    function claimIOAddressBranchToken(Claim memory claim) public override onlyEngineArea(ENGINE) returns (bool) {
        return false;
    }

}
