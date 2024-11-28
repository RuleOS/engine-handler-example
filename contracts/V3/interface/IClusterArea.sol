// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Cluster.sol";

interface IClusterArea {

    event Receive(address from, uint256 value);
    event EventCluster(address indexed caller, uint8 indexed regType, uint32 indexed clusterId, uint8 ruleSlotIndex1, uint8 ruleSlotIndex2);

    struct PreForEngine {
        bool foundGroupSlot;
        Rule.GroupSlot groupSlot;
        address snippet;
        address[] preHandlerList;// pool + handler
        uint8 ruleDurationType;
        uint32 ruleDelayTimestamp;
        uint32 ruleDelayBlockNumber;
        uint32 delayTimestamp;
        uint32 delayBlockNumber;
    }

    function version() external pure returns(uint);
    function cname() external pure returns(string memory);

    function getEngine() external view returns(address);
    function getClusterRuleArea() external view returns (address);
    function getClusterRuleAreaHandler() external view returns (address);
    function getClusterAttributeArea() external view returns (address);
    function getClusterAttributeAreaToken() external view returns (address);
    function getClusterMountingArea() external view returns (address);

    function pause(uint8 channel, bool _paused) external;

    struct ProcessForEngine {
        address[] processHandlerList;// pool + handler
    }

    struct PostForEngine {
        address[] postHandlerList;// pool + handler
    }

    function haveRole(uint32 clusterId, uint8 role, address account) external view returns (bool);
    function grantRole(uint32 clusterId, uint8 role, address account) external;
    function revokeRole(uint32 clusterId, uint8 role, address account) external;
    function renounceRole(uint32 clusterId, uint8 role, address account) external;

    function regCluster(Cluster.Cluster memory cluster) payable external virtual;
    function regRule(Cluster.Cluster memory cluster) payable external virtual;
    function addRule(uint32 clusterId, Cluster.Cluster memory cluster) payable external virtual;

    function getCurrentClusterId() external view returns(uint256);

    function getAdminList(uint32 clusterId) external view returns(address[] memory);
    function getDeployerList(uint32 clusterId) external view returns(address[] memory);

    function getDescription(uint32 clusterId) external view returns (string memory);
    function getDelayTimestamp(uint32 clusterId) external view returns (uint32);
    function getDelayBlockNumber(uint32 clusterId) external view returns (uint32);

    function setClusterState(uint32 clusterId, uint8 state) external;
    function getClusterState(uint32 clusterId) external view returns (uint8);

    function getPreGroupSlotForEngine(uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput, uint8 branch) external returns (PreForEngine memory);
    function getProcessGroupSlotForEngine(uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput) external returns (ProcessForEngine memory);
    function getPostGroupSlotForEngine(uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput) external returns (PostForEngine memory);

    function updateGroupSlotTokenHandler(uint32 clusterId, uint16 ruleSlotIndex, uint8 branch, uint8 tokenSlotIndex, Token.TokenHandler memory tokenHandler) external returns (bool);
}
