// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

library StackUtil {

    struct Stack {
        int256[] items;
        uint256 count;
    }

    function push(Stack memory self, int256 ele) internal view{
        self.items[self.count++] = ele;
    }

    function peek(Stack memory self) internal pure returns(int256){
        return self.items[self.count - 1];
    }

    function pop(Stack memory self) internal pure returns (int256) {
        if (isEmpty(self)) return 0;
        int256 result = self.items[--self.count];
        delete self.items[self.count];
        return result;
    }

    function isEmpty(Stack memory self) internal pure returns (bool) {
        return self.count == 0;
    }

    function size(Stack memory self) internal pure returns (uint256) {
        return self.count;
    }

    function clear(Stack memory self) internal pure{
        self.count = 0;
    }

}
