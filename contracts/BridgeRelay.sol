// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITokenMessenger {
    function depositForBurn(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken)
        external
        returns (uint64 nonce);
}

interface IFeeTreasury {
    function depositFee(address token, uint256 amount) external;
}

contract BridgeRelay is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error ZeroAddress();
    error AmountTooSmall();
    error ZeroRecipient();
    error CannotRescueUsdc();

    event BridgeInitiated(
        address indexed sender,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        uint256 amount,
        uint256 fee,
        uint64 nonce
    );
    event RelayFeeUpdated(uint256 fee);
    event TreasuryUpdated(address treasury);
    event MessengerUpdated(address messenger);

    address public usdc;
    address public tokenMessenger;
    address public feeTreasury;
    uint256 public relayFee;

    constructor(address usdc_, address tokenMessenger_, address feeTreasury_, uint256 relayFee_, address initialOwner)
        Ownable(initialOwner)
    {
        if (usdc_ == address(0) || tokenMessenger_ == address(0) || feeTreasury_ == address(0)) revert ZeroAddress();

        usdc = usdc_;
        tokenMessenger = tokenMessenger_;
        feeTreasury = feeTreasury_;
        relayFee = relayFee_;
    }

    function bridge(uint32 destinationDomain, bytes32 mintRecipient, uint256 amount)
        external
        whenNotPaused
        nonReentrant
        returns (uint64 nonce)
    {
        if (mintRecipient == bytes32(0)) revert ZeroRecipient();
        if (amount <= relayFee) revert AmountTooSmall();

        IERC20 usdcToken = IERC20(usdc);

        uint256 balanceBefore = usdcToken.balanceOf(address(this));
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = usdcToken.balanceOf(address(this)) - balanceBefore;
        if (received != amount) revert AmountTooSmall();

        uint256 fee = relayFee;
        uint256 netAmount = amount - fee;

        if (fee != 0) {
            usdcToken.forceApprove(feeTreasury, 0);
            usdcToken.forceApprove(feeTreasury, fee);
            IFeeTreasury(feeTreasury).depositFee(usdc, fee);
            usdcToken.forceApprove(feeTreasury, 0);
        }

        usdcToken.forceApprove(tokenMessenger, 0);
        usdcToken.forceApprove(tokenMessenger, netAmount);
        nonce = ITokenMessenger(tokenMessenger).depositForBurn(netAmount, destinationDomain, mintRecipient, usdc);
        usdcToken.forceApprove(tokenMessenger, 0);

        emit BridgeInitiated(msg.sender, destinationDomain, mintRecipient, amount, fee, nonce);
    }

    function setRelayFee(uint256 fee_) external onlyOwner {
        relayFee = fee_;
        emit RelayFeeUpdated(fee_);
    }

    function setFeeTreasury(address feeTreasury_) external onlyOwner {
        if (feeTreasury_ == address(0)) revert ZeroAddress();
        feeTreasury = feeTreasury_;
        emit TreasuryUpdated(feeTreasury_);
    }

    function setTokenMessenger(address tokenMessenger_) external onlyOwner {
        if (tokenMessenger_ == address(0)) revert ZeroAddress();
        tokenMessenger = tokenMessenger_;
        emit MessengerUpdated(tokenMessenger_);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        if (token == usdc) revert CannotRescueUsdc();
        if (token == address(0) || to == address(0)) revert ZeroAddress();

        IERC20(token).safeTransfer(to, amount);
    }

    function renounceOwnership() public pure override {
        revert("RenounceOwnershipDisabled");
    }
}
