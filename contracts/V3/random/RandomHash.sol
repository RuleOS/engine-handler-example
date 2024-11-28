// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../util/Bit.sol";
import "hardhat/console.sol";
import "../struct/Constant.sol";

abstract contract RandomHash {

    event Random(address indexed clusterArea,uint32 indexed clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller,uint256 indexed random);

    uint constant BIT_RANDOM_BLOCK_NUMBER = 32;
    uint constant BIT_RANDOM_BLOCK_NUMBER_SHIFT = 0;
    uint constant BIT_RANDOM_TRIAL_COUNT = 8;
    uint constant BIT_RANDOM_TRIAL_COUNT_SHIFT = BIT_RANDOM_BLOCK_NUMBER + BIT_RANDOM_BLOCK_NUMBER_SHIFT;

    //clusterArea + clusterId + ruleSlotIndexInput + ruleSlotIndexOutput
    mapping(bytes32 => uint8) ruleTrialMaxCount;
    mapping(bytes32 => uint256) public blockHashTask;
    mapping(bytes32 => uint256) public taskRandom;
    mapping(address => uint256) private _seed;

    struct RandomState {
        address engine;
        address clusterArea;
        address stateCounter;
        address caller;
        uint32 clusterId;
        uint16 ruleSlotIndexInput;
        uint16 ruleSlotIndexOutput;
        uint32 taskId;

        uint32 blockTimestamp;
        uint32 blockNumber;

        uint8 stdTrialMaxCount;
        uint8 trialCount;
        uint32 futureBlockNumber;
        bytes32 futureBlockHash;
        uint256 futureBlockHashInt;
    }


    function updateRandomArgs(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,uint8 trialMaxCount) public {
        //clusterArea
        bytes32 clusterRuleHash = keccak256(abi.encode(msg.sender,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput));

        ruleTrialMaxCount[clusterRuleHash] = trialMaxCount;
    }


    function checkRandom(address engine,address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) public view returns(RandomState memory) {
        bytes32 engineClusterRuleAreaTaskHash = keccak256(abi.encode(engine,clusterArea,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput,stateCounter,taskId,caller));

        RandomState memory randomState;

        randomState.engine = engine;
        randomState.clusterArea = clusterArea;
        randomState.caller = caller;
        randomState.clusterId = clusterId;
        randomState.ruleSlotIndexInput = ruleSlotIndexInput;
        randomState.ruleSlotIndexOutput = ruleSlotIndexOutput;
        randomState.stateCounter = stateCounter;
        randomState.taskId = taskId;

        randomState.blockNumber = uint32(block.number);
        randomState.blockTimestamp = uint32(block.timestamp);

        uint256 hashTask = blockHashTask[engineClusterRuleAreaTaskHash];
        randomState.futureBlockNumber = uint32(Bit.bitValue(hashTask,BIT_RANDOM_BLOCK_NUMBER,BIT_RANDOM_BLOCK_NUMBER_SHIFT));
        randomState.trialCount = uint8(Bit.bitValue(hashTask,BIT_RANDOM_TRIAL_COUNT,BIT_RANDOM_TRIAL_COUNT_SHIFT));
        randomState.futureBlockHash =  blockhash(randomState.futureBlockNumber);
        randomState.futureBlockHashInt = uint256(randomState.futureBlockHash);

        bytes32 clusterRuleHash = keccak256(abi.encode(clusterArea,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput));

        randomState.stdTrialMaxCount = ruleTrialMaxCount[clusterRuleHash];

        return randomState;
    }

    function clearRandom(address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) public {
        bytes32 engineClusterRuleAreaTaskHash = keccak256(abi.encode(msg.sender,clusterArea,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput,stateCounter,taskId,caller));

        blockHashTask[engineClusterRuleAreaTaskHash] = 0;
    }

    function makeRandomBlock(address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) public returns(bool) {

        bytes32 engineClusterRuleAreaTaskHash = keccak256(abi.encode(msg.sender,clusterArea,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput,stateCounter,taskId,caller));

        uint256 hashTask = blockHashTask[engineClusterRuleAreaTaskHash];

        uint32 futureBlockNumber = uint32(Bit.bitValue(hashTask,BIT_RANDOM_BLOCK_NUMBER,BIT_RANDOM_BLOCK_NUMBER_SHIFT));
        console.log("---------- makeRandomBlock futureBlockNumber",futureBlockNumber);

        uint8 trialCount = uint8(Bit.bitValue(hashTask,BIT_RANDOM_TRIAL_COUNT,BIT_RANDOM_TRIAL_COUNT_SHIFT));

        bytes32 clusterRuleHash = keccak256(abi.encode(clusterArea,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput));

        uint8 trialMaxCount = ruleTrialMaxCount[clusterRuleHash];
        console.log("---------- makeRandomBlock ruleTrialMaxCount",trialMaxCount);
        console.log("---------- makeRandomBlock trialCount",trialCount);

        if (futureBlockNumber == 0) {
            hashTask = Bit.bit(hashTask,block.number + 2,BIT_RANDOM_BLOCK_NUMBER,BIT_RANDOM_BLOCK_NUMBER_SHIFT);
            hashTask = Bit.bit(hashTask,trialCount + 1,BIT_RANDOM_TRIAL_COUNT,BIT_RANDOM_TRIAL_COUNT_SHIFT);
            blockHashTask[engineClusterRuleAreaTaskHash] = hashTask;
            return true;
        }

        bytes32 futureBlockHash = blockhash(futureBlockNumber);
        uint256 hashInt = uint256(futureBlockHash);

        console.log("---------- makeRandomBlock hashInt",hashInt);

        if(hashInt == 0 && block.number > futureBlockNumber){

            if(trialCount + 1 > trialMaxCount){
//            require(false,"claim random trial time has exceed 3 times");
                return false;
            }

            //have exceed 256 block
            hashTask = Bit.bit(hashTask,block.number + 2,BIT_RANDOM_BLOCK_NUMBER,BIT_RANDOM_BLOCK_NUMBER_SHIFT);
            hashTask = Bit.bit(hashTask,trialCount + 1,BIT_RANDOM_TRIAL_COUNT,BIT_RANDOM_TRIAL_COUNT_SHIFT);
            blockHashTask[engineClusterRuleAreaTaskHash] = hashTask;
            return true;
        }

        //keep random state, can not make random again. prevent allocate again from user.
        return true;
    }

    function makeRandom(bytes memory data,address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) public returns(uint256){

        bytes32 engineClusterRuleAreaTaskHash = keccak256(abi.encode(msg.sender,clusterArea,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput,stateCounter,taskId,caller));

        uint256 hashTask = blockHashTask[engineClusterRuleAreaTaskHash];

        uint32 futureBlockNumber = uint32(Bit.bitValue(hashTask,BIT_RANDOM_BLOCK_NUMBER,BIT_RANDOM_BLOCK_NUMBER_SHIFT));

        console.log("-------makeRandom msg.sender",msg.sender);
        console.log("-------makeRandom clusterArea",clusterArea);
        console.log("-------makeRandom clusterId",clusterId);
        console.log("-------makeRandom taskId",taskId);
        console.log("-------makeRandom caller",caller);

        console.log("-------makeRandom block.number",block.number);
        console.log("-------makeRandom futureBlockNumber",futureBlockNumber);

        bytes32 futureBlockHash = blockhash(futureBlockNumber);
        uint256 hashInt = uint256(futureBlockHash);

        console.log("-------makeRandom hashInt",hashInt);

        uint256 random = 0;
        if(block.number > futureBlockNumber){
            if(hashInt == 0){
                console.log("-------makeRandom block.number < futureBlockNumber");
                random = HANDLER_RANDOM_BLOCK_PASSED_256;
            }
            else if(hashInt > 0){
                random = getRandomNumber(data,futureBlockHash);
                console.log("-------makeRandom random",random);
            }
        } else {
            random = HANDLER_RANDOM_BLOCK_NOT_REACH;
        }

        if(random >= HANDLER_RANDOM_COUNT){
            taskRandom[engineClusterRuleAreaTaskHash] = random;
        }

        emit Random(clusterArea,clusterId,ruleSlotIndexInput,ruleSlotIndexOutput,stateCounter,taskId,caller,random);

        console.log("-------makeRandom finish");

        return random;
    }


    function getRandomNumber(bytes memory data,bytes32 hash) internal virtual returns (uint256){
        uint256 gasLeft = gasleft();
        bytes32 _sha256 = keccak256(
            abi.encode(
                gasLeft,
                tx.gasprice,
                block.timestamp,
                hash,
                block.coinbase,
                data
            )
        );
        unchecked {
            _seed[tx.origin] = _seed[tx.origin] * 3 + uint256(_sha256);
        }
        return _seed[tx.origin];
    }


}
