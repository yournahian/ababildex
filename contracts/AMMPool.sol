// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AMMPool is ERC20, Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error OnlyRouter();
    error InsufficientLiquidity();
    error InsufficientOutput();
    error KInvariantViolated();
    error ZeroAddress();
    error InvalidToken();

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpMinted);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 lpBurned);
    event Swapped(address indexed tokenIn, uint256 amountIn, uint256 amountOut, address indexed to);
    event RouterSet(address router);

    address public tokenA;
    address public tokenB;
    uint112 public reserveA;
    uint112 public reserveB;
    address public router;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    modifier onlyRouter() {
        if (msg.sender != router) revert OnlyRouter();
        _;
    }

    constructor(address tokenA_, address tokenB_, address initialOwner)
        ERC20("NexusDEX LP", "NDX-LP")
        Ownable(initialOwner)
    {
        if (tokenA_ == address(0) || tokenB_ == address(0) || initialOwner == address(0)) {
            revert ZeroAddress();
        }
        tokenA = tokenA_;
        tokenB = tokenB_;
    }

    function setRouter(address router_) external onlyOwner {
        if (router_ == address(0)) revert ZeroAddress();
        router = router_;
        emit RouterSet(router_);
    }

    function addLiquidity(uint256 amountA, uint256 amountB, address to)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 lpMinted)
    {
        if (to == address(0)) revert ZeroAddress();
        if (amountA == 0 || amountB == 0) revert InsufficientLiquidity();

        uint112 reserveABefore = reserveA;
        uint112 reserveBBefore = reserveB;

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        uint256 actualA = IERC20(tokenA).balanceOf(address(this)) - reserveABefore;
        uint256 actualB = IERC20(tokenB).balanceOf(address(this)) - reserveBBefore;
        if (actualA == 0 || actualB == 0) revert InsufficientLiquidity();

        uint256 supply = totalSupply();
        if (supply == 0) {
            uint256 liquidity = _sqrt(actualA * actualB);
            lpMinted = liquidity - MINIMUM_LIQUIDITY;
            _mint(address(1), MINIMUM_LIQUIDITY);
        } else {
            uint256 lpFromA = (actualA * supply) / reserveABefore;
            uint256 lpFromB = (actualB * supply) / reserveBBefore;
            lpMinted = _min(lpFromA, lpFromB);
        }

        if (lpMinted == 0) revert InsufficientLiquidity();
        _mint(to, lpMinted);
        _updateReserves(uint256(reserveABefore) + actualA, uint256(reserveBBefore) + actualB);
        emit LiquidityAdded(msg.sender, actualA, actualB, lpMinted);
    }

    function removeLiquidity(uint256 lpAmount, uint256 minA, uint256 minB, address to)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 amountA, uint256 amountB)
    {
        if (to == address(0)) revert ZeroAddress();
        if (lpAmount == 0) revert InsufficientLiquidity();

        uint112 reserveABefore = reserveA;
        uint112 reserveBBefore = reserveB;
        uint256 supply = totalSupply();

        if (supply == 0 || reserveABefore == 0 || reserveBBefore == 0) revert InsufficientLiquidity();

        amountA = (lpAmount * reserveABefore) / supply;
        amountB = (lpAmount * reserveBBefore) / supply;
        if (amountA < minA || amountB < minB) revert InsufficientOutput();

        _burn(msg.sender, lpAmount);
        IERC20(tokenA).safeTransfer(to, amountA);
        IERC20(tokenB).safeTransfer(to, amountB);
        _updateReserves(uint256(reserveABefore) - amountA, uint256(reserveBBefore) - amountB);
        emit LiquidityRemoved(msg.sender, amountA, amountB, lpAmount);
    }

    function swap(address tokenIn, uint256 amountIn, uint256 minOut, address to)
        external
        whenNotPaused
        nonReentrant
        onlyRouter
        returns (uint256 amountOut)
    {
        if (amountIn == 0) revert InsufficientOutput();

        uint112 oldReserveA = reserveA;
        uint112 oldReserveB = reserveB;
        if (oldReserveA == 0 || oldReserveB == 0) revert InsufficientLiquidity();

        uint256 oldK = uint256(oldReserveA) * uint256(oldReserveB);

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        if (tokenIn == tokenA) {
            amountOut = (uint256(oldReserveB) * amountIn) / (uint256(oldReserveA) + amountIn);
            if (amountOut < minOut) revert InsufficientOutput();
            _updateReserves(uint256(oldReserveA) + amountIn, uint256(oldReserveB) - amountOut);
            IERC20(tokenB).safeTransfer(to, amountOut);
        } else if (tokenIn == tokenB) {
            amountOut = (uint256(oldReserveA) * amountIn) / (uint256(oldReserveB) + amountIn);
            if (amountOut < minOut) revert InsufficientOutput();
            _updateReserves(uint256(oldReserveA) - amountOut, uint256(oldReserveB) + amountIn);
            IERC20(tokenA).safeTransfer(to, amountOut);
        } else {
            revert InvalidToken();
        }

        emit Swapped(tokenIn, amountIn, amountOut, to);

        uint256 newK = uint256(reserveA) * uint256(reserveB);
        if (newK < oldK) revert KInvariantViolated();
    }

    function getReserves() external view returns (uint112, uint112) {
        return (reserveA, reserveB);
    }

    function getAmountOut(address tokenIn, uint256 amountIn) external view returns (uint256 amountOut) {
        if (tokenIn != tokenA && tokenIn != tokenB) revert InvalidToken();
        if (amountIn == 0) return 0;
        uint112 reserveA_ = reserveA;
        uint112 reserveB_ = reserveB;
        if (reserveA_ == 0 || reserveB_ == 0) revert InsufficientLiquidity();
        if (tokenIn == tokenA) {
            amountOut = (uint256(reserveB_) * amountIn) / (uint256(reserveA_) + amountIn);
        } else {
            amountOut = (uint256(reserveA_) * amountIn) / (uint256(reserveB_) + amountIn);
        }
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

    function _updateReserves(uint256 newReserveA, uint256 newReserveB) internal {
        if (newReserveA > type(uint112).max || newReserveB > type(uint112).max) {
            revert InsufficientLiquidity();
        }
        // forge-lint: disable-next-line(unsafe-typecast)
        reserveA = uint112(newReserveA);
        // forge-lint: disable-next-line(unsafe-typecast)
        reserveB = uint112(newReserveB);
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y == 0) return 0;
        z = y;
        uint256 x = (y / 2) + 1;
        while (x < z) {
            z = x;
            x = (y / x + x) / 2;
        }
    }
}
