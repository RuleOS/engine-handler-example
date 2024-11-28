pragma solidity ^0.8.0;

import "../struct/Token.sol";
import "./IHandler.sol";

interface IEngine {

    event Receive(address from, uint256 value);
    event EventTask(
        address indexed caller,
        address clusterArea,
        uint32 indexed clusterId,
        address stateCounter,
        uint32 taskId,
        uint8 taskState,
        uint16 round,
        uint16 ioBranch,
        bytes args);

    function version() external pure returns (uint);

    function cname() external pure returns (string memory);

    function getPoolTokenInput() external returns(address);

    function getPoolFee() external returns(address);

    function pause(uint8 channel, bool _paused) external;

    function input(
        address clusterArea,
        uint32 clusterId,
        uint16 ruleSlotIndexInput,
        uint16 ruleSlotIndexOutput,
        uint8 groupInputBranch,
        address stateCounter,
        uint32 taskId,
        uint32 multiple,
        Token.Token[] memory inTokenList,
        bytes memory args
    ) payable external;

    function execute(address stateCounter, uint32 taskId, bytes memory args, uint16[] memory roundList) payable external;

    function claim(address stateCounter, uint32 taskId, bytes memory args, uint16[] memory roundList) payable external;

    function claimAddress(address stateCounter, uint32 taskId, bytes memory args, address outAddress, uint16[] memory roundList) payable external;

    function executeClaim(address stateCounter, uint32 taskId, bytes memory args, uint16[] memory roundList) payable external;

    function revoke(address stateCounter, uint32 taskId) payable external;

}
