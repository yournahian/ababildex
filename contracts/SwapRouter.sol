// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IAMMPool {
    function swap(address tokenIn, uint256 amountIn, uint256 minOut, address to) external returns (uint256);
    function tokenA() external view returns (address);
    function tokenB() external view returns (address);
}

interface IFeeTreasury {
    function depositFee(address token, uint256 amount) external;
}

contract SwapRouter is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NoPoolFound();
    error DeadlineExpired();
    error ZeroAmount();
    error ZeroAddress();
    error FeeTooHigh();

    event Swapped(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed recipient,
        uint256 fee
    );
    event PoolRegistered(address tokenA, address tokenB, address pool);
    event PoolDeregistered(address tokenA, address tokenB);
    event FeeBpsUpdated(uint16 bps);
    event TreasuryUpdated(address treasury);

    uint16 public feeBps;
    address public feeTreasury;
    mapping(bytes32 => address) public pools;

    constructor(address feeTreasury_, uint16 feeBps_, address initialOwner) Ownable(initialOwner) {
        if (feeTreasury_ == address(0) || initialOwner == address(0)) revert ZeroAddress();
        if (feeBps_ > 100) revert FeeTooHigh();
        feeTreasury = feeTreasury_;
        feeBps = feeBps_;
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address recipient,
        uint256 deadline
    ) external whenNotPaused nonReentrant returns (uint256 amountOut) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        if (amountIn == 0 || minAmountOut == 0) revert ZeroAmount();
        if (recipient == address(0)) revert ZeroAddress();

        address pool = pools[_poolKey(tokenIn, tokenOut)];
        if (pool == address(0)) revert NoPoolFound();

        IERC20 tokenInErc20 = IERC20(tokenIn);
        uint256 balanceBefore = tokenInErc20.balanceOf(address(this));
        tokenInErc20.safeTransferFrom(msg.sender, address(this), amountIn);
        uint256 received = tokenInErc20.balanceOf(address(this)) - balanceBefore;
        if (received == 0) revert ZeroAmount();

        uint256 fee = (received * feeBps) / 10_000;
        uint256 netIn = received - fee;

        tokenInErc20.forceApprove(pool, netIn);
        amountOut = IAMMPool(pool).swap(tokenIn, netIn, minAmountOut, recipient);
        tokenInErc20.forceApprove(pool, 0);

        if (fee != 0) {
            tokenInErc20.forceApprove(feeTreasury, fee);
            IFeeTreasury(feeTreasury).depositFee(tokenIn, fee);
            tokenInErc20.forceApprove(feeTreasury, 0);
        }

        emit Swapped(tokenIn, tokenOut, received, amountOut, recipient, fee);
    }

    function registerPool(address tokenA, address tokenB, address pool) external onlyOwner {
        if (tokenA == address(0) || tokenB == address(0) || pool == address(0)) revert ZeroAddress();
        pools[_poolKey(tokenA, tokenB)] = pool;
        pools[_poolKey(tokenB, tokenA)] = pool;
        emit PoolRegistered(tokenA, tokenB, pool);
    }

    function deregisterPool(address tokenA, address tokenB) external onlyOwner {
        if (tokenA == address(0) || tokenB == address(0)) revert ZeroAddress();
        delete pools[_poolKey(tokenA, tokenB)];
        delete pools[_poolKey(tokenB, tokenA)];
        emit PoolDeregistered(tokenA, tokenB);
    }

    function setFeeBps(uint16 bps) external onlyOwner {
        if (bps > 100) revert FeeTooHigh();
        feeBps = bps;
        emit FeeBpsUpdated(bps);
    }

    function setFeeTreasury(address treasury) external onlyOwner {
        if (treasury == address(0)) revert ZeroAddress();
        feeTreasury = treasury;
        emit TreasuryUpdated(treasury);
    }

    function getPool(address tokenA, address tokenB) external view returns (address) {
        return pools[_poolKey(tokenA, tokenB)];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function renounceOwnership() public view override onlyOwner {
        revert("renounce disabled");
    }

    function _poolKey(address a, address b) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a < b ? a : b, a < b ? b : a));
    }
}
