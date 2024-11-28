// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Hash {

    function makeClusterIndexRuleHash(uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput) internal pure returns (bytes32){
        return keccak256(abi.encode(clusterId, ruleSlotIndexInput, ruleSlotIndexOutput));
    }

    function makeSenderClusterIndexRuleHash(address sender, uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput) internal pure returns (bytes32){
        return keccak256(abi.encode(sender, clusterId, ruleSlotIndexInput, ruleSlotIndexOutput));
    }

    function makeSenderClusterRuleTaskCallerHash(address sender, address clusterArea, uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput, address stateCounter, uint32 taskId, address caller) internal pure returns (bytes32){
        bytes32 handlerClusterRuleTaskCallerHash = keccak256(abi.encode(sender, clusterArea, clusterId, ruleSlotIndexInput, ruleSlotIndexOutput, stateCounter, taskId, caller));
        return handlerClusterRuleTaskCallerHash;
    }

    function makeClusterTokenMountingHash(uint32 clusterId, address token, uint256 tokenId) internal view returns (bytes32) {
        if (clusterId > 0) {
            return keccak256(abi.encode(clusterId, token, tokenId));
        }
        return keccak256(abi.encode(token, tokenId));
    }

    function makeClusterTokenMountingExistHash(uint32 clusterId, address token, uint256 tokenId, address tokenMountingAddress, uint256 tokenMountingId) internal view returns (bytes32) {
        if (clusterId > 0) {
            return keccak256(abi.encode(clusterId, token, tokenId, tokenMountingAddress, tokenMountingId));
        }
        return keccak256(abi.encode(token, tokenId, tokenMountingAddress, tokenMountingId));
    }

    function makeClusterTokenMountingParentExistHash(uint32 clusterId, address tokenMountingAddress, uint256 tokenMountingId, address token, uint256 tokenId) internal pure returns (bytes32) {
        if (clusterId > 0) {
            return keccak256(abi.encode(clusterId, tokenMountingAddress, tokenMountingId, token, tokenId));
        }
        return keccak256(abi.encode(tokenMountingAddress, tokenMountingId, token, tokenId));
    }

}
