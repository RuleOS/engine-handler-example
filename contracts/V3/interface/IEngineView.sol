// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./IHandler.sol";

interface IEngineView {

    //get io addressList of each round
    function getInputAddressRound(address engine,address stateCounter,uint32 taskId,uint16 round) external view returns(address[] memory);
    function getOutputAddressRound(address engine,address stateCounter,uint32 taskId,uint16 round) external view returns(address[] memory);

    //get io branch of each round of every address
    function getInputAddressRoundBranch(address engine,address inAddress,address stateCounter,uint32 taskId,uint16 round) external view returns(uint8);
    function getOutputAddressRoundBranch(address engine,address outAddress,address stateCounter,uint32 taskId,bytes memory args,uint16 round) external view returns(uint8);

    //get in token list of outAddress of groupInputBranch
    function getBranchInputTokenList(address inAddress,address stateCounter,uint32 taskId, uint16 round, uint8 branch) external view returns(Token.TokenHandler[] memory);
    //get branch out token list of outAddress
    function getBranchOutputTokenList(address engine,address outAddress,address stateCounter,uint32 taskId,bytes memory args,uint16 round, uint8 branch) external view returns(Token.TokenHandler[] memory);

    //get claim state of every token of input and output
    function getClaimIOAddressBranchToken(IHandler.Claim memory claim) external view returns(bool);

    function swapQuoteTokenTemplate(Token.TokenTemplate memory tokenTemplate) external view returns(uint256[] memory);
}
