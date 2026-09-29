// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FeeTreasury is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NotCollector();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientBalance();

    event CollectorRegistered(address collector);
    event CollectorDeregistered(address collector);
    event FeeDeposited(address indexed collector, address indexed token, uint256 amount);
    event FeeWithdrawn(address indexed to, uint256 amount);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    address public usdc;
    mapping(address => bool) public isCollector;
    uint256 public totalCollected;
    uint256 public totalWithdrawn;

    constructor(address usdc_, address initialOwner) Ownable(initialOwner) {
        if (usdc_ == address(0) || initialOwner == address(0)) revert ZeroAddress();
        usdc = usdc_;
    }

    function registerCollector(address collector) external onlyOwner {
        if (collector == address(0)) revert ZeroAddress();
        isCollector[collector] = true;
        emit CollectorRegistered(collector);
    }

    function deregisterCollector(address collector) external onlyOwner {
        if (collector == address(0)) revert ZeroAddress();
        isCollector[collector] = false;
        emit CollectorDeregistered(collector);
    }

    function depositFee(address token, uint256 amount) external whenNotPaused nonReentrant {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        totalCollected += amount;
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit FeeDeposited(msg.sender, token, amount);
    }

    function withdraw(address to, uint256 amount) external onlyOwner whenNotPaused nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 balance = IERC20(usdc).balanceOf(address(this));
        if (balance < amount) revert InsufficientBalance();
        totalWithdrawn += amount;
        IERC20(usdc).safeTransfer(to, amount);
        emit FeeWithdrawn(to, amount);
    }

    function withdrawToken(address token, address to, uint256 amount) external onlyOwner nonReentrant {
        if (token == address(0) || to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientBalance();
        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function availableBalance() external view returns (uint256) {
        return IERC20(usdc).balanceOf(address(this));
    }

    function feeBalances(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function renounceOwnership() public override onlyOwner {
        revert("RENOUNCE_DISABLED");
    }
}
