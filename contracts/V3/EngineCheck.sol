// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./struct/Token.sol";
import "./struct/Constant.sol";
import "./util/Transfer.sol";
import "./interface/IClusterRuleArea.sol";
import "./interface/IClusterMountingArea.sol";
import "./interface/IClusterAttributeAreaToken.sol";
import "./interface/IClusterHandlerArea.sol";
import "./interface/IClusterArea.sol";
import "./interface/ISnippet.sol";
import "./interface/IHandler.sol";

library EngineCheck {

    using Rule for Rule.TokenSlot;
    using Token for Token.TokenTemplate;

    function checkInputToken(Token.Token memory memToken,uint32 multiple) internal{
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

        console.log("-----checkInputTokenAttr");

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
                    console.log("-----_checkIn attrAmount",uint40(attrOpt.attrAmount));
                    console.log("-----_checkIn amountBegin",uint40(attrRange.amountBegin));
                    console.log("-----_checkIn amountEnd",uint40(attrRange.amountEnd));
                    require(false,S.cs2("_checkIn exist check not in range. attrId",S.u2s(attrRange.attrId)));
                }
            }
        }
    }

    function checkMountingToken(Token.TokenTemplate memory stdToken, uint16 round, uint inTokenIndex, Handler.Pre memory paramPre, uint tokenSlotListLength) public {
        console.log("-----checkMountingToken inTokenIndex", inTokenIndex);

        Token.Token memory memToken = paramPre.inTokenList[inTokenIndex];

        uint8 mountingTokenSlotIndex = stdToken.getMountingTokenSlotIndex();

        console.log("-----checkMountingToken mountingTokenSlotIndex", mountingTokenSlotIndex);

        Token.Token memory hostToken = paramPre.inTokenList[round * tokenSlotListLength + mountingTokenSlotIndex];

        bool exist = IClusterMountingArea(IClusterArea(paramPre.clusterArea).getClusterMountingArea())
        .checkTokenMountingExist(paramPre.clusterId, hostToken.token, hostToken.id, memToken.token, memToken.id);

        if (!exist) {
            require(false, S.cs3("checkMountingToken mounting relation not exist", S.u2s(inTokenIndex), S.u2s(mountingTokenSlotIndex)));
        }
    }

}
