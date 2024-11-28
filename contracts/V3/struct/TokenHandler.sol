pragma solidity ^0.8.0;

import "../util/Bit.sol";
import "hardhat/console.sol";
import "./Constant.sol";

library TokenHandler {

    uint8 constant TOKEN_HANDLER_IN_BRANCH_PROCESS_FALSE = 0;
    uint8 constant TOKEN_HANDLER_IN_BRANCH_PROCESS_TRUE = 1;
    uint8 constant TOKEN_HANDLER_OUT_BRANCH_PROCESS_FALSE = 0;
    uint8 constant TOKEN_HANDLER_OUT_BRANCH_PROCESS_TRUE = 1;

    uint8 constant BIT_TOKEN_HANDLER_IN_BRANCH = 8;
    uint8 constant BIT_TOKEN_HANDLER_IN_BRANCH_SHIFT = 0;
    uint8 constant BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS = 4;
    uint8 constant BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS_SHIFT = BIT_TOKEN_HANDLER_IN_BRANCH + BIT_TOKEN_HANDLER_IN_BRANCH_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_OUT_BRANCH = 8;
    uint8 constant BIT_TOKEN_HANDLER_OUT_BRANCH_SHIFT = BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS + BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS = 4;
    uint8 constant BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS_SHIFT = BIT_TOKEN_HANDLER_OUT_BRANCH + BIT_TOKEN_HANDLER_OUT_BRANCH_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_OPT = 16;
    uint8 constant BIT_TOKEN_HANDLER_OPT_SHIFT = BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS + BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_TIMES = 24;
    uint8 constant BIT_TOKEN_HANDLER_TIMES_SHIFT = BIT_TOKEN_HANDLER_OPT + BIT_TOKEN_HANDLER_OPT_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_MULTIPLE = 32;
    uint8 constant BIT_TOKEN_HANDLER_MULTIPLE_SHIFT = BIT_TOKEN_HANDLER_TIMES + BIT_TOKEN_HANDLER_TIMES_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_TOKEN_CLAIM_INPUT = 32;
    uint8 constant BIT_TOKEN_HANDLER_TOKEN_CLAIM_INPUT_SHIFT = BIT_TOKEN_HANDLER_MULTIPLE + BIT_TOKEN_HANDLER_MULTIPLE_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_TOKEN_CLAIM_OUTPUT = 32;
    uint8 constant BIT_TOKEN_HANDLER_TOKEN_CLAIM_OUTPUT_SHIFT = BIT_TOKEN_HANDLER_TOKEN_CLAIM_INPUT + BIT_TOKEN_HANDLER_TOKEN_CLAIM_INPUT_SHIFT;
    uint8 constant BIT_TOKEN_HANDLER_TOKEN_COUNT = 8;
    uint8 constant BIT_TOKEN_HANDLER_TOKEN_COUNT_SHIFT = BIT_TOKEN_HANDLER_TOKEN_CLAIM_OUTPUT + BIT_TOKEN_HANDLER_TOKEN_CLAIM_OUTPUT_SHIFT;


    uint8 constant TOKEN_HANDLER_OPT_TIMES = 1;
    uint8 constant TOKEN_HANDLER_OPT_MULTIPLE = 2;
    uint8 constant TOKEN_HANDLER_OPT_RANDOM = 4;
    uint8 constant TOKEN_HANDLER_OPT_RATIO = 8;
    uint8 constant TOKEN_HANDLER_OPT_RATIO_DENOMINATOR = 16;
    uint8 constant TOKEN_HANDLER_OPT_TOKEN_COUNT = 32;

    //1  times 32bit
    //2  multiple 16bit
    //4  random valueList-256
    //8  ratio valueList-256
    //16 ratioDenominator valueList-256
    //32 tokenCount valueList-256

    struct TokenBranchParams {
        uint8 inBranch;
        uint8 inBranchProcess;
        uint8 outBranch;
        uint8 outBranchProcess;
        uint24 times;//intervalRoundCount summary
        uint32 multiple;//user input
        uint256 random;
        uint256 ratio;
        uint256 ratioDenominator;
        uint8 tokenCount;
        uint256[] tokenIdList;
        uint256[] tokenAmountList;
        uint8[] tokenIndexList;
        address[] outAddressList;
    }

    struct TokenBranch {
        //0 branch+operator+times+multiple 1-n operatorParams
        uint256[] valueList;
    }

    function getInBranch(TokenBranch memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_IN_BRANCH, BIT_TOKEN_HANDLER_IN_BRANCH_SHIFT));
    }

    function setInBranch(TokenBranch memory self, uint8 branch) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], branch, BIT_TOKEN_HANDLER_IN_BRANCH, BIT_TOKEN_HANDLER_IN_BRANCH_SHIFT);
    }

    function setInBranchStorage(TokenBranch storage self, uint8 branch) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], branch, BIT_TOKEN_HANDLER_IN_BRANCH, BIT_TOKEN_HANDLER_IN_BRANCH_SHIFT);
    }

    function getInBranchProcess(TokenBranch memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS, BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS_SHIFT));
    }

    function setInBranchProcess(TokenBranch memory self, uint8 branchProcess) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], branchProcess, BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS, BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS_SHIFT);
    }

    function setInBranchProcessStorage(TokenBranch storage self, uint8 branchProcess) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], branchProcess, BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS, BIT_TOKEN_HANDLER_IN_BRANCH_PROCESS_SHIFT);
    }

    function getOutBranch(TokenBranch memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_OUT_BRANCH, BIT_TOKEN_HANDLER_OUT_BRANCH_SHIFT));
    }

    function setOutBranch(TokenBranch memory self, uint8 branch) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], branch, BIT_TOKEN_HANDLER_OUT_BRANCH, BIT_TOKEN_HANDLER_OUT_BRANCH_SHIFT);
    }

    function getOutBranchProcess(TokenBranch memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS, BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS_SHIFT));
    }

    function setOutBranchProcess(TokenBranch memory self, uint8 branch) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], branch, BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS, BIT_TOKEN_HANDLER_OUT_BRANCH_PROCESS_SHIFT);
    }

    function getOpt(TokenBranch memory self) internal view returns (uint16){
        return uint16(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_OPT, BIT_TOKEN_HANDLER_OPT_SHIFT));
    }

    function setOpt(TokenBranch memory self, uint16 opt) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], opt, BIT_TOKEN_HANDLER_OPT, BIT_TOKEN_HANDLER_OPT_SHIFT);
    }

    function getTimes(TokenBranch memory self) internal view returns (uint24){
        return uint24(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_TIMES, BIT_TOKEN_HANDLER_TIMES_SHIFT));
    }

    function setTimes(TokenBranch memory self, uint24 opt) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], opt, BIT_TOKEN_HANDLER_TIMES, BIT_TOKEN_HANDLER_TIMES_SHIFT);
    }

    function getMultiple(TokenBranch memory self) internal view returns (uint32){
        return uint32(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_MULTIPLE, BIT_TOKEN_HANDLER_MULTIPLE_SHIFT));
    }

    function setMultiple(TokenBranch memory self, uint32 multiple) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], multiple, BIT_TOKEN_HANDLER_MULTIPLE, BIT_TOKEN_HANDLER_MULTIPLE_SHIFT);
    }

    function makeParams() internal view returns (TokenBranchParams memory){
        TokenBranchParams memory params;
        params.inBranch = 0;
        params.outBranch = 0;

        params.times = 10000;
        //user input
        params.multiple = 10000;
        params.random = 0;
        params.ratio = 10000;
        params.ratioDenominator = 10000;

        return params;
    }

    function getParams(TokenBranch memory self) internal view returns (TokenBranchParams memory){
        uint16 opt = getOpt(self);
        TokenBranchParams memory params = makeParams();
        params.inBranch = getInBranch(self);
        params.inBranchProcess = getInBranchProcess(self);
        params.outBranchProcess = getOutBranchProcess(self);
        params.outBranch = getOutBranch(self);
        params.tokenCount = getTokenCount(self);

        uint256 valueIndex = self.valueList.length - 1;
        //1 + 8 + 32 = 41
        while (true) {
            if (opt >= TOKEN_HANDLER_OPT_TOKEN_COUNT) {
                params.tokenIdList = new uint256[](params.tokenCount);
                params.tokenAmountList = new uint256[](params.tokenCount);
                params.tokenIndexList = new uint8[](params.tokenCount);
                params.outAddressList = new address[](params.tokenCount);
                for (uint i = params.tokenCount; i > 0;) {
                    params.outAddressList[--i] = address(uint160(self.valueList[valueIndex--]));
                    params.tokenIndexList[i] = uint8(self.valueList[valueIndex--]);
                    params.tokenAmountList[i] = self.valueList[valueIndex--];
                    params.tokenIdList[i] = self.valueList[valueIndex--];
                }
                opt -= TOKEN_HANDLER_OPT_TOKEN_COUNT;
            } else if (opt >= TOKEN_HANDLER_OPT_RATIO_DENOMINATOR) {
                params.ratioDenominator = self.valueList[valueIndex];
                opt -= TOKEN_HANDLER_OPT_RATIO_DENOMINATOR;
                valueIndex--;
            } else if (opt >= TOKEN_HANDLER_OPT_RATIO) {
                params.ratio = self.valueList[valueIndex];
                opt -= TOKEN_HANDLER_OPT_RATIO;
                valueIndex--;
            } else if (opt >= TOKEN_HANDLER_OPT_RANDOM) {
                params.random = self.valueList[valueIndex];
                opt -= TOKEN_HANDLER_OPT_RANDOM;
                valueIndex--;
            } else if (opt >= TOKEN_HANDLER_OPT_MULTIPLE) {
                params.multiple = getMultiple(self);
                if (params.multiple == 0) {
                    params.multiple = 10000;
                }

                opt -= TOKEN_HANDLER_OPT_MULTIPLE;
            } else if (opt >= TOKEN_HANDLER_OPT_TIMES) {
                params.times = getTimes(self);
                if (params.times == 0) {
                    params.times = 1;
                }
                opt -= TOKEN_HANDLER_OPT_TIMES;
            }

            if (opt == 0) {
                break;
            }
        }

        return params;
    }

    function setParams(TokenBranch memory self, TokenBranchParams memory params) internal {
        uint valueListLength = 1;
        if (params.random != 0) valueListLength++;
        if (params.ratio != 10000) valueListLength++;
        if (params.ratioDenominator != 10000) valueListLength++;
        if (params.tokenIdList.length != 0 || params.tokenAmountList.length != 0 || params.outAddressList.length != 0) {
            uint tokenCount = params.tokenIdList.length > params.tokenAmountList.length ? params.tokenIdList.length
            : params.tokenAmountList.length > params.outAddressList.length ? params.tokenAmountList.length : params.outAddressList.length;
            valueListLength += tokenCount * 4;//tokenIdList tokenAmountList tokenIndexList params.outAddressList
            params.tokenCount = uint8(tokenCount);
        }
        console.log("------------ tokenHandler setParams tokenCount", params.tokenCount);

        self.valueList = new uint256[](valueListLength);

        setInBranch(self, params.inBranch);
        setInBranchProcess(self, params.inBranchProcess);
        setOutBranchProcess(self, params.outBranchProcess);
        setOutBranch(self, params.outBranch);
        setTokenCount(self, params.tokenCount);

        console.log("------------ tokenHandler setParams 1");

        uint16 opt = 0;
        uint256 valueIndex = 1;

        if (params.times != 10000) {
            setTimes(self, params.times);
            opt += TOKEN_HANDLER_OPT_TIMES;
        }

        if (params.multiple != 10000) {
            setMultiple(self, params.multiple);
            opt += TOKEN_HANDLER_OPT_MULTIPLE;
        }

        if (params.random != 0) {
            self.valueList[valueIndex++] = params.random;
            opt += TOKEN_HANDLER_OPT_RANDOM;
        }

        if (params.ratio != 10000) {
            self.valueList[valueIndex++] = params.ratio;
            opt += TOKEN_HANDLER_OPT_RATIO;
        }

        if (params.ratioDenominator != 10000) {
            self.valueList[valueIndex++] = params.ratioDenominator;
            opt += TOKEN_HANDLER_OPT_RATIO_DENOMINATOR;
        }

        if (params.tokenCount != 0) {
            for (uint i; i < params.tokenCount; ++i) {
                if(params.tokenIdList.length > 0 && i < params.tokenIdList.length){
                    self.valueList[valueIndex++] = params.tokenIdList[i];
                }
                else {
                    self.valueList[valueIndex++] = 0;
                }

                if(params.tokenAmountList.length > 0 && i < params.tokenAmountList.length){
                    self.valueList[valueIndex++] = params.tokenAmountList[i];
                }
                else {
                    self.valueList[valueIndex++] = 0;
                }

                if(params.tokenIndexList.length > 0 && i < params.tokenIndexList.length){
                    self.valueList[valueIndex++] = params.tokenIndexList[i];
                }
                else {
                    self.valueList[valueIndex++] = i;
                }

                if(params.outAddressList.length > 0 && i < params.outAddressList.length){
                    self.valueList[valueIndex++] = uint256(uint160(params.outAddressList[i]));
                }
                else {
                    self.valueList[valueIndex++] = 0;
                }

            }

            opt += TOKEN_HANDLER_OPT_TOKEN_COUNT;

            console.log("------------ tokenHandler setParams tokenCount self.valueList.length", self.valueList.length);
        }

        setOpt(self, opt);
    }

    function isTokenIndexIn(TokenBranchParams memory params,uint256 tokenIndex) internal view returns (bool){

        if(params.tokenCount == 0){
            return true;
        }

        for(uint i; i < params.tokenCount; ++i){
            if(params.tokenIndexList[i] == tokenIndex){
                return true;
            }
        }
        return false;
    }

    function getOutAddress(TokenBranchParams memory params,uint256 tokenIndex) internal view returns (address){

        if(tokenIndex < params.outAddressList.length){
            return params.outAddressList[tokenIndex];
        }

        return ZERO_ADDRESS;
    }

    //tokenSlotIndex < 32
    function getClaimInput(TokenBranch memory self, uint8 tokenSlotIndex) internal view returns (bool){
        return Bit.bitValue(self.valueList[0], 1, BIT_TOKEN_HANDLER_TOKEN_CLAIM_INPUT_SHIFT + tokenSlotIndex) == 1;
    }

    function setClaimInput(TokenBranch storage self, uint8 tokenSlotIndex) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], 1, 1, BIT_TOKEN_HANDLER_TOKEN_CLAIM_INPUT_SHIFT + tokenSlotIndex);
    }
    //tokenSlotIndex < 32
    function getClaimOutput(TokenBranch memory self, uint8 tokenSlotIndex) internal view returns (bool){
        return Bit.bitValue(self.valueList[0], 1, BIT_TOKEN_HANDLER_TOKEN_CLAIM_OUTPUT_SHIFT + tokenSlotIndex) == 1;
    }

    function setClaimOutput(TokenBranch storage self, uint8 tokenSlotIndex) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], 1, 1, BIT_TOKEN_HANDLER_TOKEN_CLAIM_OUTPUT_SHIFT + tokenSlotIndex);
    }

    function getTokenCount(TokenBranch memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_HANDLER_TOKEN_COUNT, BIT_TOKEN_HANDLER_TOKEN_COUNT_SHIFT));
    }

    function setTokenCount(TokenBranch memory self, uint8 tokenCount) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], tokenCount, BIT_TOKEN_HANDLER_TOKEN_COUNT, BIT_TOKEN_HANDLER_TOKEN_COUNT_SHIFT);
    }

}
