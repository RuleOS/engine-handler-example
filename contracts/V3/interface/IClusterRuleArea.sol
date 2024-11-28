// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Cluster.sol";

interface IClusterRuleArea {

    event EventClusterRule(address indexed caller,uint8 indexed regType,uint32 indexed clusterId,uint8 ruleSlotIndex1,uint8 ruleSlotIndex2);
    event SetRuleState(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,uint8 state,uint8 newState);

    function version() external pure returns(uint);

    function cname() external pure returns(string memory);

    function getEngine() external returns(address);
    function getPoolFee() external returns(address);
    function getPoolContract() external returns(address);
    function getClusterArea() external returns(address);

    function registerRule(address caller,uint32 clusterId,Cluster.Cluster memory cluster) external;
    function updateRuleList(uint32 clusterId,Rule.Rule[] memory ruleList) external;
    function updateGroupSlotList(uint32 clusterId,Rule.RuleSlot[] memory ruleSlotList) external;

    function setRuleState(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,uint8 state) external;
    function getRuleState(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(uint8);

    function updateRuleLeftCount(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,uint32 decreaseCount) external returns(bool);
    function updateGroupSlotTokenHandler(uint32 clusterId,uint16 ruleSlotIndex,uint8 branch,uint8 tokenSlotIndex,Token.TokenHandler memory tokenHandler) external returns(bool);

    function getRuleSlotLength(uint32 clusterId) external view returns(uint16);
    function getGroupSlotBoundList(uint32 clusterId) external view returns(uint8[] memory);
    function getGroupSlotBound(uint32 clusterId,uint16 ruleSlotIndex) external view returns(uint8);

    function getRuleTotalCount(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(uint32);
    function getRuleLeftCount(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(uint32);

    function getRuleSlotIndexList(uint32 clusterId) external view returns(uint16[] memory);
    function getRuleSlotIndexRule(uint32 clusterId,uint16 ruleIndex) external view returns(uint16,uint16);

    function getRuleDurationType(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(uint8);
    function getRuleDelayTimestamp(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(uint32);
    function getRuleDelayBlockNumber(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(uint32);

    function getGroupSlotBranchList(uint32 clusterId,uint16 ruleSlotIndex) external view returns(uint8[] memory);

    function getGroupSlotLength(uint32 clusterId,uint16 ruleSlotIndex) external view returns(uint8);
    function getGroupSlot(uint32 clusterId,uint16 ruleSlotIndex,uint8 branch) external view returns(bool found,Rule.GroupSlot memory);
    function getGroupSlotHandlerArgs(uint32 clusterId,uint16 ruleSlotIndex,uint8 branch,address handler) external view returns(bytes memory);


}
