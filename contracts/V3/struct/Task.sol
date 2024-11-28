// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../util/Bit.sol";
import "./Token.sol";
import "./Handler.sol";
import "../rlp/DecodeHelper.sol";

library Task {


    using RLPDecode for bytes;
    using RLPDecode for RLPDecode.RLPItem;

    uint constant BIT_TIMESTAMP = 32;// time task created
    uint constant BIT_TIMESTAMP_SHIFT = 0;
    uint constant BIT_TIMESTAMP_EXECUTE = 32;// > time can execute
    uint constant BIT_TIMESTAMP_EXECUTE_SHIFT = BIT_TIMESTAMP + BIT_TIMESTAMP_SHIFT;
    uint constant BIT_TIMESTAMP_PROCESSED = 32;// already processed
    uint constant BIT_TIMESTAMP_PROCESSED_SHIFT = BIT_TIMESTAMP_EXECUTE + BIT_TIMESTAMP_EXECUTE_SHIFT;
    uint constant BIT_TIMESTAMP_DONE_OR_REVOKED = 32;// already revoked
    uint constant BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT = BIT_TIMESTAMP_PROCESSED + BIT_TIMESTAMP_PROCESSED_SHIFT;

    uint constant BIT_BLOCK_NUMBER = 32;
    uint constant BIT_BLOCK_NUMBER_SHIFT = BIT_TIMESTAMP_DONE_OR_REVOKED + BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT;
    uint constant BIT_BLOCK_NUMBER_EXECUTE = 32;
    uint constant BIT_BLOCK_NUMBER_EXECUTE_SHIFT = BIT_BLOCK_NUMBER + BIT_BLOCK_NUMBER_SHIFT;
    uint constant BIT_BLOCK_NUMBER_PROCESSED = 32;
    uint constant BIT_BLOCK_NUMBER_PROCESSED_SHIFT = BIT_BLOCK_NUMBER_EXECUTE + BIT_BLOCK_NUMBER_EXECUTE_SHIFT;
    uint constant BIT_BLOCK_NUMBER_DONE_OR_REVOKED = 32;
    uint constant BIT_BLOCK_NUMBER_DONE_OR_REVOKED_SHIFT = BIT_BLOCK_NUMBER_PROCESSED + BIT_BLOCK_NUMBER_PROCESSED_SHIFT;

    uint constant BIT_RULE_DURATION_TYPE = 8;
    uint constant BIT_RULE_DURATION_TYPE_SHIFT = 0;
    uint constant BIT_RULE_SLOT_INDEX_INPUT = 16;
    uint constant BIT_RULE_SLOT_INDEX_INPUT_SHIFT = BIT_RULE_DURATION_TYPE + BIT_RULE_DURATION_TYPE_SHIFT;
    uint constant BIT_RULE_SLOT_INDEX_OUTPUT = 16;
    uint constant BIT_RULE_SLOT_INDEX_OUTPUT_SHIFT = BIT_RULE_SLOT_INDEX_INPUT + BIT_RULE_SLOT_INDEX_INPUT_SHIFT;
    uint constant BIT_GROUP_INPUT_BRANCH = 8;
    uint constant BIT_GROUP_INPUT_BRANCH_SHIFT = BIT_RULE_SLOT_INDEX_OUTPUT + BIT_RULE_SLOT_INDEX_OUTPUT_SHIFT;
    uint constant BIT_GROUP_INPUT_ROUND = 16;
    uint constant BIT_GROUP_INPUT_ROUND_SHIFT = BIT_GROUP_INPUT_BRANCH + BIT_GROUP_INPUT_BRANCH_SHIFT;
    uint constant BIT_MULTIPLE = 32;
    uint constant BIT_MULTIPLE_SHIFT = BIT_GROUP_INPUT_ROUND + BIT_GROUP_INPUT_ROUND_SHIFT;


    struct Task {
        address caller;
        address clusterArea;
        address lastHandler;
        address snippet;
        uint256 valueTime;
        uint256 value;

        //32:clusterId 8:TaskSate  32:taskId
        uint32 taskId;
        uint32 parentTaskId;
        uint32 clusterId;

        uint8 state;
        Token.Token[] inTokenList;
        bytes args;

    }

    function getHandlerArgs(Task memory self) internal returns(RLPDecode.RLPItem[] memory){
        return getHandlerArgs(self,address(this));
    }

    function getHandlerArgs(Task memory self,address handler) internal returns(RLPDecode.RLPItem[] memory){
        RLPDecode.RLPItem[] memory rlpItemList = self.args.toRlpItem().toList();
        for(uint i; i < rlpItemList.length; ++i){
            address hAddress = rlpItemList[i].toList()[0].toAddress();
            if(hAddress == handler){
                return rlpItemList[i].toList();
            }
        }
        RLPDecode.RLPItem[] memory itemList;
        return itemList;
    }


    function getHandlerArgsCount(Task memory self) internal returns(uint){
       return  getHandlerArgsCount(self,address(this));
    }

    function getHandlerArgsCount(Task memory self,address handler) internal returns(uint){
        RLPDecode.RLPItem[] memory rlpItemList = self.args.toRlpItem().toList();
        for(uint i; i < rlpItemList.length; ++i){
            RLPDecode.RLPItem[] memory hArgsList = rlpItemList[i].toList();
            address hAddress = hArgsList[0].toAddress();
            if(hAddress == handler){
                return hArgsList.length - 1;
            }
        }
        return 0;
    }


    function getHandlerOffset(Task memory self) internal returns(uint8){
       return getHandlerOffset(self,address(this));
    }

    function getHandlerOffset(Task memory self,address handler) internal returns(uint8){
        RLPDecode.RLPItem[] memory rlpItemList = self.args.toRlpItem().toList();
        for(uint8 i; i < rlpItemList.length; ++i){
            address hAddress = rlpItemList[i].toList()[0].toAddress();
            if(hAddress == handler){
                return i;
            }
        }
        return HANDLER_CMD_OFFSET_ILLEGAL;
    }


    function getHandlerArg(Task memory self,uint8 offset,uint8 argsIndex) internal returns(RLPDecode.RLPItem memory){
        RLPDecode.RLPItem[] memory rlpItemList = self.args.toRlpItem().toList();

        RLPDecode.RLPItem[] memory argsList = rlpItemList[offset].toList();

        return argsList[argsIndex+1].toList()[2];
    }

    function getHandlerArg(Task memory self,RLPDecode.RLPItem[] memory rlpArgsList,uint8 argsIndex) internal returns(RLPDecode.RLPItem memory){
        return rlpArgsList[argsIndex+1].toList()[2];
    }


    function setRuleDurationType(Task memory self,uint8 ruleDurationType) internal{
        self.value = Bit.bit(self.value,ruleDurationType,BIT_RULE_DURATION_TYPE,BIT_RULE_DURATION_TYPE_SHIFT);
    }

    function getRuleDurationType(Task memory self) internal view returns(uint8){
        return uint8(Bit.bitValue(self.value,BIT_RULE_DURATION_TYPE,BIT_RULE_DURATION_TYPE_SHIFT));
    }

    function setRuleSlotIndexInput(Task memory self,uint16 ruleSlotIndexInput) internal{
        self.value = Bit.bit(self.value,ruleSlotIndexInput,BIT_RULE_SLOT_INDEX_INPUT,BIT_RULE_SLOT_INDEX_INPUT_SHIFT);
    }

    function getRuleSlotIndexInput(Task memory self) internal view returns(uint16){
        return uint16(Bit.bitValue(self.value,BIT_RULE_SLOT_INDEX_INPUT,BIT_RULE_SLOT_INDEX_INPUT_SHIFT));
    }

    function setRuleSlotIndexOutput(Task memory self,uint16 ruleSlotIndexOutput) internal{
        self.value = Bit.bit(self.value,ruleSlotIndexOutput,BIT_RULE_SLOT_INDEX_OUTPUT,BIT_RULE_SLOT_INDEX_OUTPUT_SHIFT);
    }

    function getRuleSlotIndexOutput(Task memory self) internal view returns(uint16){
        return uint16(Bit.bitValue(self.value,BIT_RULE_SLOT_INDEX_OUTPUT,BIT_RULE_SLOT_INDEX_OUTPUT_SHIFT));
    }

    function setGroupInputBranch(Task memory self,uint8 groupInputBranch) internal{
        self.value = Bit.bit(self.value,groupInputBranch,BIT_GROUP_INPUT_BRANCH,BIT_GROUP_INPUT_BRANCH_SHIFT);
    }

    function getGroupInputBranch(Task memory self) internal view returns(uint8){
        return uint8(Bit.bitValue(self.value,BIT_GROUP_INPUT_BRANCH,BIT_GROUP_INPUT_BRANCH_SHIFT));
    }

    function setGroupInputRound(Task memory self,uint8 groupInputRound) internal{
        self.value = Bit.bit(self.value,groupInputRound,BIT_GROUP_INPUT_ROUND,BIT_GROUP_INPUT_ROUND_SHIFT);
    }

    function getGroupInputRound(Task memory self) internal view returns(uint8){
        return uint8(Bit.bitValue(self.value,BIT_GROUP_INPUT_ROUND,BIT_GROUP_INPUT_ROUND_SHIFT));
    }

    function setMultiple(Task memory self,uint32 multiple) internal{
        self.value = Bit.bit(self.value,multiple,BIT_MULTIPLE,BIT_MULTIPLE_SHIFT);
    }

    function getMultiple(Task memory self) internal view returns(uint32){
        return uint32(Bit.bitValue(self.value,BIT_MULTIPLE,BIT_MULTIPLE_SHIFT));
    }


    function getStartTime(Task memory self) internal returns(uint32){

        uint32 blockNumber = getBlockNumber(self);
        if(blockNumber == 0){
            return getTimestamp(self);
        }

        return getBlockNumber(self);
    }


    function setTimestamp(Task memory self,uint256 timestamp) internal{
        self.valueTime = Bit.bit(self.valueTime,timestamp,BIT_TIMESTAMP,BIT_TIMESTAMP_SHIFT);
    }

    function setTimestampStorage(Task storage self,uint256 timestamp) internal{
        self.valueTime = Bit.bit(self.valueTime,timestamp,BIT_TIMESTAMP,BIT_TIMESTAMP_SHIFT);
    }

    function setTimestampExecute(Task memory self,uint256 timestampExecute) internal{
        self.valueTime = Bit.bit(self.valueTime,timestampExecute,BIT_TIMESTAMP_EXECUTE,BIT_TIMESTAMP_EXECUTE_SHIFT);
    }

    function setTimestampExecuteStorage(Task storage self,uint256 timestampExecute) internal{
        self.valueTime = Bit.bit(self.valueTime,timestampExecute,BIT_TIMESTAMP_EXECUTE,BIT_TIMESTAMP_EXECUTE_SHIFT);
    }

    function setTimestampProcessed(Task memory self,uint256 timestampProcessed) internal{
        self.valueTime = Bit.bit(self.valueTime,timestampProcessed,BIT_TIMESTAMP_PROCESSED,BIT_TIMESTAMP_PROCESSED_SHIFT);
    }

    function setTimestampProcessedStorage(Task storage self,uint256 timestampProcessed) internal{
        self.valueTime = Bit.bit(self.valueTime,timestampProcessed,BIT_TIMESTAMP_PROCESSED,BIT_TIMESTAMP_PROCESSED_SHIFT);
    }

    function setTimestampDoneOrRevoked(Task memory self,uint256 timestampRevoked) internal{
        self.valueTime = Bit.bit(self.valueTime,timestampRevoked,BIT_TIMESTAMP_DONE_OR_REVOKED,BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT);
    }

    function setTimestampDoneOrRevokedStorage(Task storage self,uint256 timestampRevoked) internal{
        self.valueTime = Bit.bit(self.valueTime,timestampRevoked,BIT_TIMESTAMP_DONE_OR_REVOKED,BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT);
    }

    function setBlockNumber(Task memory self,uint256 blockNumber) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumber,BIT_BLOCK_NUMBER,BIT_BLOCK_NUMBER_SHIFT);
    }

    function setBlockNumberStorage(Task storage self,uint256 blockNumber) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumber,BIT_BLOCK_NUMBER,BIT_BLOCK_NUMBER_SHIFT);
    }

    function setBlockNumberExecute(Task memory self,uint256 blockNumberExecute) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumberExecute,BIT_BLOCK_NUMBER_EXECUTE,BIT_BLOCK_NUMBER_EXECUTE_SHIFT);
    }

    function setBlockNumberExecuteStorage(Task storage self,uint256 blockNumberExecute) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumberExecute,BIT_BLOCK_NUMBER_EXECUTE,BIT_BLOCK_NUMBER_EXECUTE_SHIFT);
    }

    function setBlockNumberProcessed(Task memory self,uint256 blockNumberProcessed) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumberProcessed,BIT_BLOCK_NUMBER_PROCESSED,BIT_BLOCK_NUMBER_PROCESSED_SHIFT);
    }

    function setBlockNumberProcessedStorage(Task storage self,uint256 blockNumberProcessed) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumberProcessed,BIT_BLOCK_NUMBER_PROCESSED,BIT_BLOCK_NUMBER_PROCESSED_SHIFT);
    }

    function setBlockNumberDoneOrRevoked(Task memory self,uint256 blockNumberRevoked) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumberRevoked,BIT_BLOCK_NUMBER_DONE_OR_REVOKED,BIT_BLOCK_NUMBER_DONE_OR_REVOKED_SHIFT);
    }

    function setBlockNumberDoneOrRevokedStorage(Task storage self,uint256 blockNumberRevoked) internal{
        self.valueTime = Bit.bit(self.valueTime,blockNumberRevoked,BIT_BLOCK_NUMBER_DONE_OR_REVOKED,BIT_BLOCK_NUMBER_DONE_OR_REVOKED_SHIFT);
    }

    function getTimestamp(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_TIMESTAMP,BIT_TIMESTAMP_SHIFT));
    }

    function getTimestampExecute(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_TIMESTAMP_EXECUTE,BIT_TIMESTAMP_EXECUTE_SHIFT));
    }

    function getTimestampProcessed(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_TIMESTAMP_PROCESSED,BIT_TIMESTAMP_PROCESSED_SHIFT));
    }

    function getTimestampDoneOrRevoked(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_TIMESTAMP_DONE_OR_REVOKED,BIT_TIMESTAMP_DONE_OR_REVOKED_SHIFT));
    }

    function getBlockNumber(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_BLOCK_NUMBER,BIT_BLOCK_NUMBER_SHIFT));
    }

    function getBlockNumberExecute(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_BLOCK_NUMBER_EXECUTE,BIT_BLOCK_NUMBER_EXECUTE_SHIFT));
    }

    function getBlockNumberProcessed(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_BLOCK_NUMBER_PROCESSED,BIT_BLOCK_NUMBER_PROCESSED_SHIFT));
    }

    function getBlockNumberDoneOrRevoked(Task memory self) internal returns(uint32){
        return uint32(Bit.bitValue(self.valueTime,BIT_BLOCK_NUMBER_DONE_OR_REVOKED,BIT_BLOCK_NUMBER_DONE_OR_REVOKED_SHIFT));
    }

}
