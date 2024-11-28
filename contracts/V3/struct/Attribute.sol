pragma solidity ^0.8.0;

library Attribute {

    struct Attribute{
        uint32 attrId;
        string name;
        string symbol;
        string uri;
        uint8 level;
    }

    struct AttributeRange {
        uint32 attrId;
        uint8 attrOpt;
        uint8 attrType;
        int40 amountBegin;
        int40 amountEnd;
        uint32 parentAttrId;
        bytes4 formula;//create attribute use
    }

    struct TokenAttributeList{
        address token;
        uint8 erc;
        uint256 tokenId;//tokenId 0 : all tokenId shares
        AttributeOpt[] attributeOptList;
    }

    struct AttributeOpt{
        uint32 attrId;
        uint8 attrOpt;
        uint8 attrType;
        int40 attrAmount;
        string attrText;
        uint32 parentAttrId;
        uint8 attrState;
        bytes4 attrFormula;//idle attribute use
    }

    struct AttributeOptEx{
        uint32 attrId;
        uint8 attrOpt;
        uint8 attrType;
        int40 attrAmount;
        int40 attrAmountMin;
        int40 attrAmountMax;
        string attrText;
        uint32 parentAttrId;
        uint8 attrState;
        bytes4 attrFormula;//idle attribute use
    }

    struct AttributeData{
        uint32 attrId;
        uint8 attrType;
        int40 attrAmount;
        uint32 parentAttrId;
        uint8 attrState;
    }


    //this is used in inTokenList
    struct AttributeIn{
        uint32 attrId;
        int40 attrAmount;
    }



    function makeClusterIndexHash(uint32 clusterId) internal pure returns(bytes32) {
        // clusterId
        bytes32 hash = keccak256(abi.encode(clusterId));
        return hash;
    }

    function makeTokenHash(address token) pure internal returns(bytes32) {
        // tokenAddress
        bytes32 hash = keccak256(abi.encode(token));
        return hash;
    }

    function makeClusterIdAttrHash(uint32 clusterId,uint32 attrId) internal pure returns(bytes32) {
        // clusterId + attrId
        return keccak256(abi.encode(clusterId,attrId));
    }

    function makeTokenAttrHash(address token,uint32 attrId) internal pure returns(bytes32) {
        // tokenAddress + attrId
        return keccak256(abi.encode(token,attrId));
    }

    function makeClusterIndexTokenIdHash(uint32 clusterId,address tokenAddress,uint256 tokenId) internal pure returns(bytes32) {
        // clusterId + tokenAddress + tokenId
        return keccak256(abi.encode(clusterId,tokenAddress,tokenId));
    }

    function makeTokenIdHash(address tokenAddress,uint256 tokenId) internal pure returns(bytes32) {
        // tokenAddress + tokenId
        return keccak256(abi.encode(tokenAddress,tokenId));
    }

    function makeClusterIndexTokenIdAttrHash(uint32 clusterId,address tokenAddress,uint256 tokenId,uint32 attrId) internal pure returns(bytes32) {
        // clusterId + tokenAddress + tokenId + attrId
        return keccak256(abi.encode(clusterId,tokenAddress,tokenId,attrId));
    }

    function makeTokenIdAttrHash(address tokenAddress,uint256 tokenId,uint32 attrId) internal pure returns(bytes32) {
        // tokenAddress + tokenId + attrId
        return keccak256(abi.encode(tokenAddress,tokenId,attrId));
    }

    function makeClusterIndexTokenIdAttrSubHash(uint32 clusterId,address tokenAddress,uint256 tokenId,uint32 attrId,uint32 attrSubId) internal pure returns(bytes32) {
        // clusterId + tokenAddress + tokenId + attrId + attrSubId
        return keccak256(abi.encode(clusterId,tokenAddress,tokenId,attrId,attrSubId));
    }

    function makeTokenIdAttrSubHash(address tokenAddress,uint256 tokenId,uint32 attrId,uint32 attrSubId) internal pure returns(bytes32) {
        // tokenAddress + tokenId + attrId + attrSubId
        return keccak256(abi.encode(tokenAddress,tokenId,attrId,attrSubId));
    }

}
