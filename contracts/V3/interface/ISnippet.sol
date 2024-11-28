// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Attribute.sol";
import "../struct/Token.sol";

interface ISnippet {

    struct TokenSnippet {
        uint8 erc; // 0 coin 1 erc20 2 erc721 3 erc1155
        address token;
        uint256 tokenId;//0 no change
        uint256 amount;//0 no change

        Attribute.AttributeOpt[] attributeOptList;
    }

    struct InitDelayParams {
        address caller;
        uint32 clusterId;
        uint8 inBranch;
        uint8 inRound;
        uint8 ruleDurationType;//timestamp or blockNumber
        uint32 ruleDelayTimestamp;//rule delay
        uint32 ruleDelayBlockNumber;//rule delay
        uint32 delayTimestamp; //cluster delay
        uint32 delayBlockNumber; //cluster delay
        Token.Token[] inTokenList;
    }

    struct ExecuteDelayParams {
        address caller;
        uint32 clusterId;
        uint8 inBranch;
        uint8 inRound;
        uint32 taskId;
    }

    struct TokenSlotDelayParams {
        address caller;
        uint32 clusterId;
        uint8 outBranch;
        uint32 taskId;
        uint256 random;
        uint8 tokenSlotIndex;
        uint8 erc;
        address token;
    }

    struct PreInputTokenParams {
        address caller;
        uint32 clusterId;
        uint8 inBranch;
        uint32 taskId;
        uint32 inTokenSlotIndex;
        Token.Token inToken;
    }

    struct InputTokenParams {
        address caller;
        uint32 clusterId;
        uint8 outBranch;
        uint32 taskId;
        uint32 inTokenSlotIndex;
        Token.Token inToken;
    }

    struct OutputTokenParams {
        address caller;
        uint32 clusterId;
        uint8 outBranch;
        uint32 taskId;
        uint256 random;
        uint32 outTokenSlotIndex;
        Token.Token outToken;
    }

    //do before task init, time to delay of rule
    function processInitDelayTime(InitDelayParams memory initDelay) external returns (int32);

    //do before task processed , after token inputted. time to be subtracted from executeTime of task
    function processExecuteDelayTime(ExecuteDelayParams memory executeDelay) external returns (int32);

    //do before token claimed, plus to doneOrRevoked time of task
    function processInputTokenSlotDelayTime(TokenSlotDelayParams memory tokenSlotDelay) external returns (int32);

    //do before token claimed, plus to doneOrRevoked time of task
    function processOutputTokenSlotDelayTime(TokenSlotDelayParams memory tokenSlotDelay) external returns (int32);

    //do before token inputted
    //inBranch : if task is processed twice consecutively, inBranch maybe different
    function preInputToken(PreInputTokenParams memory preInputToken) external returns (TokenSnippet memory);

    //do before token claimed
    function processInputToken(InputTokenParams memory inputToken) external returns (TokenSnippet memory);

    //do before token claimed
    function processOutputToken(OutputTokenParams memory outputToken) external returns (TokenSnippet memory);

}
