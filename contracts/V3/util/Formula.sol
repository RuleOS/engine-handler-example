// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StackUtil.sol";
import "hardhat/console.sol";

contract Formula {

    uint8 constant OPT_COUNT = 3;

    uint256 constant FORMULA_OPT_PLUS = 10**OPT_COUNT + 1;// +
    uint256 constant FORMULA_OPT_MINUS = 10**OPT_COUNT + 2;// -
    uint256 constant FORMULA_OPT_MULTIPLY = 10**OPT_COUNT + 3;// *
    uint256 constant FORMULA_OPT_DIVIDE = 10**OPT_COUNT + 4;// /
    uint256 constant FORMULA_OPT_POWER = 10**OPT_COUNT + 5;// ^
    uint256 constant FORMULA_OPT_FACTORIAL = 10**OPT_COUNT + 6;// !
    uint256 constant FORMULA_OPT_SQRT = 10**OPT_COUNT + 7;// g  square root
    uint256 constant FORMULA_OPT_LN = 10**OPT_COUNT + 8;// l
    uint256 constant FORMULA_OPT_LOG2 = 10**OPT_COUNT + 9;// o
    uint256 constant FORMULA_OPT_SIN = 10**OPT_COUNT + 10;// s
    uint256 constant FORMULA_OPT_COS = 10**OPT_COUNT + 11;// c
    uint256 constant FORMULA_OPT_TAN = 10**OPT_COUNT + 12;// t

    using StackUtil for StackUtil.Stack;

    function math(int256[] memory list) public view returns(int256){
        StackUtil.Stack memory stack;
        stack.items = new int256[](list.length);

        uint256 indexYN = 0;

        for (uint i = 0; i < list.length; i++) {
            if (isNumber(list[i])) {
                console.log("number",uint(list[i]));
                stack.push(list[i]);
                console.log("number --- 1");
            } else if (isOperator(list[i])){
                console.log("operator",uint(list[i]));
                int256 res = 0;
                if (list[i] == int(FORMULA_OPT_PLUS)) {
                    int256 num2 = stack.pop();//parseFloat
                    int256 num1 = stack.pop();//parseFloat
                    res = num1 + num2;
                } else if (list[i] == int(FORMULA_OPT_MINUS)) {
                    int256 num2 = stack.pop();
                    int256 num1 = stack.pop();
                    res = num1 - num2;
                } else if (list[i] == int(FORMULA_OPT_MULTIPLY)) {
                    int256 num2 = stack.pop();
                    int256 num1 = stack.pop();
                    res = num1 * num2;
                } else if (list[i] == int(FORMULA_OPT_DIVIDE)) {
                    int256 num2 = stack.pop();
                    int256 num1 = stack.pop();
                    if (num2 != 0){
                        res = num1 / num2;
                    } else {
                        indexYN = 1;
                        require(false,"formula divide 0");
                    }
                } else if (list[i] == int(FORMULA_OPT_POWER)) {
                    int256 num2 = stack.pop();
                    int256 num1 = stack.pop();
                    res = int(uint(num1)**uint(num2));
                } else if (list[i] == int(FORMULA_OPT_FACTORIAL)) {
                    int256 num1 = stack.pop();
                    if (num1 == 0 || num1 == 1){
                        res = 1;
                    } else if (num1 == num1 && num1 > 1){
                        int256 d = 1;
                        for (int256 j = num1; j > 0; j--) {
                            d *= j;
                        }
                        res = d;
                    } else {
                        require(false,"formula ! must integer");
                        indexYN = 1;
                    }
                } else if (list[i] == int(FORMULA_OPT_SQRT)) {
                    int256 num1 = stack.pop();
                    res = int(sqrt(uint(num1)));
                } else if (list[i] == int(FORMULA_OPT_LN)) {
                } else if (list[i] == int(FORMULA_OPT_LOG2)) {
                    int256 num1 = stack.pop();
                    if (num1 > 0){
                        res = int(log2(uint(num1)));
                    } else {
                        require(false,"formula log x > 0");
                        indexYN = 1;
                    }
                } else if (list[i] == int(FORMULA_OPT_SIN)) {
                    int256 num1 = stack.pop();
                    res = sin(uint16(uint256(num1)));
                } else if (list[i] == int(FORMULA_OPT_COS)) {
                    int256 num1 = stack.pop();
                    res = cos(uint16(uint256(num1)));
                } else if (list[i] == int(FORMULA_OPT_TAN)) {
                    int256 num1 = stack.pop();
                    if (cos(uint16(uint(num1))) != 0){
                        res = tan(uint16(uint(num1)));
                    } else {
                        require(false,"formula tan x not be +-(PI/2 + k*PI)");
                        indexYN = 1;
                    }
                }
                stack.push(res);
            }
        }
        if (indexYN == 0){
            if (!stack.isEmpty()){
                return stack.pop();
            } else {
                return 0;
            }
        } else {
            return -999999;
        }
    }


    function isOperator(int op) internal pure returns(bool){
        return adv(op) > 0;
    }

    function isNumber(int num) internal pure returns(bool){
        return adv(num) == 0;
    }


    //operator level
    function adv(int f) internal pure returns(int){
        int result = 0;
        if(f == int(FORMULA_OPT_PLUS)) result = 1;
        else if(f == int(FORMULA_OPT_MINUS)) result = 1;
        else if(f == int(FORMULA_OPT_MULTIPLY)) result = 2;
        else if(f == int(FORMULA_OPT_DIVIDE)) result = 2;
        else if(f == int(FORMULA_OPT_POWER)) result = 3;
        else if(f == int(FORMULA_OPT_FACTORIAL)) result = 4;
        else if(f == int(FORMULA_OPT_SQRT)) result = 4;
        else if(f == int(FORMULA_OPT_LN)) result = 4;
        else if(f == int(FORMULA_OPT_LOG2)) result = 4;
        else if(f == int(FORMULA_OPT_SIN)) result = 4;
        else if(f == int(FORMULA_OPT_COS)) result = 4;
        else if(f == int(FORMULA_OPT_TAN)) result = 4;
        return result;
    }

    function sqrt(uint y) public pure returns (uint256) {
        uint z = 0;
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
        return z;
    }

    function log2(uint x) public pure returns (uint y){

        assembly {
            let arg := x
            x := sub(x,1)
            x := or(x, div(x, 0x02))
            x := or(x, div(x, 0x04))
            x := or(x, div(x, 0x10))
            x := or(x, div(x, 0x100))
            x := or(x, div(x, 0x10000))
            x := or(x, div(x, 0x100000000))
            x := or(x, div(x, 0x10000000000000000))
            x := or(x, div(x, 0x100000000000000000000000000000000))
            x := add(x, 1)
            let m := mload(0x40)
            mstore(m,           0xf8f9cbfae6cc78fbefe7cdc3a1793dfcf4f0e8bbd8cec470b6a28a7a5a3e1efd)
            mstore(add(m,0x20), 0xf5ecf1b3e9debc68e1d9cfabc5997135bfb7a7a3938b7b606b5b4b3f2f1f0ffe)
            mstore(add(m,0x40), 0xf6e4ed9ff2d6b458eadcdf97bd91692de2d4da8fd2d0ac50c6ae9a8272523616)
            mstore(add(m,0x60), 0xc8c0b887b0a8a4489c948c7f847c6125746c645c544c444038302820181008ff)
            mstore(add(m,0x80), 0xf7cae577eec2a03cf3bad76fb589591debb2dd67e0aa9834bea6925f6a4a2e0e)
            mstore(add(m,0xa0), 0xe39ed557db96902cd38ed14fad815115c786af479b7e83247363534337271707)
            mstore(add(m,0xc0), 0xc976c13bb96e881cb166a933a55e490d9d56952b8d4e801485467d2362422606)
            mstore(add(m,0xe0), 0x753a6d1b65325d0c552a4d1345224105391a310b29122104190a110309020100)
            mstore(0x40, add(m, 0x100))
            let magic := 0x818283848586878898a8b8c8d8e8f929395969799a9b9d9e9faaeb6bedeeff
            let shift := 0x100000000000000000000000000000000000000000000000000000000000000
            let a := div(mul(x, magic), shift)
            y := div(mload(add(m,sub(255,a))), shift)
            y := add(y, mul(256, gt(arg, 0x8000000000000000000000000000000000000000000000000000000000000000)))
        }
        return y;
    }






    // Table index into the trigonometric table
    uint constant INDEX_WIDTH = 4;
    // Interpolation between successive entries in the tables
    uint constant INTERP_WIDTH = 8;
    uint constant INDEX_OFFSET = 12 - INDEX_WIDTH;
    uint constant INTERP_OFFSET = INDEX_OFFSET - INTERP_WIDTH;
    uint16 constant ANGLES_IN_CYCLE = 16384;
    uint16 constant QUADRANT_HIGH_MASK = 8192;
    uint16 constant QUADRANT_LOW_MASK = 4096;
    uint constant SINE_TABLE_SIZE = 16;

    // constant sine lookup table generated by gen_tables.py
    // We have no other choice but this since constant arrays don't yet exist
    uint8 constant entry_bytes = 2;
    bytes constant sin_table = "\x00\x00\x0c\x8c\x18\xf9\x25\x28\x30\xfb\x3c\x56\x47\x1c\x51\x33\x5a\x82\x62\xf1\x6a\x6d\x70\xe2\x76\x41\x7a\x7c\x7d\x89\x7f\x61\x7f\xff";

    /**
     * Convenience function to apply a mask on an integer to extract a certain
     * number of bits. Using exponents since solidity still does not support
     * shifting.
     *
     * @param _value The integer whose bits we want to get
     * @param _width The width of the bits (in bits) we want to extract
     * @param _offset The offset of the bits (in bits) we want to extract
     * @return An integer containing _width bits of _value starting at the
     *         _offset bit
     */
    function bits(uint _value, uint _width, uint _offset) pure internal returns (uint) {
        return (_value / (2 ** _offset)) & (((2 ** _width)) - 1);
    }

    function sin_table_lookup(uint index) pure internal returns (uint16) {
        bytes memory table = sin_table;
        uint offset = (index + 1) * entry_bytes;
        uint16 trigint_value;
        assembly {
            trigint_value := mload(add(table, offset))
        }

        return trigint_value;
    }

    /**
     * Return the sine of an integer approximated angle as a signed 16-bit
     * integer.
     *
     * @param _angle A 14-bit angle. This divides the circle into 16384
     *               angle units, instead of the standard 360 degrees.
     * @return The sine result as a number in the range -32767 to 32767.
     */
    function sin(uint16 _angle) public pure returns (int) {
        uint interp = bits(_angle, INTERP_WIDTH, INTERP_OFFSET);
        uint index = bits(_angle, INDEX_WIDTH, INDEX_OFFSET);

        bool is_odd_quadrant = (_angle & QUADRANT_LOW_MASK) == 0;
        bool is_negative_quadrant = (_angle & QUADRANT_HIGH_MASK) != 0;

        if (!is_odd_quadrant) {
            index = SINE_TABLE_SIZE - 1 - index;
        }

        uint x1 = sin_table_lookup(index);
        uint x2 = sin_table_lookup(index + 1);
        uint approximation = ((x2 - x1) * interp) / (2 ** INTERP_WIDTH);

        int sine;
        if (is_odd_quadrant) {
            sine = int(x1) + int(approximation);
        } else {
            sine = int(x2) - int(approximation);
        }

        if (is_negative_quadrant) {
            sine *= -1;
        }

        return sine;
    }

    /**
     * Return the cos of an integer approximated angle.
     * It functions just like the sin() method but uses the trigonometric
     * identity sin(x + pi/2) = cos(x) to quickly calculate the cos.
     */
    function cos(uint16 _angle) public pure returns (int) {
        if (_angle > ANGLES_IN_CYCLE - QUADRANT_LOW_MASK) {
            _angle = QUADRANT_LOW_MASK - ANGLES_IN_CYCLE - _angle;
        } else {
            _angle += QUADRANT_LOW_MASK;
        }
        return sin(_angle);
    }

    function tan(uint16 _angle) public pure returns (int) {
        return sin(_angle)/cos(_angle);
    }
}
