// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Constant.sol";

interface IClusterHandlerArea {

    event DeployerTransfer(address indexed deployer, address indexed newDeployer);

    struct Handler {
        uint32 id;
        string name;
        string description;
        address handler;
        address deployer;
        uint8 state;
        uint256 callCount;
    }

    function version() external pure returns(uint);

    function cname() external pure returns(string memory);

    function isAvailable(address handler) external view returns(bool exist);

    function get(address handler) external view returns(bool,Handler memory);

    function add(string memory name,string memory description, address handler) external;

    function updateState(address handler,uint8 state) external;

    function deployerTransfer(address handler,address newDeployer) external;
}
