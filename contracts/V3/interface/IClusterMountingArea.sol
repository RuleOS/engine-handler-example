// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Token.sol";

interface IClusterMountingArea {

    function version() external pure returns(uint);
    function cname() external pure returns(string memory);


    function getTokenMountingList(uint32 clusterId,address token,uint256 tokenId) external view returns(Token.TokenMounting[] memory);

    function checkTokenMountingExist(uint32 clusterId,address token,uint256 tokenId,address tokenMountingAddress,uint256 tokenMountingId) external view returns(bool);

    function mountToken(address caller,uint32 clusterId,uint8 erc,address token,uint256 tokenId,Token.TokenMounting memory tokenMounting) external;

    function unmountToken(address caller,uint32 clusterId,uint8 erc,address token,uint256 tokenId,Token.TokenMounting memory tokenMounting) external returns(bool);


    }
