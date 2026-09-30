// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {FeeTreasury} from "../FeeTreasury.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

contract FeeTreasuryTest is Test {
    FeeTreasury internal treasury;
    MockERC20 internal usdc;
    MockERC20 internal otherToken;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant DEPOSIT_AMOUNT = 1_000e6;

    function setUp() public {
        usdc = new MockERC20("Mock USDC", "mUSDC", 6);
        otherToken = new MockERC20("Other Token", "OTK", 18);
        treasury = new FeeTreasury(address(usdc), owner);

        // Seed alice and bob with USDC
        usdc.mint(alice, 10_000e6);
        usdc.mint(bob, 10_000e6);
    }

    // ─── Constructor ────────────────────────────────────────────────────────

    function test_Constructor_SetsUsdcAndOwner() public view {
        assertEq(treasury.usdc(), address(usdc));
        assertEq(treasury.owner(), owner);
    }

    function test_Constructor_RevertsZeroUsdc() public {
        vm.expectRevert(FeeTreasury.ZeroAddress.selector);
        new FeeTreasury(address(0), owner);
    }

    function test_Constructor_RevertsZeroOwner() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new FeeTreasury(address(usdc), address(0));
    }

    // ─── depositFee ─────────────────────────────────────────────────────────

    function test_DepositFee_HappyPath() public {
        vm.startPrank(alice);
        usdc.approve(address(treasury), DEPOSIT_AMOUNT);
        vm.expectEmit(true, false, false, true, address(treasury));
        emit FeeTreasury.FeeDeposited(alice, address(usdc), DEPOSIT_AMOUNT);
        treasury.depositFee(address(usdc), DEPOSIT_AMOUNT);
        vm.stopPrank();

        assertEq(treasury.totalCollected(), DEPOSIT_AMOUNT);
        assertEq(usdc.balanceOf(address(treasury)), DEPOSIT_AMOUNT);
    }

    function test_DepositFee_AccumulatesMultipleDeposits() public {
        vm.startPrank(alice);
        usdc.approve(address(treasury), DEPOSIT_AMOUNT * 2);
        treasury.depositFee(address(usdc), DEPOSIT_AMOUNT);
        treasury.depositFee(address(usdc), DEPOSIT_AMOUNT);
        vm.stopPrank();

        assertEq(treasury.totalCollected(), DEPOSIT_AMOUNT * 2);
    }

    function test_DepositFee_RevertsZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(FeeTreasury.ZeroAmount.selector);
        treasury.depositFee(address(usdc), 0);
    }

    function test_DepositFee_RevertsWhenPaused() public {
        vm.prank(owner);
        treasury.pause();

        vm.startPrank(alice);
        usdc.approve(address(treasury), DEPOSIT_AMOUNT);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        treasury.depositFee(address(usdc), DEPOSIT_AMOUNT);
        vm.stopPrank();
    }

    // ─── withdraw ────────────────────────────────────────────────────────────

    function test_Withdraw_HappyPath() public {
        // Fund treasury first
        vm.startPrank(alice);
        usdc.approve(address(treasury), DEPOSIT_AMOUNT);
        treasury.depositFee(address(usdc), DEPOSIT_AMOUNT);
        vm.stopPrank();

        vm.prank(owner);
        vm.expectEmit(true, false, false, true, address(treasury));
        emit FeeTreasury.FeeWithdrawn(bob, DEPOSIT_AMOUNT);
        treasury.withdraw(bob, DEPOSIT_AMOUNT);

        assertEq(usdc.balanceOf(bob), 10_000e6 + DEPOSIT_AMOUNT);
    }

    function test_Withdraw_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        treasury.withdraw(bob, DEPOSIT_AMOUNT);
    }

    function test_Withdraw_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(FeeTreasury.ZeroAddress.selector);
        treasury.withdraw(address(0), DEPOSIT_AMOUNT);
    }

    function test_Withdraw_RevertsZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(FeeTreasury.ZeroAmount.selector);
        treasury.withdraw(bob, 0);
    }

    function test_Withdraw_RevertsInsufficientBalance() public {
        vm.prank(owner);
        vm.expectRevert(FeeTreasury.InsufficientBalance.selector);
        treasury.withdraw(bob, 1);
    }

    function test_Withdraw_RevertsWhenPaused() public {
        vm.startPrank(alice);
        usdc.approve(address(treasury), DEPOSIT_AMOUNT);
        treasury.depositFee(address(usdc), DEPOSIT_AMOUNT);
        vm.stopPrank();

        vm.startPrank(owner);
        treasury.pause();
        vm.expectRevert(Pausable.EnforcedPause.selector);
        treasury.withdraw(bob, DEPOSIT_AMOUNT);
        vm.stopPrank();
    }

    // ─── withdrawToken ────────────────────────────────────────────────────────

    function test_WithdrawToken_HappyPath() public {
        // Send otherToken directly to treasury
        otherToken.mint(address(treasury), 500e18);

        vm.prank(owner);
        vm.expectEmit(true, true, false, true, address(treasury));
        emit FeeTreasury.TokenWithdrawn(address(otherToken), bob, 500e18);
        treasury.withdrawToken(address(otherToken), bob, 500e18);

        assertEq(otherToken.balanceOf(bob), 500e18);
    }

    function test_WithdrawToken_RevertsNonOwner() public {
        otherToken.mint(address(treasury), 500e18);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        treasury.withdrawToken(address(otherToken), bob, 500e18);
    }

    function test_WithdrawToken_RevertsZeroToken() public {
        vm.prank(owner);
        vm.expectRevert(FeeTreasury.ZeroAddress.selector);
        treasury.withdrawToken(address(0), bob, 1);
    }

    function test_WithdrawToken_RevertsZeroTo() public {
        vm.prank(owner);
        vm.expectRevert(FeeTreasury.ZeroAddress.selector);
        treasury.withdrawToken(address(otherToken), address(0), 1);
    }

    function test_WithdrawToken_RevertsZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(FeeTreasury.ZeroAmount.selector);
        treasury.withdrawToken(address(otherToken), bob, 0);
    }

    function test_WithdrawToken_RevertsInsufficientBalance() public {
        vm.prank(owner);
        vm.expectRevert(FeeTreasury.InsufficientBalance.selector);
        treasury.withdrawToken(address(otherToken), bob, 1);
    }

    // ─── pause / unpause ─────────────────────────────────────────────────────

    function test_Pause_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        treasury.pause();
    }

    function test_Unpause_OnlyOwner() public {
        vm.prank(owner);
        treasury.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        treasury.unpause();
    }

    function test_PauseUnpause_Roundtrip() public {
        vm.startPrank(owner);
        treasury.pause();
        assertTrue(treasury.paused());
        treasury.unpause();
        assertFalse(treasury.paused());
        vm.stopPrank();
    }

    // ─── Fuzz: deposit then withdraw ─────────────────────────────────────────

    function testFuzz_DepositAndWithdraw(uint256 amount) public {
        amount = bound(amount, 1, 1_000_000e6);

        usdc.mint(alice, amount);

        vm.startPrank(alice);
        usdc.approve(address(treasury), amount);
        treasury.depositFee(address(usdc), amount);
        vm.stopPrank();

        assertEq(treasury.totalCollected(), amount);

        uint256 bobBefore = usdc.balanceOf(bob);
        vm.prank(owner);
        treasury.withdraw(bob, amount);
        assertEq(usdc.balanceOf(bob), bobBefore + amount);
    }
}
