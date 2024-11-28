// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/IHandler.sol";
import "../rlp/DecodeHelper.sol";
import "./AllocateHandler.sol";
import "hardhat/console.sol";
import "../util/RLPUtil.sol";
import "../util/Chain.sol";

uint constant BIT_RULE_EXECUTE_100_SWITCH = 8;
uint constant BIT_RULE_EXECUTE_100_SWITCH_SHIFT = 0;

uint constant BIT_BRANCH_INPUT = 8;
uint constant BIT_BRANCH_INPUT_SHIFT = 0;
uint constant BIT_BRANCH_OUTPUT = 8;
uint constant BIT_BRANCH_OUTPUT_SHIFT = BIT_BRANCH_INPUT + BIT_BRANCH_INPUT_SHIFT;
uint constant BIT_BRANCH_CLAIM_INPUT = 48;
uint constant BIT_BRANCH_CLAIM_INPUT_SHIFT = BIT_BRANCH_OUTPUT + BIT_BRANCH_OUTPUT_SHIFT;
uint constant BIT_BRANCH_CLAIM_OUTPUT = 48;
uint constant BIT_BRANCH_CLAIM_OUTPUT_SHIFT = BIT_BRANCH_CLAIM_INPUT + BIT_BRANCH_CLAIM_INPUT_SHIFT;

library AllocateHandlerLib {
    using RLPDecode for bytes;
    using RLPDecode for RLPDecode.RLPItem;

    function getAllocateState(Handler.StateParams memory params, uint128 ruleConfig) public view returns (bytes[] memory){
        uint8 execute100Switch = uint8(Bit.bitValue(ruleConfig, BIT_RULE_EXECUTE_100_SWITCH, BIT_RULE_EXECUTE_100_SWITCH_SHIFT));
        bytes[] memory res = new bytes[](3);
        res[0] = RLPUtil.toUint("blockTimestamp", uint32(block.timestamp));
        res[1] = RLPUtil.toUint("blockNumber", uint32(Chain.getBlockNumber()));
        res[2] = RLPUtil.toUint("execute100Switch", execute100Switch);

        return res;
    }
}
