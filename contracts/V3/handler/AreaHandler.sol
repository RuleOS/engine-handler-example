// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interface/IHandler.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


abstract contract AreaHandler is IHandler,OwnableUpgradeable{

    mapping(string => address) engineArea;

    modifier onlyEngineArea(string memory areaName) {
        require(msg.sender == engineArea[areaName],"sender not match area address");
        _;
    }
    function setEngineAreaList(address[] memory engineAreaList) public virtual override onlyOwner {
        for(uint i; i < engineAreaList.length;++i){
            engineArea[IVersion(engineAreaList[i]).cname()] = engineAreaList[i];
        }
    }

    function getEngineAreaList(string[] memory areaNameList) public virtual override returns (address[] memory){

        address[] memory areaAddressList = new address[](areaNameList.length);

        for(uint i = 0; i < areaAddressList.length; ++i){
            areaAddressList[i] = engineArea[areaNameList[i]];
        }

        return areaAddressList;
    }
}
