// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";
import "../util/Bit.sol";
import "../util/StringUtil.sol";
import "hardhat/console.sol";
import "../struct/Constant.sol";
import "./Attribute.sol";
import "../util/Chain.sol";

library Rule {
    uint constant BIT_TOKEN_SLOT_BRANCH = 8;
    uint constant BIT_TOKEN_SLOT_BRANCH_SHIFT = 0;
    uint constant BIT_TOKEN_SLOT_DURATION_TYPE = 8;
    uint constant BIT_TOKEN_SLOT_DURATION_TYPE_SHIFT = BIT_TOKEN_SLOT_BRANCH + BIT_TOKEN_SLOT_BRANCH_SHIFT;
    uint constant BIT_TOKEN_SLOT_DURATION_BEGIN = 32;
    uint constant BIT_TOKEN_SLOT_DURATION_BEGIN_SHIFT = BIT_TOKEN_SLOT_DURATION_TYPE + BIT_TOKEN_SLOT_DURATION_TYPE_SHIFT;
    uint constant BIT_TOKEN_SLOT_DURATION_END = 32;
    uint constant BIT_TOKEN_SLOT_DURATION_END_SHIFT = BIT_TOKEN_SLOT_DURATION_BEGIN + BIT_TOKEN_SLOT_DURATION_BEGIN_SHIFT;
    uint constant BIT_TOKEN_SLOT_IO_TYPE = 8;
    uint constant BIT_TOKEN_SLOT_IO_TYPE_SHIFT = BIT_TOKEN_SLOT_DURATION_END + BIT_TOKEN_SLOT_DURATION_END_SHIFT;
    uint constant BIT_TOKEN_SLOT_BUSINESS = 32;//this is for the central business of outside
    uint constant BIT_TOKEN_SLOT_BUSINESS_SHIFT = BIT_TOKEN_SLOT_IO_TYPE + BIT_TOKEN_SLOT_IO_TYPE_SHIFT;
    uint constant BIT_TOKEN_SLOT_MOUNTING_TOKEN_SLOT_INDEX = 8;
    uint constant BIT_TOKEN_SLOT_MOUNTING_TOKEN_SLOT_INDEX_SHIFT = BIT_TOKEN_SLOT_BUSINESS + BIT_TOKEN_SLOT_BUSINESS_SHIFT;
    uint constant BIT_TOKEN_SLOT_ALLOCATION_ID = 16;
    uint constant BIT_TOKEN_SLOT_ALLOCATION_ID_SHIFT = BIT_TOKEN_SLOT_ALLOCATION_ID + BIT_TOKEN_SLOT_MOUNTING_TOKEN_SLOT_INDEX_SHIFT;

    uint constant BIT_HANDLER_COUNT_PRE = 8;
    uint constant BIT_HANDLER_COUNT_PRE_SHIFT = 0;
    uint constant BIT_HANDLER_COUNT_PROCESS = 8;
    uint constant BIT_HANDLER_COUNT_PROCESS_SHIFT = BIT_HANDLER_COUNT_PRE + BIT_HANDLER_COUNT_PRE_SHIFT;
    uint constant BIT_HANDLER_COUNT_POST = 8;
    uint constant BIT_HANDLER_COUNT_POST_SHIFT = BIT_HANDLER_COUNT_PROCESS + BIT_HANDLER_COUNT_PROCESS_SHIFT;

    struct TokenSlot {
        Token.TokenTemplate tokenTemplate;
        uint8 rule; // for inputUse 0 in input tokens , 1 out withdraw tokens

        address[] ioAddressList; // input: receipt address, output: source address , 0x00 mint 0x12 user or contract address

        //32:business 8:ioType 32:durationEnd 32:durationBegin 8:durationType,timestamp-0,block-1,16:branch
        uint256[] valueList;
    }

    struct GroupSlot {
        TokenSlot[] tokenSlotList;

        uint8 branch;
        address poolToken;//token holdings of user inputs

        address[] handlerList;//one groupSlot can be used by different handler
        bytes[] argsList;
    }

    struct RuleSlot {
        uint16 ruleSlotIndex;
        GroupSlot[] groupSlotList;
        uint8[] groupSlotOptList;
    }

    struct Rule {

        uint16 ruleSlotIndexInput;
        uint16 ruleSlotIndexOutput;
        uint8 state;
        uint32 totalCount;

        uint8 durationType;// 0 timestamp 1 block.number
        uint32 delayTimestamp;//32:delay block number  32delay seconds to execute task
        uint32 delayBlockNumber;

        uint64 handlerCount;
        address[] handlerList;
        bytes[] handlerArgsList;//init args , only do it in regRule or addRule.
        address snippet;

    }

    //TokenSlot
    function setIOType(TokenSlot memory self, uint256 i, uint8 ioType) internal {
        self.valueList[i] = Bit.bit(self.valueList[i], uint256(ioType), BIT_TOKEN_SLOT_IO_TYPE, BIT_TOKEN_SLOT_IO_TYPE_SHIFT);
    }

    function getIOType(TokenSlot memory self, uint256 i) internal returns (uint8){
        return uint8(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_IO_TYPE, BIT_TOKEN_SLOT_IO_TYPE_SHIFT));
    }

    function setBusiness(TokenSlot memory self, uint256 i, uint64 business) internal {
        self.valueList[i] = Bit.bit(self.valueList[i], uint256(business), BIT_TOKEN_SLOT_BUSINESS, BIT_TOKEN_SLOT_BUSINESS_SHIFT);
    }

    function getBusiness(TokenSlot memory self, uint256 i) internal returns (uint64){
        return uint64(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_BUSINESS, BIT_TOKEN_SLOT_BUSINESS_SHIFT));
    }

    function setBranch(TokenSlot memory self, uint256 i, uint8 branch) internal {
        self.valueList[i] = Bit.bit(self.valueList[i], uint256(branch), BIT_TOKEN_SLOT_BRANCH, BIT_TOKEN_SLOT_BRANCH_SHIFT);
    }

    function getBranch(TokenSlot memory self, uint256 i) internal returns (uint8){
        return uint8(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_BRANCH, BIT_TOKEN_SLOT_BRANCH_SHIFT));
    }

    function setDurationType(TokenSlot memory self, uint256 i, uint8 durationType) internal {
        self.valueList[i] = Bit.bit(self.valueList[i], uint256(durationType), BIT_TOKEN_SLOT_DURATION_TYPE, BIT_TOKEN_SLOT_DURATION_TYPE_SHIFT);
    }

    function getDurationType(TokenSlot memory self, uint256 i) internal returns (uint8){
        return uint8(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_DURATION_TYPE, BIT_TOKEN_SLOT_DURATION_TYPE_SHIFT));
    }

    function setDurationBegin(TokenSlot memory self, uint256 i, uint256 durationBegin) internal {
        self.valueList[i] = Bit.bit(self.valueList[i], durationBegin, BIT_TOKEN_SLOT_DURATION_BEGIN, BIT_TOKEN_SLOT_DURATION_BEGIN_SHIFT);
    }

    function getDurationBegin(TokenSlot memory self, uint256 i) internal returns (uint32){
        return uint32(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_DURATION_BEGIN, BIT_TOKEN_SLOT_DURATION_BEGIN_SHIFT));
    }

    function setDurationEnd(TokenSlot memory self, uint256 i, uint256 durationEnd) internal {
        self.valueList[i] = Bit.bit(self.valueList[i], durationEnd, BIT_TOKEN_SLOT_DURATION_END, BIT_TOKEN_SLOT_DURATION_END_SHIFT);
    }

    function getDurationEnd(TokenSlot memory self, uint256 i) internal returns (uint32){
        return uint32(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_DURATION_END, BIT_TOKEN_SLOT_DURATION_END_SHIFT));
    }

    //host for mounting token
    function setMountingTokenSlotIndex(TokenSlot memory self, uint256 i, uint8 mountingTokenSlotIndex) internal {
        self.valueList[i] = Bit.bit(self.valueList[i], mountingTokenSlotIndex, BIT_TOKEN_SLOT_MOUNTING_TOKEN_SLOT_INDEX, BIT_TOKEN_SLOT_MOUNTING_TOKEN_SLOT_INDEX_SHIFT);
    }

    //host for mounting token
    function getMountingTokenSlotIndex(TokenSlot memory self, uint256 i) internal returns (uint8){
        return uint8(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_MOUNTING_TOKEN_SLOT_INDEX, BIT_TOKEN_SLOT_MOUNTING_TOKEN_SLOT_INDEX_SHIFT));
    }

    function getAllocationId(TokenSlot memory self, uint256 i) internal returns (uint16){
        return uint8(Bit.bitValue(self.valueList[i], BIT_TOKEN_SLOT_ALLOCATION_ID, BIT_TOKEN_SLOT_ALLOCATION_ID_SHIFT));
    }

    function checkClaimTime(TokenSlot memory self, uint i, uint32 taskStartTimestamp, uint32 taskStartBlockNumber) internal returns (bool){
        return _checkClaimTime(
            taskStartTimestamp,
            taskStartBlockNumber,
            getDurationType(self, i),
            getDurationBegin(self, i),
            getDurationEnd(self, i)
        );
    }

    function _checkClaimTime(
        uint32 taskStartTimestamp,
        uint32 taskStartBlockNumber,
        uint8 durationType,
        uint32 durationBegin,
        uint32 durationEnd) internal returns (bool){
        bool claim = true;

        uint256 curTime;
        uint256 beginTime;
        uint256 endTime;
        uint32 taskStart;
        if (durationType == DURATION_TYPE_TIMESTAMP) {
            curTime = block.timestamp;
            beginTime = taskStartTimestamp + durationBegin;
            endTime = taskStartTimestamp + durationEnd;
            taskStart = taskStartTimestamp;
        } else if (durationType == DURATION_TYPE_BLOCK_NUMBER) {
            curTime = Chain.getBlockNumber();
            beginTime = taskStartBlockNumber + durationBegin;
            endTime = taskStartBlockNumber + durationEnd;
            taskStart = taskStartBlockNumber;
        }

        console.log("-------------- rule _checkClaimTime taskStartTimestamp", taskStartTimestamp);
        console.log("-------------- rule _checkClaimTime taskStartBlockNumber", taskStartBlockNumber);
        console.log("-------------- rule _checkClaimTime curTime", curTime);
        console.log("-------------- rule _checkClaimTime beginTime", beginTime);
        console.log("-------------- rule _checkClaimTime endTime", endTime);

        if ((durationBegin > 0 || curTime < taskStart) && curTime < beginTime) {
            claim = false;
        }
        if ((durationEnd > 0 || curTime < taskStart) && curTime > endTime) {
            claim = false;
        }

        return claim;
    }

    // rule library
    function getHandlerCount(Rule memory self) internal returns (uint8){
        uint8 preHandlerCount = getPreHandlerCount(self);
        uint8 processHandlerCount = getProcessHandlerCount(self);
        uint8 postHandlerCount = getPostHandlerCount(self);
        return preHandlerCount + processHandlerCount + postHandlerCount;
    }

    function getPreHandlerCount(Rule memory self) internal returns (uint8){
        return uint8(Bit.bitValue(self.handlerCount, BIT_HANDLER_COUNT_PRE, BIT_HANDLER_COUNT_PRE_SHIFT));
    }

    function getProcessHandlerCount(Rule memory self) internal returns (uint8){
        return uint8(Bit.bitValue(self.handlerCount, BIT_HANDLER_COUNT_PROCESS, BIT_HANDLER_COUNT_PROCESS_SHIFT));
    }

    function getPostHandlerCount(Rule memory self) internal returns (uint8){
        return uint8(Bit.bitValue(self.handlerCount, BIT_HANDLER_COUNT_POST, BIT_HANDLER_COUNT_POST_SHIFT));
    }

    function getPreHandlerAndArgsList(Rule memory self) internal returns (address[] memory, bytes[] memory){
        uint8 preHandlerCount = getPreHandlerCount(self);
        address[] memory preHandlerList = new address[](preHandlerCount * 2);
        bytes[] memory preHandlerArgsList = new bytes[](preHandlerCount);
        for (uint8 i = 0; i < preHandlerCount * 2; ++i) {
            preHandlerList[i] = self.handlerList[i];
        }
        for (uint8 i = 0; i < preHandlerCount; ++i) {
            preHandlerArgsList[i] = self.handlerArgsList[i];
        }
        return (preHandlerList, preHandlerArgsList);
    }

    function getProcessHandlerAndArgsList(Rule memory self) internal returns (address[] memory, bytes[] memory){
        uint8 preHandlerCount = getPreHandlerCount(self);
        uint8 processHandlerCount = getProcessHandlerCount(self);

        address[] memory processHandlerList = new address[](processHandlerCount * 2);
        for (uint8 i = preHandlerCount * 2; i < (preHandlerCount + processHandlerCount) * 2; ++i) {
            processHandlerList[i - preHandlerCount * 2] = self.handlerList[i];
        }

        bytes[] memory processHandlerArgsList = new bytes[](processHandlerCount);
        for (uint8 i = preHandlerCount; i < (preHandlerCount + processHandlerCount); ++i) {
            processHandlerArgsList[i - preHandlerCount] = self.handlerArgsList[i];
        }
        return (processHandlerList, processHandlerArgsList);
    }

    function getPostHandlerAndArgsList(Rule memory self) internal returns (address[] memory, bytes[] memory){
        uint8 preHandlerCount = getPreHandlerCount(self);
        uint8 processHandlerCount = getProcessHandlerCount(self);
        uint8 postHandlerCount = getPostHandlerCount(self);

        address[] memory postHandlerList = new address[](postHandlerCount * 2);
        for (uint8 i = (preHandlerCount + processHandlerCount) * 2; i < (preHandlerCount + processHandlerCount + postHandlerCount) * 2; ++i) {
            postHandlerList[i - (preHandlerCount + processHandlerCount) * 2] = self.handlerList[i];
        }

        bytes[] memory postHandlerArgsList = new bytes[](postHandlerCount);
        for (uint8 i = (preHandlerCount + processHandlerCount); i < (preHandlerCount + processHandlerCount + postHandlerCount); ++i) {
            postHandlerArgsList[i - (preHandlerCount + processHandlerCount)] = self.handlerArgsList[i];
        }
        return (postHandlerList, postHandlerArgsList);
    }

}
