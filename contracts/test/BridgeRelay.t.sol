// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BridgeRelay} from "../BridgeRelay.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

// ─── Mock contracts ───────────────────────────────────────────────────────────

/// @dev Mock for ITokenMessenger — records calls, returns a fixed nonce.
contract MockTokenMessenger {
    uint64 public constant FIXED_NONCE = 42;
    uint256 public callCount;
    uint256 public lastAmount;
    uint32  public lastDomain;
    bytes32 public lastRecipient;
    address public lastBurnToken;

    function depositForBurn(
        uint256 amount,
        uint32  destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce) {
        // pull USDC from caller (BridgeRelay approved this contract)
        IERC20(burnToken).transferFrom(msg.sender, address(this), amount);
        callCount++;
        lastAmount    = amount;
        lastDomain    = destinationDomain;
        lastRecipient = mintRecipient;
        lastBurnToken = burnToken;
        return FIXED_NONCE;
    }
}

/// @dev Mock for IFeeTreasury (BridgeRelay variant: two-arg depositFee).
contract MockFeeTreasuryBR {
    uint256 public totalFees;

    function depositFee(address, uint256 amount) external {
        totalFees += amount;
    }
}

// ─── Test contract ────────────────────────────────────────────────────────────

contract BridgeRelayTest is Test {
    BridgeRelay          internal relay;
    MockERC20            internal usdc;
    MockTokenMessenger   internal messenger;
    MockFeeTreasuryBR    internal treasury;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob   = makeAddr("bob");

    uint256 internal constant RELAY_FEE = 1e6; // 1 USDC
    bytes32 internal constant RECIPIENT  = bytes32(uint256(uint160(address(0xBEEF))));
    uint32  internal constant DEST       = 6;  // arbitrary domain

    function setUp() public {
        usdc      = new MockERC20("Mock USDC", "mUSDC", 6);
        messenger = new MockTokenMessenger();
        treasury  = new MockFeeTreasuryBR();
        relay     = new BridgeRelay(
            address(usdc),
            address(messenger),
            address(treasury),
            RELAY_FEE,
            owner
        );
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    function test_Constructor_SetsFields() public view {
        assertEq(relay.usdc(),           address(usdc));
        assertEq(relay.tokenMessenger(), address(messenger));
        assertEq(relay.feeTreasury(),    address(treasury));
        assertEq(relay.relayFee(),       RELAY_FEE);
        assertEq(relay.owner(),          owner);
    }

    function test_Constructor_RevertsZeroUsdc() public {
        vm.expectRevert(BridgeRelay.ZeroAddress.selector);
        new BridgeRelay(address(0), address(messenger), address(treasury), RELAY_FEE, owner);
    }

    function test_Constructor_RevertsZeroMessenger() public {
        vm.expectRevert(BridgeRelay.ZeroAddress.selector);
        new BridgeRelay(address(usdc), address(0), address(treasury), RELAY_FEE, owner);
    }

    function test_Constructor_RevertsZeroTreasury() public {
        vm.expectRevert(BridgeRelay.ZeroAddress.selector);
        new BridgeRelay(address(usdc), address(messenger), address(0), RELAY_FEE, owner);
    }

    // ─── bridge ──────────────────────────────────────────────────────────────

    function _bridge(address sender, uint256 amount) internal returns (uint64 nonce) {
        usdc.mint(sender, amount);
        vm.startPrank(sender);
        usdc.approve(address(relay), amount);
        nonce = relay.bridge(DEST, RECIPIENT, amount);
        vm.stopPrank();
    }

    function test_Bridge_HappyPath() public {
        uint256 amount = 100e6;
        uint256 netAmt = amount - RELAY_FEE;

        usdc.mint(alice, amount);
        vm.startPrank(alice);
        usdc.approve(address(relay), amount);

        vm.expectEmit(true, false, false, true, address(relay));
        emit BridgeRelay.BridgeInitiated(alice, DEST, RECIPIENT, amount, RELAY_FEE, 42);

        uint64 nonce = relay.bridge(DEST, RECIPIENT, amount);
        vm.stopPrank();

        assertEq(nonce,                    42);
        assertEq(messenger.callCount(),    1);
        assertEq(messenger.lastAmount(),   netAmt);
        assertEq(messenger.lastDomain(),   DEST);
        assertEq(messenger.lastRecipient(),RECIPIENT);
        assertEq(treasury.totalFees(),     RELAY_FEE);
    }

    function test_Bridge_ZeroFee_SendsFullAmountToMessenger() public {
        // Deploy relay with zero fee
        BridgeRelay zeroFeeRelay = new BridgeRelay(
            address(usdc), address(messenger), address(treasury), 0, owner
        );

        uint256 amount = 50e6;
        usdc.mint(alice, amount);
        vm.startPrank(alice);
        usdc.approve(address(zeroFeeRelay), amount);
        zeroFeeRelay.bridge(DEST, RECIPIENT, amount);
        vm.stopPrank();

        assertEq(messenger.lastAmount(), amount);
        assertEq(treasury.totalFees(),   0);
    }

    function test_Bridge_RevertsZeroRecipient() public {
        uint256 amount = 100e6;
        usdc.mint(alice, amount);
        vm.startPrank(alice);
        usdc.approve(address(relay), amount);
        vm.expectRevert(BridgeRelay.ZeroRecipient.selector);
        relay.bridge(DEST, bytes32(0), amount);
        vm.stopPrank();
    }

    function test_Bridge_RevertsAmountTooSmall_EqualToFee() public {
        usdc.mint(alice, RELAY_FEE);
        vm.startPrank(alice);
        usdc.approve(address(relay), RELAY_FEE);
        vm.expectRevert(BridgeRelay.AmountTooSmall.selector);
        relay.bridge(DEST, RECIPIENT, RELAY_FEE); // amount == fee → not strictly >
        vm.stopPrank();
    }

    function test_Bridge_RevertsAmountTooSmall_BelowFee() public {
        uint256 tinyAmt = RELAY_FEE / 2;
        usdc.mint(alice, tinyAmt);
        vm.startPrank(alice);
        usdc.approve(address(relay), tinyAmt);
        vm.expectRevert(BridgeRelay.AmountTooSmall.selector);
        relay.bridge(DEST, RECIPIENT, tinyAmt);
        vm.stopPrank();
    }

    function test_Bridge_RevertsWhenPaused() public {
        vm.prank(owner);
        relay.pause();

        uint256 amount = 100e6;
        usdc.mint(alice, amount);
        vm.startPrank(alice);
        usdc.approve(address(relay), amount);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        relay.bridge(DEST, RECIPIENT, amount);
        vm.stopPrank();
    }

    // ─── setRelayFee ─────────────────────────────────────────────────────────

    function test_SetRelayFee_HappyPath() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(relay));
        emit BridgeRelay.RelayFeeUpdated(2e6);
        relay.setRelayFee(2e6);
        assertEq(relay.relayFee(), 2e6);
    }

    function test_SetRelayFee_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        relay.setRelayFee(2e6);
    }

    // ─── setFeeTreasury ───────────────────────────────────────────────────────

    function test_SetFeeTreasury_HappyPath() public {
        address newT = makeAddr("newTreasury");
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(relay));
        emit BridgeRelay.TreasuryUpdated(newT);
        relay.setFeeTreasury(newT);
        assertEq(relay.feeTreasury(), newT);
    }

    function test_SetFeeTreasury_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(BridgeRelay.ZeroAddress.selector);
        relay.setFeeTreasury(address(0));
    }

    function test_SetFeeTreasury_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        relay.setFeeTreasury(makeAddr("t"));
    }

    // ─── setTokenMessenger ────────────────────────────────────────────────────

    function test_SetTokenMessenger_HappyPath() public {
        address newM = makeAddr("newMessenger");
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(relay));
        emit BridgeRelay.MessengerUpdated(newM);
        relay.setTokenMessenger(newM);
        assertEq(relay.tokenMessenger(), newM);
    }

    function test_SetTokenMessenger_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(BridgeRelay.ZeroAddress.selector);
        relay.setTokenMessenger(address(0));
    }

    function test_SetTokenMessenger_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        relay.setTokenMessenger(makeAddr("m"));
    }

    // ─── rescueTokens ─────────────────────────────────────────────────────────

    function test_RescueTokens_HappyPath() public {
        MockERC20 other = new MockERC20("Other", "OTH", 18);
        other.mint(address(relay), 500e18);

        vm.prank(owner);
        relay.rescueTokens(address(other), bob, 500e18);

        assertEq(other.balanceOf(bob), 500e18);
    }

    function test_RescueTokens_RevertsUSDC() public {
        usdc.mint(address(relay), 100e6);
        vm.prank(owner);
        vm.expectRevert(BridgeRelay.CannotRescueUsdc.selector);
        relay.rescueTokens(address(usdc), bob, 100e6);
    }

    function test_RescueTokens_RevertsZeroToken() public {
        vm.prank(owner);
        vm.expectRevert(BridgeRelay.ZeroAddress.selector);
        relay.rescueTokens(address(0), bob, 1);
    }

    function test_RescueTokens_RevertsZeroTo() public {
        MockERC20 other = new MockERC20("O", "O", 18);
        other.mint(address(relay), 1);
        vm.prank(owner);
        vm.expectRevert(BridgeRelay.ZeroAddress.selector);
        relay.rescueTokens(address(other), address(0), 1);
    }

    function test_RescueTokens_RevertsNonOwner() public {
        MockERC20 other = new MockERC20("O", "O", 18);
        other.mint(address(relay), 1);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        relay.rescueTokens(address(other), bob, 1);
    }

    // ─── pause / unpause ─────────────────────────────────────────────────────

    function test_Pause_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        relay.pause();
    }

    function test_Unpause_OnlyOwner() public {
        vm.prank(owner);
        relay.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        relay.unpause();
    }

    function test_PauseUnpause_Roundtrip() public {
        vm.startPrank(owner);
        relay.pause();
        assertTrue(relay.paused());
        relay.unpause();
        assertFalse(relay.paused());
        vm.stopPrank();
    }

    // ─── renounceOwnership disabled ───────────────────────────────────────────

    function test_RenounceOwnership_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(bytes("RenounceOwnershipDisabled"));
        relay.renounceOwnership();
    }

    // ─── Fuzz: net amount forwarded to messenger ──────────────────────────────

    function testFuzz_Bridge_NetAmountToMessenger(uint256 amount) public {
        amount = bound(amount, RELAY_FEE + 1, 1_000_000e6);

        uint64 nonce = _bridge(alice, amount);

        assertEq(nonce,                  42);
        assertEq(messenger.lastAmount(), amount - RELAY_FEE);
        assertEq(treasury.totalFees(),   RELAY_FEE);
    }
}
