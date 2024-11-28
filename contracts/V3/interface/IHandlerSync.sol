pragma solidity ^0.8.0;

uint8 constant HANDLER_SYNC_NO = 0;
uint8 constant HANDLER_SYNC_YES = 1;
uint8 constant HANDLER_SYNC_IDLE = 2;

interface IHandlerSync {

    function getSyncHashListLength() external view returns (uint);
    function getSyncHash(uint index) external view returns (bytes32);
    function getSyncHashList(uint beginIndex,uint endIndex) external view returns (bytes32[] memory);
    function getSyncHashListAll() external view returns (bytes32[] memory);

    function canSync(bytes32 hash) external view returns(uint8);
    function sync(bytes32 hash,uint stepCount) external;
}

