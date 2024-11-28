pragma solidity ^0.8.0;
import "./Attribute.sol";
import "./Rule.sol";

library Cluster {

    struct Cluster {

        Rule.GroupSlot[] groupSlotList;//[0,1,2,3][4,5,6][7,8,9,10]
        uint8[] ruleSlotBound;//[4,7,11]

        Rule.Rule[] ruleList;
        Attribute.Attribute[] attrList;
        uint8[] attrStateList;

        address[] deployerList;
        address[] adminList;
        uint32 delayTimestamp;//32:delay block number  32delay seconds to execute task
        uint32 delayBlockNumber;
        uint8 state;
        string description;
    }


    function getRuleSlotLength(Cluster memory self) internal returns(uint8) {
        return uint8(self.ruleSlotBound.length);
    }

    function getGroupSlotRangeIndex(Cluster memory self,uint16 ruleSlotIndex) internal returns(uint8 startIndex,uint8 endIndex){
        if(ruleSlotIndex == 0){
            startIndex = 0;
            endIndex = self.ruleSlotBound[0];
        } else {
            startIndex = self.ruleSlotBound[ruleSlotIndex-1];
            endIndex = self.ruleSlotBound[ruleSlotIndex];
        }
    }

    function getRuleSlotIndex(Cluster memory self,uint8 groupSlotIndex) internal returns(uint8,uint8,uint8){

        for(uint8 j ; j < self.ruleSlotBound.length; ++j){
            (uint8 startIndex,uint8 endIndex) = getGroupSlotRangeIndex(self,j);
            if(startIndex <= groupSlotIndex && groupSlotIndex < endIndex){
                return (j,startIndex,endIndex);
            }
        }

        return (0,0,0);
    }

}
