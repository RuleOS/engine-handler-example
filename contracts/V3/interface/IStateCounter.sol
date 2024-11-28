// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Task.sol";
import "../struct/Handler.sol";

interface IStateCounter {

    function version() external pure returns(uint);

    function cname() external pure returns(string memory);

    function getCurrentTaskId() external view returns(uint256);

    function add(Task.Task memory task) external returns(uint32);

    function get(uint32 taskId) external view returns(Task.Task memory);

    function process(uint32 taskId,address lastHandler,uint8 state) external;

    function updateTime(uint32 taskId,uint32 state,uint32 timestamp,uint32 blockNumber) external;

    function updateExecuteDelayTime(uint32 taskId,int32 delayTime) external returns(uint32);
}
