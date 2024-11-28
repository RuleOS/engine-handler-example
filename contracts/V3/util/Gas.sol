// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./StringUtil.sol";

contract Gas {

    uint256 gasLeftLast;

    function gasBegin() internal{
        if(gasLeftLast == 0){
            gasLeftLast = 20000000;
        }
        gasLeftLast = gasleft();
    }

    function gas(string memory name) internal{

        console.log("=---------- gas ",name);

    }

}
