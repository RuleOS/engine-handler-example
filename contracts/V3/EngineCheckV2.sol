// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./struct/Token.sol";
import "./struct/Constant.sol";
import "./util/Transfer.sol";
import "./interface/IClusterRuleArea.sol";
import "./interface/IClusterAttributeAreaToken.sol";
import "./interface/IClusterHandlerArea.sol";
import "./interface/IClusterArea.sol";
import "./interface/ISnippet.sol";
import "./interface/IHandler.sol";

library EngineCheckV2 {

    using Rule for Rule.TokenSlot;
    using Token for Token.TokenTemplate;

    function checkInputToken(address caller,Token.Token memory memToken,uint16 multiple) internal{
        Transfer.checkBalance(
            msg.sender,
            memToken.erc,
            memToken.token,
            memToken.id,
            memToken.amount,
            multiple
        );
    }

    function checkInputTokenAttr(address clusterArea,uint32 clusterId,Token.Token memory memToken,Token.TokenTemplate memory stdToken) public{
        Attribute.AttributeRange[] memory attributeExistList = stdToken.getAttributeExistRangeList();
        if(attributeExistList.length > 0){
            for(uint i ; i < attributeExistList.length; ++i){
                Attribute.AttributeRange memory attrRange = attributeExistList[i];
                Attribute.AttributeOptEx memory attrOpt;
                if(attrRange.attrOpt == ATTRIBUTE_OPT_EXIST)
                    attrOpt = IClusterAttributeAreaToken(IClusterArea(clusterArea).getClusterAttributeAreaToken()).getClusterTokenAttrOpt(clusterId,memToken.token,memToken.id,0,attrRange.attrId);
                else if(attrRange.attrOpt == ATTRIBUTE_OPT_TOKEN_EXIST)
                    attrOpt = IClusterAttributeAreaToken(IClusterArea(clusterArea).getClusterAttributeAreaToken()).getClusterTokenAttrOpt(0,memToken.token,memToken.id,0,attrRange.attrId);

                if(attrOpt.attrAmount < attrRange.amountBegin || attrOpt.attrAmount > attrRange.amountEnd){
                    require(false,S.cs2("_checkIn exist check not in range. attrId",S.u2s(attrRange.attrId)));
                }
            }
        }
    }

}
