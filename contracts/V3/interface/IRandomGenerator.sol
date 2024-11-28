// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../util/Bit.sol";
import "../util/Hash.sol";
import "../struct/Constant.sol";
import "../interface/IVersion.sol";

interface IRandomGenerator is IVersion {


    struct RandomState {
        address handler;
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



    function updateRandomArgs(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,uint8 trialMaxCount) external;



    function getRandomState(address handler,address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) external view returns(RandomState memory);
    function clearRandom(address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) external;

    function makeRandomBlock(address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) external returns(bool);

    function makeRandom(bytes memory data,address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) external returns(uint256);

    function makeRandomPast(bytes memory data,address clusterArea,uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,address stateCounter,uint32 taskId,address caller) external returns(uint256);


    function getTaskRandom(bytes32 hash) external returns(uint256);


}
