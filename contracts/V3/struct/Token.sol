// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../util/StringUtil.sol";
import "../struct/Constant.sol";
import "hardhat/console.sol";
import "../util/Arrays.sol";
import "../util/Bit.sol";
import "./Attribute.sol";

library Token {
    function ercToString(uint8 erc) internal view returns (string memory) {
        if (erc == TOKEN_ERC_COIN) return "Coin";
        if (erc == TOKEN_ERC_ERC20) return "ERC20";
        if (erc == TOKEN_ERC_ERC721) return "ERC721";
        if (erc == TOKEN_ERC_ERC1155) return "ERC1155";
        return "Empty";
    }

    uint8 constant BIT_TOKEN_TEMPLATE_TYPE = 4;
    uint8 constant BIT_TOKEN_TEMPLATE_TYPE_SHIFT = 0;
    uint8 constant BIT_TOKEN_TEMPLATE_ID_REQUIRED = 4;
    uint8 constant BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_TYPE + BIT_TOKEN_TEMPLATE_TYPE_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ID_COUNT = 16;
    uint8 constant BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_ID_REQUIRED + BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED = 2;
    uint8 constant BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_ID_COUNT + BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED = 4;
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED + BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_COUNT = 2;
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED + BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED = 2;
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_AMOUNT_COUNT + BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED = 4;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED + BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT = 16;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED + BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX = 8;
    uint8 constant BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT + BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED = 2;
    uint8 constant BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT = BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX + BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ALLOCATION_ID = 16;
    uint8 constant BIT_TOKEN_TEMPLATE_ALLOCATION_ID_SHIFT = BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED + BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT = 8;
    uint8 constant BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT = BIT_TOKEN_TEMPLATE_ALLOCATION_ID + BIT_TOKEN_TEMPLATE_ALLOCATION_ID_SHIFT;
    // 103(1000) 102(100) 101(10) 0 (1) 1 (0.1) 2(0.01) 3(0.001)... 18(0.0...01)
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION = 8;
    uint8 constant BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION_SHIFT = BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT + BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT;



    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH = 8;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT = 0;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID = 32;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH + BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT = 4;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID + BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE = 4;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT + BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN = 40;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE + BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END = 40;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN + BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID = 32;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END + BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA = 32;
    uint8 constant BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA_SHIFT = BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID + BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT;


    /*
      721 autoid increment mint : id = 0 ,idEnd = 0
      721 mint id : 0 < id < idEnd
      721 mint : idList

      1155 mint random id : 0 < id < idEnd
      1155 mint random: idList

      amount = 0 , mint (0,100)
    */
    struct TokenTemplate {
        uint8 erc; // 0 coin 1 erc20 2 erc721 3 erc1155
        address token;
        uint256[] valueList;

        //(u) unrequired
        //ERC20/COIN   [type,amount,amountEnd,   amountFormula(u),swapRouter01(u),tokenB(u),outAddress(u),functionTarget(u),functionValue(u),functionData(u)]
        //ERC721  [type,idIndex,id,idEnd,   idFormula(u),amount(u),amountEnd(u),amountFormula(u),attr1(u),attr2(u),outAddress(u),functionTarget(u),functionValue(u),functionData(u)]
        //ERC721  [type,idIndex,id1,id2,id3,idFormula(u),amount(u),amountEnd(u),amountFormula(u),attr1(u),attr2(u),attr3(u),outAddress(u),functionTarget(u),functionValue(u),functionData(u)]
        //ERC1155 [type,idIndex,amount,amountEnd,id,idEnd,   idFormula(u),amountFormula(u),attr1(u),outAddress(u),functionTarget(u),functionValue(u),functionData(u)]
        //ERC1155 [type,idIndex,amount,amountEnd,id1,id2,id3,idFormula(u),amountFormula(u),attr1(u),attr2(u),outAddress(u),functionTarget(u),functionValue(u),functionData(u)]

        //attr1
        //[formula][parentAttrId][amtEnd][amtBegin][type][opt][attrId][branch]
        //[32]     [32]          [40]    [40]      [8]   [8]  [32]    [8]

        // uint256 idIndex;//index for minting or transferring of erc721
        // uint256 id; //begin id or specific id
        // uint256 idEnd;
        // uint256[] idList;
        // uint256 amount; // begin amount or specific amount
        // uint256 amountEnd;
    }

    struct Token {
        uint8 erc; // 0 coin 1 erc20 2 erc721 3 erc1155
        address token;
        uint256 id;//begin id or specific id
        uint256 amount;// begin amount or specific amount

        Attribute.AttributeIn[] attrInList;
    }

    struct TokenMounting {
        uint8 erc;
        address token;
        uint256 id;
        uint256 amount;
    }

    struct TokenHandler {
        uint256 id;
        uint256 amount;
        uint256 idIndex;//ERC721 ERC1155 index
    }

    function getIdIndex(TokenTemplate memory self) internal view returns (uint256){
        if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
            return 0;
        }
        return self.valueList[1];
    }

    function setIdIndex(TokenTemplate storage self, uint256 idIndex) internal {
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            self.valueList[1] = idIndex;
        }
    }

    function getAmountRange(TokenTemplate memory self) internal view returns (uint256[] memory){
        uint256[] memory amountRange = new uint256[](2);
        if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
            amountRange[0] = self.valueList[1];
            amountRange[1] = self.valueList[2];
        } else if (self.erc == TOKEN_ERC_ERC1155) {//ERC1155
            amountRange[0] = self.valueList[2];
            amountRange[1] = self.valueList[3];
        } else if (self.erc == TOKEN_ERC_ERC721) {
            uint8 amountCount = getAmountCount(self);
            if (amountCount == 2) {
                uint16 idCount = getIdCount(self);
                uint8 idFormulaRequired = getIdFormulaRequired(self);
                amountRange[0] = self.valueList[2 + idCount + idFormulaRequired];
                amountRange[1] = self.valueList[3 + idCount + idFormulaRequired];
            }
        }
        return amountRange;
    }

    function setAmountRange(TokenTemplate memory self, uint256[] memory amountRange) internal {
        if (getAmountRequired(self) == TOKEN_TEMPLATE_AMOUNT_REQUIRED_FALSE) {
            return;
        }
        if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
            self.valueList[1] = amountRange[0];
            self.valueList[2] = amountRange[1];
        } else if (self.erc == TOKEN_ERC_ERC1155) {//ERC1155
            self.valueList[2] = amountRange[0];
            self.valueList[3] = amountRange[1];
        } else if (self.erc == TOKEN_ERC_ERC721) {
            uint16 idCount = getIdCount(self);
            uint8 idFormulaRequired = getIdFormulaRequired(self);
            self.valueList[2 + idCount + idFormulaRequired] = amountRange[0];
            self.valueList[3 + idCount + idFormulaRequired] = amountRange[1];
        }
    }

    function getAmountFormula(TokenTemplate memory self) internal view returns (bytes4){
        uint8 amountFormulaRequired = getAmountFormulaRequired(self);
        if (amountFormulaRequired == TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_TRUE) {
            if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
                return bytes4(uint32(self.valueList[3]));
            } else if (self.erc == TOKEN_ERC_ERC721) {
                uint16 idCount = getIdCount(self);
                uint8 idFormulaRequired = getIdFormulaRequired(self);
                uint8 amountCount = getAmountCount(self);
                return bytes4(uint32(self.valueList[2 + idCount + idFormulaRequired + amountCount]));
            } else if (self.erc == TOKEN_ERC_ERC1155) {
                uint16 idCount = getIdCount(self);
                uint8 idFormulaRequired = getIdFormulaRequired(self);
                return bytes4(uint32(self.valueList[4 + idCount + idFormulaRequired]));
            }
        }

        return bytes4(0);
    }

    function setAmountFormula(TokenTemplate memory self, bytes4 amountFormula) internal {
        uint8 amountFormulaRequired = getAmountFormulaRequired(self);
        if (amountFormulaRequired == TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_TRUE) {
            if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
                self.valueList[3] = uint32(amountFormula);
            } else if (self.erc == TOKEN_ERC_ERC721) {
                uint16 idCount = getIdCount(self);
                uint8 idFormulaRequired = getIdFormulaRequired(self);
                uint8 amountCount = getAmountCount(self);
                self.valueList[2 + idCount + idFormulaRequired + amountCount] = uint32(amountFormula);
            } else if (self.erc == TOKEN_ERC_ERC1155) {
                uint16 idCount = getIdCount(self);
                uint8 idFormulaRequired = getIdFormulaRequired(self);
                self.valueList[4 + idCount + idFormulaRequired] = uint32(amountFormula);
            }
        }
    }


    function getIdRange(TokenTemplate memory self) internal view returns (uint256[] memory){
        uint256[] memory idRange = new uint256[](2);
        if (self.erc == TOKEN_ERC_ERC721) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_RANGE) {
                idRange[0] = self.valueList[2];
                idRange[1] = self.valueList[3];
            }
        } else if (self.erc == TOKEN_ERC_ERC1155) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_RANGE) {
                idRange[0] = self.valueList[4];
                idRange[1] = self.valueList[5];
            }
        }
        return idRange;
    }

    function getIdList(TokenTemplate memory self) internal view returns (uint256[] memory){
        if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
            return new uint256[](0);
        } else if (self.erc == TOKEN_ERC_ERC721) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_LIST) {
                uint16 idCount = getIdCount(self);
                uint256[] memory idList = new uint256[](idCount);
                for (uint256 i; i < idCount; i++)
                    idList[i] = self.valueList[i + 2];
                return idList;
            }
        } else if (self.erc == TOKEN_ERC_ERC1155) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_LIST) {
                uint16 idCount = getIdCount(self);
                uint256[] memory idList = new uint256[](idCount);
                for (uint256 i; i < idCount; i++)
                    idList[i] = self.valueList[i + 4];
                return idList;
            }
        }

        return new uint256[](0);
    }

    function getIdFormula(TokenTemplate memory self) internal view returns (bytes4){
        uint8 idFormulaRequired = getIdFormulaRequired(self);
        if (idFormulaRequired == TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_TRUE) {
            if (self.erc == TOKEN_ERC_ERC721) {
                uint16 idCount = getIdCount(self);
                return bytes4(uint32(self.valueList[2 + idCount]));
            } else if (self.erc == TOKEN_ERC_ERC1155) {
                uint16 idCount = getIdCount(self);
                return bytes4(uint32(self.valueList[4 + idCount]));
            }
        }

        return bytes4(0);
    }

    function setIdFormula(TokenTemplate memory self, bytes4 idFormula) internal {
        uint8 idFormulaRequired = getIdFormulaRequired(self);
        if (idFormulaRequired == TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_TRUE) {
            if (self.erc == TOKEN_ERC_ERC721) {
                uint16 idCount = getIdCount(self);
                self.valueList[2 + idCount] = uint32(idFormula);
            } else if (self.erc == TOKEN_ERC_ERC1155) {
                uint16 idCount = getIdCount(self);
                self.valueList[4 + idCount] = uint32(idFormula);
            }
        }
    }

    //this base on the id list is in order
    function searchId(TokenTemplate memory self, uint256 findingId) internal view returns (int){

        if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
            return - 1;
        } else if (self.erc == TOKEN_ERC_ERC1155) {//ERC 1155
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_LIST) {
                uint16 idCount = getIdCount(self);
                uint256 templateType = self.valueList[0];
                uint256 idIndex = self.valueList[1];
                uint256 amount = self.valueList[2];
                uint256 amountEnd = self.valueList[3];

                self.valueList[0] = 0;
                self.valueList[1] = 0;
                self.valueList[2] = 0;
                self.valueList[3] = 0;

                uint256 index = Arrays.findUpperBound(self.valueList, 4 + idCount, findingId);

                self.valueList[0] = templateType;
                self.valueList[1] = idIndex;
                self.valueList[2] = amount;
                self.valueList[3] = amountEnd;

                int found = - 1;
                if (self.valueList[index] == findingId) {
                    found = int(index - 4);
                }

                console.log("------------- ERC1155 Token binary search token", self.token);
                console.log("------------- ERC1155 Token binary search findingId", findingId);
                console.log("------------- ERC1155 Token binary search find index", index);
                console.log("------------- ERC1155 Token binary search find value[index]", self.valueList[index]);
                console.log("------------- ERC1155 Token binary search find found", uint256(found));
                return found;
            }
            return - 1;
        } else if (self.erc == TOKEN_ERC_ERC721) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_LIST) {
                uint16 idCount = getIdCount(self);
                uint256 templateType = self.valueList[0];
                uint256 idIndex = self.valueList[1];

                self.valueList[0] = 0;
                self.valueList[1] = 0;

                uint256 index = Arrays.findUpperBound(self.valueList, 2 + idCount, findingId);

                self.valueList[0] = templateType;
                self.valueList[1] = idIndex;

                int found = - 1;
                if (self.valueList[index] == findingId) {
                    found = int(index - 4);
                }

                console.log("------------- ERC721 Token binary search token", self.token);
                console.log("------------- ERC721 Token binary search findingId", findingId);
                console.log("------------- ERC721 Token binary search find index", index);
                console.log("------------- ERC721 Token binary search find value[index]", self.valueList[index]);
                console.log("------------- ERC721 Token binary search find found", uint256(found));
                return found;
            }
            return - 1;
        }

        return - 1;
    }


    function getIdListLength(TokenTemplate memory self) internal view returns (uint256){
        if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
            return 0;
        } else if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_LIST) {
                uint16 idCount = getIdCount(self);
                return idCount;
            }
            return 0;
        }
        return 0;
    }

    function getId(TokenTemplate memory self, uint256 index) internal view returns (uint256){
        if (self.erc == TOKEN_ERC_COIN || self.erc == TOKEN_ERC_ERC20) {
            return 0;
        } else if (self.erc == TOKEN_ERC_ERC721) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_LIST) {
                uint16 idCount = getIdCount(self);
                if (index < idCount)
                    return self.valueList[index + 2];
            }
        } else if (self.erc == TOKEN_ERC_ERC1155) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_ID_LIST) {
                uint16 idCount = getIdCount(self);
                if (index < idCount)
                    return self.valueList[index + 4];
            }
        }
        return 0;
    }

    function setType(TokenTemplate memory self, uint8 templateType) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], templateType, BIT_TOKEN_TEMPLATE_TYPE, BIT_TOKEN_TEMPLATE_TYPE_SHIFT);
    }

    function getType(TokenTemplate memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_TYPE, BIT_TOKEN_TEMPLATE_TYPE_SHIFT));
    }

    function setIdRequired(TokenTemplate memory self, uint8 idRequired) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], idRequired, BIT_TOKEN_TEMPLATE_ID_REQUIRED, BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT);
    }

    function getIdRequired(TokenTemplate memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_ID_REQUIRED, BIT_TOKEN_TEMPLATE_ID_REQUIRED_SHIFT));
    }

    function setIdCount(TokenTemplate memory self, uint16 idCount) internal {
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            self.valueList[0] = Bit.bit(self.valueList[0], idCount, BIT_TOKEN_TEMPLATE_ID_COUNT, BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT);
        }
    }

    function getIdCount(TokenTemplate memory self) internal view returns (uint16){
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            return uint16(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_ID_COUNT, BIT_TOKEN_TEMPLATE_ID_COUNT_SHIFT));
        }
        return 0;
    }

    function setIdFormulaRequired(TokenTemplate memory self, uint8 required) internal {
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            self.valueList[0] = Bit.bit(self.valueList[0], required, BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT);
        }
    }

    function getIdFormulaRequired(TokenTemplate memory self) internal view returns (uint8){
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_ID_FORMULA_REQUIRED_SHIFT));
        }
        return 0;
    }

    function setAmountRequired(TokenTemplate memory self, uint8 amountRequired) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], amountRequired, BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT);
    }

    function getAmountRequired(TokenTemplate memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_REQUIRED_SHIFT));
    }

    function setAmountCount(TokenTemplate memory self, uint8 amountCount) internal {
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            self.valueList[0] = Bit.bit(self.valueList[0], amountCount, BIT_TOKEN_TEMPLATE_AMOUNT_COUNT, BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT);
        }
    }

    function getAmountCount(TokenTemplate memory self) internal view returns (uint8){
        if (self.erc == TOKEN_ERC_ERC721) {
            return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_COUNT, BIT_TOKEN_TEMPLATE_AMOUNT_COUNT_SHIFT));
        }
        return 2;
    }

    function setAmountPrecision(TokenTemplate memory self, uint8 amountPrecision) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], amountPrecision, BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION, BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION_SHIFT);
    }

    function getAmountPrecision(TokenTemplate memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION, BIT_TOKEN_TEMPLATE_AMOUNT_PRECISION_SHIFT));
    }


    function setAmountFormulaRequired(TokenTemplate memory self, uint8 required) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], required, BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT);
    }

    function getAmountFormulaRequired(TokenTemplate memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED, BIT_TOKEN_TEMPLATE_AMOUNT_FORMULA_REQUIRED_SHIFT));
    }

    function setAttributeRequired(TokenTemplate memory self, uint8 attributeRequired) internal {
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            self.valueList[0] = Bit.bit(self.valueList[0], attributeRequired, BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED, BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT);
        }
    }

    function getAttributeRequired(TokenTemplate memory self) internal view returns (uint8){
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED, BIT_TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_SHIFT));
        }
        return 0;
    }

    function setAttributeCount(TokenTemplate memory self, uint16 attributeCount) internal {
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            self.valueList[0] = Bit.bit(self.valueList[0], attributeCount, BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT);
        }
    }

    function getAttributeCount(TokenTemplate memory self) internal view returns (uint16){
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            return uint16(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_COUNT_SHIFT));
        }
        return 0;
    }

    function setMountingTokenSlotIndex(TokenTemplate memory self, uint8 mountingTokenSlotIndex) internal {
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            self.valueList[0] = Bit.bit(self.valueList[0], mountingTokenSlotIndex, BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX, BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT);
        }
    }

    function getMountingTokenSlotIndex(TokenTemplate memory self) internal view returns (uint8){
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX, BIT_TOKEN_TEMPLATE_MOUNTING_TOKEN_SLOT_INDEX_SHIFT));
        }
        return 0;
    }

    function setOutAddressRequired(TokenTemplate memory self, uint8 outAddressRequired) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], outAddressRequired, BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED, BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT);
    }

    function getOutAddressRequired(TokenTemplate memory self) internal view returns (uint8){
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED, BIT_TOKEN_TEMPLATE_OUT_ADDRESS_REQUIRED_SHIFT));
    }

    function setFunctionPartCount(TokenTemplate memory self,uint8 functionPartCount) internal {
        self.valueList[0] = Bit.bit(self.valueList[0], functionPartCount, BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT, BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT);
    }

    function getFunctionPartCount(TokenTemplate memory self) internal view returns (uint8) {
        return uint8(Bit.bitValue(self.valueList[0], BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT, BIT_TOKEN_TEMPLATE_FUNCTION_PART_COUNT_SHIFT));
    }

    function getFunction(TokenTemplate memory self) internal view returns (address,uint256,bytes memory) {

        uint256 offset;
        if (self.erc == TOKEN_ERC_ERC20 || self.erc == TOKEN_ERC_COIN) {
            uint8 templateType = getType(self);
            uint8 amountFormulaRequired = getAmountFormulaRequired(self);
            uint8 outAddressRequired = getOutAddressRequired(self);

            if (templateType == TOKEN_TEMPLATE_TYPE_SWAP_V2) {
                offset = 5 + amountFormulaRequired + outAddressRequired;
            } else {
                offset = 3 + amountFormulaRequired + outAddressRequired;
            }
        } else if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            offset = 2 + getIdCount(self) + getAmountCount(self) + getIdFormulaRequired(self) + getAmountFormulaRequired(self) + getAttributeCount(self) + getOutAddressRequired(self);
        }

        uint256 uAddr = self.valueList[offset];
        address target = address(uint160(uAddr));

        uint256 value = self.valueList[offset+1];

        uint8 partCount = getFunctionPartCount(self);
        console.log("---------- FunctionPartCount",partCount);

        uint256[] memory arr = new uint256[](partCount-2);
        for (uint256 i = 2; i < partCount; ++i) {
            arr[i-2] = self.valueList[offset + i];
        }

        console.log("---------- FunctionPartCount arr",arr.length);

        return (target,value,abi.encodePacked(arr));
    }

    function getAttributeRangeList(TokenTemplate memory self, uint256 branch) internal view returns (Attribute.AttributeRange[] memory) {
        Attribute.AttributeRange[] memory attributeRangeList;
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            uint16 attributeCount = getAttributeCount(self);
            uint256 offset = 2 + getIdCount(self) + getAmountCount(self) + getIdFormulaRequired(self) + getAmountFormulaRequired(self);

            uint256 count;
            uint256 defaultBranch;
            if (branch != ATTRIBUTE_RANGE_BRANCH_ALL) {
                for (uint256 i; i < attributeCount; ++i) {
                    uint256 attribute = self.valueList[offset + i];
                    uint8 attrBranch = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT));
                    uint8 attrOpt = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT));

                    console.log("-------- getAttributeRangeList for i attrOpt", attrOpt);

                    if (attrOpt == ATTRIBUTE_OPT_EXIST || attrOpt == ATTRIBUTE_OPT_TOKEN_EXIST) {
                        continue;
                    }

                    //branch no match anyone , use default attrBranch = 0
                    if (attrBranch == 0 && defaultBranch == 0) {
                        count ++;
                    }

                    if (attrBranch == branch && branch > 0) {
                        if (defaultBranch == 0) {
                            count = 0;
                            defaultBranch = branch;
                        }
                        count++;
                    }

                }
            } else {
                count = attributeCount;
            }

            attributeRangeList = new Attribute.AttributeRange[](count);
            uint256 index = 0;
            console.log("-------- getAttributeRangeList attributeCount", attributeCount);
            console.log("-------- getAttributeRangeList count", count);
            console.log("-------- getAttributeRangeList branch", branch);
            console.log("-------- getAttributeRangeList defaultBranch", defaultBranch);
            console.log("-------- getAttributeRangeList offset", offset);
            for (uint256 i; i < attributeCount; ++i) {
                uint256 attribute = self.valueList[offset + i];
                uint8 attrBranch = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT));
                console.log("-------- getAttributeRangeList attrBranch", attrBranch);

                uint8 attrOpt = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT));
                console.log("-------- getAttributeRangeList attrOpt", attrOpt);
                if (branch != ATTRIBUTE_RANGE_BRANCH_ALL && (attrOpt == ATTRIBUTE_OPT_EXIST || attrOpt == ATTRIBUTE_OPT_TOKEN_EXIST)) {
                    continue;
                }

                //branch no match anyone , use default attrBranch = 0
                if (attrBranch == defaultBranch || branch == ATTRIBUTE_RANGE_BRANCH_ALL) {
                    Attribute.AttributeRange memory attrRange;
                    attrRange.attrId = uint32(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT));
                    attrRange.attrOpt = attrOpt;
                    attrRange.attrType = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE, BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT));
                    attrRange.amountBegin = int40(uint40(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT)));
                    attrRange.amountEnd = int40(uint40(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT)));
                    attrRange.parentAttrId = uint32(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT));
                    attrRange.formula = bytes4(uint32(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA, BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA_SHIFT)));
                    attributeRangeList[index++] = attrRange;
                }
                console.log("-------- getAttributeRangeList attributeRangeList index", index);
            }
        }

        return attributeRangeList;
    }

    function getAttributeExistRangeList(TokenTemplate memory self) internal view returns (Attribute.AttributeRange[] memory) {
        Attribute.AttributeRange[] memory attributeRangeList;
        if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            uint16 attributeCount = getAttributeCount(self);
            uint256 offset = 2 + getIdCount(self) + getAmountCount(self) + getIdFormulaRequired(self) + getAmountFormulaRequired(self);

            uint256 count;
            for (uint256 i; i < attributeCount; ++i) {
                uint256 attrIndex = offset + i;
                uint256 attribute = self.valueList[attrIndex];
                uint8 attrBranch = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT));
                uint8 attrOpt = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT));
                //branch no match anyone , use default attrBranch = 0
                if (attrOpt == ATTRIBUTE_OPT_EXIST || attrOpt == ATTRIBUTE_OPT_TOKEN_EXIST) {
                    count ++;
                }
            }

            attributeRangeList = new Attribute.AttributeRange[](count);
            uint256 index = 0;

            for (uint256 i; i < attributeCount; ++i) {
                uint256 attrIndex = offset + i;
                uint256 attribute = self.valueList[attrIndex];
                uint8 attrBranch = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH, BIT_TOKEN_TEMPLATE_ATTRIBUTE_BRANCH_SHIFT));
                console.log("-------- getAttributeExistRangeList attrBranch", attrBranch);

                uint8 attrOpt = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT, BIT_TOKEN_TEMPLATE_ATTRIBUTE_OPT_SHIFT));
                if (attrOpt == ATTRIBUTE_OPT_EXIST || attrOpt == ATTRIBUTE_OPT_TOKEN_EXIST) {
                    //branch no match anyone , use default attrBranch = 0

                    Attribute.AttributeRange memory attrRange;
                    attrRange.attrId = uint32(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_ID_SHIFT));
                    attrRange.attrOpt = attrOpt;
                    attrRange.attrType = uint8(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE, BIT_TOKEN_TEMPLATE_ATTRIBUTE_TYPE_SHIFT));
                    attrRange.amountBegin = int40(uint40(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_BEGIN_SHIFT)));
                    attrRange.amountEnd = int40(uint40(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END, BIT_TOKEN_TEMPLATE_ATTRIBUTE_AMOUNT_END_SHIFT)));
                    attrRange.parentAttrId = uint32(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID, BIT_TOKEN_TEMPLATE_ATTRIBUTE_PARENT_ID_SHIFT));
                    attrRange.formula = bytes4(uint32(Bit.bitValue(attribute, BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA, BIT_TOKEN_TEMPLATE_ATTRIBUTE_FORMULA_SHIFT)));
                    attributeRangeList[index++] = attrRange;

                    console.log("-------- getAttributeExistRangeList attributeRangeList.length", attributeRangeList.length);
                }
            }
        }

        return attributeRangeList;
    }


    function getSwapRouter01(TokenTemplate memory self) internal view returns (address){
        if (self.erc == TOKEN_ERC_ERC20) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_SWAP_V2) {
                uint8 amountFormulaRequired = getAmountFormulaRequired(self);
                return address(uint160(self.valueList[3 + amountFormulaRequired]));
            }
        }
        return address(0);
    }

    function getSwapToken(TokenTemplate memory self) internal view returns (address){
        if (self.erc == TOKEN_ERC_ERC20) {
            uint8 templateType = getType(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_SWAP_V2) {
                uint8 amountFormulaRequired = getAmountFormulaRequired(self);
                return address(uint160(self.valueList[4 + amountFormulaRequired]));
            }
        }
        return address(0);
    }

    function getOutAddress(TokenTemplate memory self) internal view returns (address){
        if (self.erc == TOKEN_ERC_ERC20 || self.erc == TOKEN_ERC_COIN) {
            uint8 templateType = getType(self);
            uint8 amountFormulaRequired = getAmountFormulaRequired(self);
            if (templateType == TOKEN_TEMPLATE_TYPE_SWAP_V2) {
                return address(uint160(self.valueList[5 + amountFormulaRequired]));
            } else {
                return address(uint160(self.valueList[3 + amountFormulaRequired]));
            }
        } else if (self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155) {
            uint256 offset = 2 + getIdCount(self) + getAmountCount(self) + getIdFormulaRequired(self) + getAmountFormulaRequired(self) + getAttributeCount(self);
            return address(uint160(self.valueList[offset]));
        }
        return address(0);
    }

    function checkAttributeRequiredExist(TokenTemplate memory self) internal view returns (bool){
        uint8 attrRequired = getAttributeRequired(self);
        if ((self.erc == TOKEN_ERC_ERC721 || self.erc == TOKEN_ERC_ERC1155)
            && attrRequired == TOKEN_TEMPLATE_ATTRIBUTE_REQUIRED_EXIST) {
            console.log("---------- input token ERC721 id only check exist");
            return true;
        }
        return false;
    }

    function checkTokenRequiredExist(TokenTemplate memory self) internal view returns (bool){
        uint8 idRequired = getIdRequired(self);
        uint8 amountRequired = getAmountRequired(self);
        if (self.erc == TOKEN_ERC_ERC721 && idRequired == TOKEN_TEMPLATE_ID_REQUIRED_EXIST) {
            console.log("---------- input token ERC721 id only check exist");
            return true;
        } else if (self.erc == TOKEN_ERC_ERC1155 && idRequired == TOKEN_TEMPLATE_ID_REQUIRED_EXIST && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_EXIST) {
            console.log("---------- input token ERC1155 id or amount only check exist");
            return true;
        } else if ((self.erc == TOKEN_ERC_ERC20 || self.erc == TOKEN_ERC_COIN) && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_EXIST) {
            console.log("---------- input COIN / token ERC20 amount only check exist");
            return true;
        }
        return false;
    }

    function checkTokenRequiredNone(TokenTemplate memory self) internal view returns (bool){
        uint8 idRequired = getIdRequired(self);
        uint8 amountRequired = getAmountRequired(self);
        if (self.erc == TOKEN_ERC_ERC721
            && idRequired == TOKEN_TEMPLATE_ID_REQUIRED_NONE) {
            console.log("---------- input token ERC721 id only check none");
            return true;
        } else if (self.erc == TOKEN_ERC_ERC1155 && idRequired == TOKEN_TEMPLATE_ID_REQUIRED_NONE && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_NONE) {
            console.log("---------- input token ERC1155 id or amount only check none");
            return true;
        } else if ((self.erc == TOKEN_ERC_ERC20 || self.erc == TOKEN_ERC_COIN)
            && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_NONE) {
            console.log("---------- input COIN / token ERC20 amount only check none");
            return true;
        }
        return false;
    }

    function checkTokenRequiredMounting(TokenTemplate memory self) internal view returns (bool){
        uint8 idRequired = getIdRequired(self);
        uint8 amountRequired = getAmountRequired(self);
        if (self.erc == TOKEN_ERC_ERC721
            && idRequired == TOKEN_TEMPLATE_ID_REQUIRED_MOUNTING) {
            console.log("---------- input token ERC721 id only check mounting");
            return true;
        } else if (self.erc == TOKEN_ERC_ERC1155 && idRequired == TOKEN_TEMPLATE_ID_REQUIRED_MOUNTING && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_MOUNTING) {
            console.log("---------- input token ERC1155 id or amount only check mounting");
            return true;
        } else if ((self.erc == TOKEN_ERC_ERC20 || self.erc == TOKEN_ERC_COIN)
            && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_MOUNTING) {
            console.log("---------- input COIN / token ERC20 amount only check mounting");
            return true;
        }
        return false;
    }

    function tokenCheckMatchStdInput(uint256 tokenSlotIndex, TokenTemplate memory stdToken, Token memory memToken) internal {
        console.log("-----tokenMatchStdInput stdToken", stdToken.token);
        console.log("-----tokenMatchStdInput memToken", memToken.token);
        console.log("-----tokenMatchStdInput erc", ercToString(memToken.erc));

        if (memToken.token != stdToken.token) {
            require(false, S.cs2("index stdToken.addr == memToken.addr", S.u2s(tokenSlotIndex)));
        }
        if (memToken.erc != stdToken.erc) {
            require(false, S.cs2("index stdToken.erc == memToken.erc", S.u2s(tokenSlotIndex)));
        }

        uint8 idRequired = getIdRequired(stdToken);
        uint8 amountRequired = getAmountRequired(stdToken);

        // uint256 stdIdIndex = stdToken.getIdIndex();
        uint256 stdIdListLength = getIdListLength(stdToken);
        console.log("-------- tokenMatchStdInput stdIdListLength", stdIdListLength);

        console.log("-----tokenMatchStdInput memToken.id", memToken.id);
        console.log("-----tokenMatchStdInput memToken.amount", memToken.amount);

        if (stdToken.erc == TOKEN_ERC_ERC1155) {
            if ((idRequired == TOKEN_TEMPLATE_ID_REQUIRED_FALSE && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_FALSE)) {
                require((memToken.id == 0 && memToken.amount == 0 || memToken.id > 0 && memToken.amount > 0), "ERC1155 must idRequired == FALSE && amountRequired == FALSE, id = 0 && amount = 0 || id > 0 && amount > 0");
            } else if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED_TRUE && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_TRUE) {
                require(memToken.id > 0 && memToken.amount > 0, "ERC1155 must idRequired == TRUE && amountRequired == TRUE, id > 0 && amount > 0");
            } else if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED_EXIST && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_EXIST) {
                require(memToken.id > 0 && memToken.amount > 0, "ERC1155 must idRequired == EXIST && amountRequired == EXIST, id > 0 && amount > 0");
            } else if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED_NONE && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_NONE) {
                require(memToken.id > 0 && memToken.amount > 0, "ERC1155 must idRequired == NONE && amountRequired == NONE, id > 0 && amount > 0");
            } else if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED_MOUNTING && amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_MOUNTING) {
                require(memToken.id > 0 && memToken.amount > 0, "ERC1155 must idRequired == MOUNTING && amountRequired == MOUNTING, id > 0 && amount > 0");
            } else {
                require(false, "ERC1155 id.Required amt.Required state not matched");
            }
        }

        if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED_TRUE || idRequired == TOKEN_TEMPLATE_ID_REQUIRED_EXIST || idRequired == TOKEN_TEMPLATE_ID_REQUIRED_NONE) {
            if (stdIdListLength > 0) {
                require(searchId(stdToken, memToken.id) >= 0, "memToken.id not exist in stdToken");
            } else {
                uint256[] memory stdIdRange = getIdRange(stdToken);
                console.log("-----tokenMatchStdInput TRUE EXIST NONE stdIDRange0", stdIdRange[0]);
                console.log("-----tokenMatchStdInput TRUE EXIST NONE stdIDRange1", stdIdRange[1]);

                if (stdIdRange[0] != 0 || stdIdRange[1] != 0) {
                    if (stdIdRange[0] > memToken.id || memToken.id > stdIdRange[1]) {
                        require(stdIdRange[0] <= memToken.id && memToken.id <= stdIdRange[1],
                            S.cs3("id.TRUE || id.EXIST index stdToken.id <= memToken.id <= stdToken.idEnd", S.u2s(tokenSlotIndex), S.u2s(idRequired)));
                    }
                }
            }
        } else if (idRequired == TOKEN_TEMPLATE_ID_REQUIRED_FALSE) {
            if (stdIdListLength > 0) {
                require(memToken.id == 0 || searchId(stdToken, memToken.id) >= 0, "memToken.id not exist in stdToken");
            } else {
                uint256[] memory stdIdRange = getIdRange(stdToken);
                console.log("-----tokenMatchStdInput FALSE stdIDRange0", stdIdRange[0]);
                console.log("-----tokenMatchStdInput FALSE stdIDRange1", stdIdRange[1]);

                if (stdIdRange[0] != 0 || stdIdRange[1] != 0) {
                    if (stdIdRange[0] > memToken.id || memToken.id > stdIdRange[1]) {
                        require(memToken.id == 0 || stdIdRange[0] <= memToken.id && memToken.id <= stdIdRange[1],
                            S.cs3("id.FALSE index memToken.id == 0 || stdToken.id <= memToken.id <= stdToken.idEnd", S.u2s(tokenSlotIndex), S.u2s(idRequired)));
                    }
                }
            }
        }

        if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_TRUE || amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_EXIST || amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_NONE) {
            uint256[] memory stdAmountRange = getAmountRange(stdToken);

            console.log("-----tokenMatchStdInput TRUE EXIST NONE stdAmountRange0", stdAmountRange[0]);
            console.log("-----tokenMatchStdInput TRUE EXIST NONE stdAmountRange1", stdAmountRange[1]);

            if (stdAmountRange[0] > memToken.amount || memToken.amount > stdAmountRange[1]) {
                require(stdAmountRange[0] <= memToken.amount && memToken.amount <= stdAmountRange[1],
                    S.cs3("amt.TRUE || amt.EXIST index stdToken.amount <= memToken.amount <= stdToken.amountEnd",
                    S.u2s(tokenSlotIndex), S.u2s(amountRequired)));
            }
        } else if (amountRequired == TOKEN_TEMPLATE_AMOUNT_REQUIRED_FALSE) {
            uint256[] memory stdAmountRange = getAmountRange(stdToken);

            console.log("-----tokenMatchStdInput FALSE stdAmountRange0", stdAmountRange[0]);
            console.log("-----tokenMatchStdInput FALSE stdAmountRange1", stdAmountRange[1]);

            if (stdAmountRange[0] > memToken.amount || memToken.amount > stdAmountRange[1]) {
                require(memToken.amount == 0 || stdAmountRange[0] <= memToken.amount && memToken.amount <= stdAmountRange[1],
                    S.cs3("amt.FALSE index memToken.amount == 0 || stdToken.amount <= memToken.amount <= stdToken.amountEnd",
                    S.u2s(tokenSlotIndex), S.u2s(amountRequired)));
            }
        }

    }

    function tokenCheckMatchStdOutput(uint256 tokenSlotIndex, TokenTemplate memory stdToken, TokenHandler memory memToken) internal {

        console.log("-----tokenMatchStdOutput stdToken", stdToken.token);

        console.log("-----tokenMatchStdOutput erc", ercToString(stdToken.erc));

        uint8 idRequired = getIdRequired(stdToken);
        uint8 amountRequired = getAmountRequired(stdToken);

        uint256 stdIdListLength = getIdListLength(stdToken);
        console.log("-------- tokenMatchStdOutput stdIdListLength", stdIdListLength);

        console.log("-------- tokenMatchStdOutput stdIdListLength", stdIdListLength);

        console.log("-----tokenMatchStdOutput memToken.id", memToken.id);
        console.log("-----tokenMatchStdOutput memToken.amount", memToken.amount);


        if (stdIdListLength > 0) {
            require(searchId(stdToken, memToken.id) >= 0, "memToken.id not exist in stdToken");
        } else {
            uint256[] memory stdIdRange = getIdRange(stdToken);
            console.log("-----tokenMatchStdOutput stdIDRange0", stdIdRange[0]);
            console.log("-----tokenMatchStdOutput stdIDRange1", stdIdRange[1]);

            if (stdIdRange[0] != 0 || stdIdRange[1] != 0) {
                if (stdIdRange[0] > memToken.id || memToken.id > stdIdRange[1]) {
                    require(stdIdRange[0] <= memToken.id && memToken.id <= stdIdRange[1],
                        S.cs3("index stdToken.id <= memToken.id <= stdToken.idEnd", S.u2s(tokenSlotIndex), S.u2s(idRequired)));
                }
            }
        }

        uint256[] memory stdAmountRange = getAmountRange(stdToken);

        console.log("-----tokenMatchStdOutput stdAmountRange0", stdAmountRange[0]);
        console.log("-----tokenMatchStdOutput stdAmountRange1", stdAmountRange[1]);

        if (stdAmountRange[0] > memToken.amount || memToken.amount > stdAmountRange[1]) {
            require(stdAmountRange[0] <= memToken.amount && memToken.amount <= stdAmountRange[1],
                S.cs3("index stdToken.amount <= memToken.amount <= stdToken.amountEnd",
                S.u2s(tokenSlotIndex), S.u2s(amountRequired)));
        }
    }

}
