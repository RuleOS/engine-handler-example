pragma solidity ^0.8.0;

abstract contract Random {

    mapping(address => uint256) private _seed;

    function getRandomNumber(bytes memory data) internal virtual returns (uint256){
        bytes32 hash = blockhash(block.number - 1);
        uint256 gasLeft = gasleft();
        bytes32 _sha256 = keccak256(
            abi.encode(
                gasLeft,
                tx.gasprice,
                block.timestamp,
                hash,
                block.coinbase,
                data
            )
        );
        unchecked {
            _seed[tx.origin] = _seed[tx.origin] * 3 + uint256(_sha256);
        }
        return _seed[tx.origin];
    }

}
