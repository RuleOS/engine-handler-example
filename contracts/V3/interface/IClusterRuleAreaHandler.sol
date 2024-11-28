// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Cluster.sol";

interface IClusterRuleAreaHandler {

    event EventClusterHandler(address indexed caller,uint8 indexed regType,uint32 indexed clusterId,uint8 ruleSlotIndex1,uint8 ruleSlotIndex2);

    function version() external pure returns(uint);

    function cname() external pure returns(string memory);

    function getEngine() external returns(address);
    function getPoolFee() external returns(address);
    function getPoolContract() external returns(address);
    function getClusterArea() external returns(address);


    function registerHandlerList(uint32 clusterId,Cluster.Cluster memory cluster) external;
    function updateHandlerList(uint32 clusterId,Rule.Rule[] memory ruleList) external;
    function updateHandlerArgs(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput,uint8 cmd,address handler,bytes memory args) external returns(bool);

    function getHandlerList(uint32 clusterId) external view returns(address[] memory);
    function getHandlerPoolList(uint32 clusterId) external view returns(address[] memory);

    function getSnippet(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(address);

    function getPreHandlerList(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(address[] memory);
    function getProcessHandlerList(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(address[] memory);
    function getPostHandlerList(uint32 clusterId,uint16 ruleSlotIndexInput,uint16 ruleSlotIndexOutput) external view returns(address[] memory);



}
