// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Cluster.sol";

interface IClusterAttributeArea {

    event SetClusterAttrState(uint32 clusterId,uint32 attrId,uint8 state,uint8 newState);
    event SetTokenAttrState(address token,uint32 attrId,uint8 state,uint8 newState);
    event SetClusterAttr(uint32 clusterId,uint32 attrId);
    event SetTokenAttr(address token,uint32 attrId);

    function version() external pure returns(uint);
    function cname() external pure returns(string memory);

    function getAttrState(bytes32 hash) external view returns(uint8);
//    function setAttrState(bytes32 hash,uint8 state) external;

    function getClusterAttrIdList(uint32 clusterId,address token) external view returns(uint32[] memory);

    function setClusterAttrStateList(uint32 clusterId,address token,uint32[] memory attrIdList,uint8[] memory stateList) external;
    function getClusterAttrStateList(uint32 clusterId,address token,uint32[] memory attrIdList) external view returns(uint8[] memory);

    function getClusterAttrList(uint32 clusterId,address token,uint32[] memory attrIdList) external view returns(Attribute.Attribute[] memory);
    function updateClusterAttrList(address caller,uint32 clusterId,address token,Attribute.Attribute[] memory attrList,uint8[] memory attrStateList) external;

}
