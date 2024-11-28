// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Cluster.sol";

interface IClusterAttributeAreaToken {

    event SetClusterAttr(uint32 clusterId, uint32 attrId);
    event SetTokenAttr(address token, uint32 attrId);
    event TokenAttrChange(uint32 clusterId, address token, uint256 tokenId, uint32 attrId, uint32 parentAttrId, uint8 latestState, int40 latestAttrAmount);

    function version() external pure returns (uint);

    function cname() external pure returns (string memory);


    function getClusterTokenAttrIdList(uint32 clusterId,address token,uint256 tokenId) external view returns(uint32[] memory);
    function getClusterTokenSubAttrIdList(uint32 clusterId,address token,uint256 tokenId,uint32 attrId) external view returns(uint32[] memory);
    function getClusterTokenAttrOpt(uint32 clusterId,address token,uint256 tokenId,uint32 parentAttrId,uint32 attrId) external view returns(Attribute.AttributeOptEx memory);
    function getClusterTokenAttrData(uint32 clusterId,address token,uint256 tokenId,uint32 parentAttrId,uint32 attrId) external view returns(Attribute.AttributeData memory);

    function getSubAttrTypeAmount(uint32 clusterId,address token,uint256 tokenId,uint32 attrId,uint32 subAttrId) external view returns(uint8,int40);
    function sumAttrAmount(uint8 mode,uint32 clusterId,address token,uint256 tokenId,uint32 attrId) external view returns(int40);
    function sumAttrAmountByType(int40 sumAmount,uint8 subType,int40 subAmount) external view returns(int40);
    function sumMountingAttrAmount(uint8 mode,uint8 layerCount,uint32 clusterId,address token,uint256 tokenId,uint32 attrId) external view returns(int40);


    //update from outside
    function updateClusterTokenIdAttrList(uint32 clusterId,Attribute.TokenAttributeList[] memory tokenAttrList) external;

    //upate from engine
    function updateClusterTokenIdOptAttrList(address caller,uint32 clusterId,Attribute.TokenAttributeList memory tokenOptAttr) external;
    function updateTokenIdOptAttrList(address caller,Attribute.TokenAttributeList memory tokenOptAttr) external;

}
