// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../struct/Constant.sol";


/// @title exchange
interface IExchange {

    event Buy(Token token, uint256 buyIndex);
    event Sell(Token token, uint256 sellIndex);
    event CancelBuy(Token token, uint256 buyIndex);
    event CancelSell(Token token, uint256 sellIndex);
    event TakeBuy(Token orderToken, uint256 buyIndex, Token token);
    event TakeSell(Token orderToken, uint256 sellIndex, Token token);
    event MatchOrder(Token token, uint256 buyIndex, uint256 sellIndex);

    event SetTokenRoyaltyRate(address indexed token, uint256 indexed royaltyRate);
    event SetServiceFeeRate(address indexed serviceFeeAddr, uint256 indexed serviceFeeRate);

    event TransferValues(uint256 indexed tokenPrice,
        address serviceFeeAddress, uint256 indexed serviceFeeRate, uint256 serviceFee,
        address token, address deployer, uint256 indexed royaltyRate, uint256 royalty,
        address receiver, uint256 receiverTokenPrice
    );

    struct Token {
        uint8 erc; // 0 coin 1 erc20 2 erc721 3 erc1155
        address token;
        uint256 id;
        uint256 amount;
        uint256 price;
    }

    struct Order {
        Token token;
        address owner;
        uint256 createTime;
        uint256 dealTime;
        uint8 deal;
    }

    function version() external pure returns (uint);
    function cname() external returns (string memory);
    function pause(uint8 channel, bool _paused) external;
    function setServiceFeeRate(address _serviceFeeAddr, uint256 _serviceFeeRate) external;
    function setTokenRoyaltyRate(address contractAddr, uint256 royaltyRate) external;

    function setBatchOrderCount(
        uint256 batchBuyOrderCount_,
        uint256 batchSellOrderCount_,
        uint256 cancelBuyOrderCount_,
        uint256 cancelSellOrderCount_,
        uint256 takeBuyOrderCount_,
        uint256 takeSellOrderCount_
    ) external;

    function currentBuyIndex() external view returns (uint256);

    function currentSellIndex() external view returns (uint256);

    function makeBatchBuyOrder(Token[] memory tokens) external payable returns (uint256 tokensCount);

    function makeBatchSellOrder(Token[] memory tokens) external returns (uint256 tokensCount);

    function cancelBatchBuyOrder(uint256[] memory buyIndexList) external ;

    function cancelBatchSellOrder(uint256[] memory sellIndexList) external;

    function takeBatchBuyOrder(uint256[] memory buyIndexList,Token[] memory tokenList) external;

    function takeBatchSellOrder(uint256[] memory sellIndexList,Token[] memory tokenList) external payable;

    function matchOrder(uint256 buyIndex, uint256 sellIndex) external;

    function matchBatchOrder(uint256[] memory buyIndexList, uint256[] memory sellIndexList) external ;
}
