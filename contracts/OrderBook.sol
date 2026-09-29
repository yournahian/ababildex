// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFeeTreasury {
    function depositFee(address token, uint256 amount) external;
}

contract OrderBook is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NotMaker();
    error OrderInactive();
    error OrderExpired();
    error OverFill();
    error ZeroAddress();
    error ZeroAmount();
    error FeeTooHigh();

    struct Order {
        address maker;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 filledAmountIn;
        uint256 minAmountOut;
        uint64 expiresAt;
        bool cancelled;
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;
    uint16 public feeBps;
    address public feeTreasury;

    event OrderPlaced(
        uint256 indexed orderId,
        address indexed maker,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint64 expiresAt
    );
    event OrderCancelled(uint256 indexed orderId, address indexed maker, uint256 refundAmount);
    event OrderFilled(
        uint256 indexed orderId,
        address indexed taker,
        uint256 fillAmountIn,
        uint256 amountOut,
        uint256 fee
    );
    event FeeBpsUpdated(uint16 bps);
    event TreasuryUpdated(address treasury);

    constructor(address feeTreasury_, uint16 feeBps_, address initialOwner) Ownable(initialOwner) {
        if (feeTreasury_ == address(0) || initialOwner == address(0)) revert ZeroAddress();
        if (feeBps_ > 100) revert FeeTooHigh();
        feeTreasury = feeTreasury_;
        feeBps = feeBps_;
    }

    function placeOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint64 expiresAt
    ) external whenNotPaused nonReentrant returns (uint256 orderId) {
        if (tokenIn == address(0) || tokenOut == address(0)) revert ZeroAddress();
        if (tokenIn == tokenOut) revert OrderInactive();
        if (amountIn == 0 || minAmountOut == 0) revert ZeroAmount();
        if (expiresAt <= block.timestamp) revert OrderExpired();

        orderId = orderCount;
        uint256 balanceBefore = IERC20(tokenIn).balanceOf(address(this));
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        uint256 received = IERC20(tokenIn).balanceOf(address(this)) - balanceBefore;
        if (received == 0) revert ZeroAmount();

        orders[orderId] = Order({
            maker: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: received,
            filledAmountIn: 0,
            minAmountOut: minAmountOut,
            expiresAt: expiresAt,
            cancelled: false
        });
        unchecked {
            orderCount = orderId + 1;
        }
        emit OrderPlaced(orderId, msg.sender, tokenIn, tokenOut, received, minAmountOut, expiresAt);
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        if (order.maker != msg.sender) revert NotMaker();
        if (order.cancelled) revert OrderInactive();
        uint256 remaining = order.amountIn - order.filledAmountIn;
        if (remaining == 0) revert OrderInactive();
        order.cancelled = true;
        IERC20(order.tokenIn).safeTransfer(order.maker, remaining);
        emit OrderCancelled(orderId, order.maker, remaining);
    }

    function fillOrder(uint256 orderId, uint256 fillAmountIn, address taker)
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        Order storage order = orders[orderId];
        if (order.cancelled || order.maker == address(0)) revert OrderInactive();
        if (block.timestamp > order.expiresAt) revert OrderExpired();
        if (taker == address(0)) revert ZeroAddress();
        if (fillAmountIn == 0) revert ZeroAmount();

        uint256 newFilledAmountIn = order.filledAmountIn + fillAmountIn;
        if (newFilledAmountIn > order.amountIn) revert OverFill();

        uint256 fee = (fillAmountIn * feeBps) / 10_000;
        uint256 amountOut = (fillAmountIn * order.minAmountOut) / order.amountIn;

        // CEI: update state before external calls
        order.filledAmountIn = newFilledAmountIn;

        // Pull tokenOut from taker and deliver to maker
        IERC20(order.tokenOut).safeTransferFrom(taker, address(this), amountOut);
        IERC20(order.tokenOut).safeTransfer(order.maker, amountOut);

        // Transfer tokenIn (minus fee) to taker
        IERC20(order.tokenIn).safeTransfer(taker, fillAmountIn - fee);

        // Forward fee to treasury
        if (fee > 0) {
            IERC20(order.tokenIn).forceApprove(feeTreasury, fee);
            IFeeTreasury(feeTreasury).depositFee(order.tokenIn, fee);
            IERC20(order.tokenIn).forceApprove(feeTreasury, 0);
        }

        emit OrderFilled(orderId, taker, fillAmountIn, amountOut, fee);
    }

    function setFeeBps(uint16 bps) external onlyOwner {
        if (bps > 100) revert FeeTooHigh();
        feeBps = bps;
        emit FeeBpsUpdated(bps);
    }

    function setFeeTreasury(address newFeeTreasury) external onlyOwner {
        if (newFeeTreasury == address(0)) revert ZeroAddress();
        feeTreasury = newFeeTreasury;
        emit TreasuryUpdated(newFeeTreasury);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function renounceOwnership() public view override onlyOwner {
        revert("renounceOwnership disabled");
    }
}
