// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../util/Chain.sol";
import "../interface/IVersion.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "hardhat/console.sol";

bytes32 constant PROOF_CALL_ROLE = keccak256("PROOF_CALL_ROLE");
bytes32 constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

contract ProofLib is IVersion, Initializable, AccessControlEnumerableUpgradeable {

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant PERMIT_TYPEHASH = keccak256("ProofCall(bytes32 hash,address caller,address target,uint256 value,bytes data,uint256 deadline)");
    event ProofCall(address indexed caller, bytes32 indexed hash, address indexed target, uint value, bytes data);

    mapping(bytes32 => bool) public proof;

    function version() public pure override returns (uint){
        return 1;
    }

    function cname() public pure override returns (string memory){
        return "ProofLib";
    }

    function initialize() public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PROOF_CALL_ROLE, _msgSender());
        _grantRole(SIGNER_ROLE, _msgSender());

        uint chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes("ProofLib")),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );
    }

    function proofCheck(bytes32 hash) public view returns (bool){
        return proof[hash];
    }

    function proofCheckBatch(bytes32[] memory hashList) public view returns (uint, uint, bool[] memory){

        uint proofCount;
        uint notProofCount;
        bool[] memory res = new bool[](hashList.length);

        for (uint i; i < hashList.length; ++i) {
            res[i] = proof[hashList[i]];
            if (res[i]) {
                proofCount ++;
            }
            else {
                notProofCount ++;
            }
        }

        return (proofCount, notProofCount, res);
    }

    function proofCallBatch(bytes32[] memory hashList, address[] memory targetList, uint256[] memory valueList, bytes[] memory dataList) public onlyRole(PROOF_CALL_ROLE) {
        require(hashList.length == targetList.length, "hashList.length == targetList.length");
        require(targetList.length == valueList.length, "targetList.length == valueList.length");
        require(valueList.length == dataList.length, "valueList.length == dataList.length");

        for (uint i; i < hashList.length; ++i) {
            proofCall(hashList[i], targetList[i], valueList[i], dataList[i]);
        }
    }

    function _proofCall(bytes32 hash, address target, uint256 value, bytes memory data) private {
        console.log("------------- ProofLib proofCall target", target);
        console.log("------------- ProofLib proofCall value", value);
        console.log("------------- ProofLib proofCall data", string(data));

        require(!proof[hash], "ProofLib: hash exist!");
        string memory errorMessage = "ProofLib: functionCall reverted without message";
        (bool success, bytes memory returnData) = target.call{value: value}(data);
        Address.verifyCallResult(success, returnData, errorMessage);

        emit ProofCall(msg.sender, hash, target, value, data);
        proof[hash] = true;
    }

    function proofCall(bytes32 hash, address target, uint256 value, bytes memory data) public onlyRole(PROOF_CALL_ROLE) {
        _proofCall(hash, target, value, data);
    }

    function permit(bytes32 hash, address caller, address target, uint256 value, bytes memory data, uint deadline, uint8 v, bytes32 r, bytes32 s) public {
        console.log("permit start");
        require(deadline >= block.timestamp, "ProofLib: EXPIRED");
        require(caller == _msgSender(), "ProofLib: !caller");
        console.log("DOMAIN_SEPARATOR",uint256(DOMAIN_SEPARATOR));
        console.log("hash",uint256(hash));
        console.log("outside hash",uint256(keccak256("0x123412,1234214")));
        console.log("target",target);
        console.log("value",value);
        console.log("deadline1",deadline);

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, hash, caller, target, value, keccak256(data), deadline))
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        console.log("recoveredAddress:",recoveredAddress);
        require(recoveredAddress != address(0) && hasRole(SIGNER_ROLE,recoveredAddress), 'ProofLib: INVALID_SIGNATURE');
        _proofCall(hash, target, value, data);
    }
}
