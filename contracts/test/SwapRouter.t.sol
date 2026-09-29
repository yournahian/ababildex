// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SwapRouter} from "../SwapRouter.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

/// @dev Minimal mock AMMPool that returns a fixed amountOut.
contract MockAMMPool {
    address public tokenA;
    address public tokenB;
    uint256 public fixedOut;

    constructor(address _tokenA, address _tokenB, uint256 _fixedOut) {
        tokenA   = _tokenA;
        tokenB   = _tokenB;
        fixedOut = _fixedOut;
    }

    /// Mimics AMMPool.swap: pulls tokenIn, pushes tokenOut to `to`.
    function swap(address tokenIn, uint256 amountIn, uint256 /*minOut*/, address to)
        external
        returns (uint256)
    {
        // pull tokenIn from router
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        // push tokenOut to recipient
        address tokenOut = tokenIn == tokenA ? tokenB : tokenA;
        IERC20(tokenOut).transfer(to, fixedOut);
        return fixedOut;
    }
}

/// @dev Minimal mock FeeTreasury that accepts depositFee(address, uint256).
///      Pulls tokens from caller (mirroring FeeTreasury.depositFee behaviour).
contract MockFeeTreasury {
    uint256 public totalFees;

    function depositFee(address token, uint256 amount) external {
        // pull the fee tokens (router already approved this contract)
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        totalFees += amount;
    }
}

contract SwapRouterTest is Test {
    SwapRouter      internal router;
    MockFeeTreasury internal treasury;
    MockAMMPool     internal mockPool;
    MockERC20       internal tokenIn;
    MockERC20       internal tokenOut;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");

    uint16 internal constant FEE_BPS   = 30;  // 0.30 %
    uint256 internal constant FIXED_OUT = 990e6;

    uint256 internal deadline;

    function setUp() public {
        tokenIn  = new MockERC20("TokenIn",  "TIN",  18);
        tokenOut = new MockERC20("TokenOut", "TOUT", 6);
        treasury = new MockFeeTreasury();

        // Pre-fund mock pool with tokenOut so it can push to recipient
        mockPool = new MockAMMPool(address(tokenIn), address(tokenOut), FIXED_OUT);
        tokenOut.mint(address(mockPool), 1_000_000e6);

        router = new SwapRouter(address(treasury), FEE_BPS, owner);

        vm.prank(owner);
        router.registerPool(address(tokenIn), address(tokenOut), address(mockPool));

        deadline = block.timestamp + 1 hours;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    function test_Constructor_SetsFields() public view {
        assertEq(router.feeTreasury(), address(treasury));
        assertEq(router.feeBps(),      FEE_BPS);
        assertEq(router.owner(),       owner);
    }

    function test_Constructor_RevertsZeroTreasury() public {
        vm.expectRevert(SwapRouter.ZeroAddress.selector);
        new SwapRouter(address(0), FEE_BPS, owner);
    }

    function test_Constructor_RevertsZeroOwner() public {
        // OZ Ownable fires OwnableInvalidOwner before the contract's ZeroAddress guard
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new SwapRouter(address(treasury), FEE_BPS, address(0));
    }

    function test_Constructor_RevertsFeeTooHigh() public {
        vm.expectRevert(SwapRouter.FeeTooHigh.selector);
        new SwapRouter(address(treasury), 101, owner);
    }

    // ─── registerPool ─────────────────────────────────────────────────────────

    function test_RegisterPool_HappyPath() public {
        MockERC20 ta = new MockERC20("A", "A", 18);
        MockERC20 tb = new MockERC20("B", "B", 18);
        address   p  = makeAddr("pool");

        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(router));
        emit SwapRouter.PoolRegistered(address(ta), address(tb), p);
        router.registerPool(address(ta), address(tb), p);

        assertEq(router.getPool(address(ta), address(tb)), p);
        assertEq(router.getPool(address(tb), address(ta)), p); // bidirectional
    }

    function test_RegisterPool_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        router.registerPool(address(tokenIn), address(tokenOut), address(mockPool));
    }

    function test_RegisterPool_RevertsZeroPool() public {
        vm.prank(owner);
        vm.expectRevert(SwapRouter.ZeroAddress.selector);
        router.registerPool(address(tokenIn), address(tokenOut), address(0));
    }

    // ─── deregisterPool ───────────────────────────────────────────────────────

    function test_DeregisterPool_HappyPath() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(router));
        emit SwapRouter.PoolDeregistered(address(tokenIn), address(tokenOut));
        router.deregisterPool(address(tokenIn), address(tokenOut));

        assertEq(router.getPool(address(tokenIn), address(tokenOut)), address(0));
    }

    function test_DeregisterPool_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        router.deregisterPool(address(tokenIn), address(tokenOut));
    }

    // ─── setFeeBps ────────────────────────────────────────────────────────────

    function test_SetFeeBps_HappyPath() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(router));
        emit SwapRouter.FeeBpsUpdated(50);
        router.setFeeBps(50);
        assertEq(router.feeBps(), 50);
    }

    function test_SetFeeBps_RevertsFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(SwapRouter.FeeTooHigh.selector);
        router.setFeeBps(101);
    }

    function test_SetFeeBps_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        router.setFeeBps(10);
    }

    // ─── setFeeTreasury ───────────────────────────────────────────────────────

    function test_SetFeeTreasury_HappyPath() public {
        address newTreasury = makeAddr("newTreasury");
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(router));
        emit SwapRouter.TreasuryUpdated(newTreasury);
        router.setFeeTreasury(newTreasury);
        assertEq(router.feeTreasury(), newTreasury);
    }

    function test_SetFeeTreasury_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(SwapRouter.ZeroAddress.selector);
        router.setFeeTreasury(address(0));
    }

    function test_SetFeeTreasury_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        router.setFeeTreasury(makeAddr("t"));
    }

    // ─── swap ─────────────────────────────────────────────────────────────────

    function _approveAndSwap(uint256 amountIn, uint256 minOut)
        internal
        returns (uint256 amountOut)
    {
        tokenIn.mint(alice, amountIn);
        vm.startPrank(alice);
        tokenIn.approve(address(router), amountIn);
        amountOut = router.swap(
            address(tokenIn), address(tokenOut),
            amountIn, minOut,
            alice, deadline
        );
        vm.stopPrank();
    }

    function test_Swap_HappyPath() public {
        uint256 amountIn = 1_000e18;
        uint256 fee      = (amountIn * FEE_BPS) / 10_000;

        tokenIn.mint(alice, amountIn);
        vm.startPrank(alice);
        tokenIn.approve(address(router), amountIn);

        vm.expectEmit(true, true, true, true, address(router));
        emit SwapRouter.Swapped(address(tokenIn), address(tokenOut), amountIn, FIXED_OUT, alice, fee);

        uint256 out = router.swap(
            address(tokenIn), address(tokenOut),
            amountIn, 1,
            alice, deadline
        );
        vm.stopPrank();

        assertEq(out, FIXED_OUT);
        assertEq(tokenOut.balanceOf(alice), FIXED_OUT);
    }

    function test_Swap_ChargesFeeToTreasury() public {
        uint256 amountIn = 1_000e18;
        uint256 fee      = (amountIn * FEE_BPS) / 10_000;

        _approveAndSwap(amountIn, 1);

        // router pulled tokenIn from alice, sent fee to treasury
        assertEq(tokenIn.balanceOf(address(treasury)), fee);
    }

    function test_Swap_RevertsDeadlineExpired() public {
        tokenIn.mint(alice, 1_000e18);
        vm.startPrank(alice);
        tokenIn.approve(address(router), 1_000e18);
        vm.expectRevert(SwapRouter.DeadlineExpired.selector);
        router.swap(
            address(tokenIn), address(tokenOut),
            1_000e18, 1,
            alice, block.timestamp - 1
        );
        vm.stopPrank();
    }

    function test_Swap_RevertsZeroAmountIn() public {
        vm.prank(alice);
        vm.expectRevert(SwapRouter.ZeroAmount.selector);
        router.swap(
            address(tokenIn), address(tokenOut),
            0, 1,
            alice, deadline
        );
    }

    function test_Swap_RevertsZeroMinAmountOut() public {
        tokenIn.mint(alice, 1_000e18);
        vm.startPrank(alice);
        tokenIn.approve(address(router), 1_000e18);
        vm.expectRevert(SwapRouter.ZeroAmount.selector);
        router.swap(
            address(tokenIn), address(tokenOut),
            1_000e18, 0,
            alice, deadline
        );
        vm.stopPrank();
    }

    function test_Swap_RevertsZeroRecipient() public {
        tokenIn.mint(alice, 1_000e18);
        vm.startPrank(alice);
        tokenIn.approve(address(router), 1_000e18);
        vm.expectRevert(SwapRouter.ZeroAddress.selector);
        router.swap(
            address(tokenIn), address(tokenOut),
            1_000e18, 1,
            address(0), deadline
        );
        vm.stopPrank();
    }

    function test_Swap_RevertsNoPoolFound() public {
        MockERC20 unknown = new MockERC20("X", "X", 18);
        tokenIn.mint(alice, 1_000e18);
        vm.startPrank(alice);
        tokenIn.approve(address(router), 1_000e18);
        vm.expectRevert(SwapRouter.NoPoolFound.selector);
        router.swap(
            address(unknown), address(tokenOut),
            1_000e18, 1,
            alice, deadline
        );
        vm.stopPrank();
    }

    function test_Swap_RevertsWhenPaused() public {
        vm.prank(owner);
        router.pause();

        tokenIn.mint(alice, 1_000e18);
        vm.startPrank(alice);
        tokenIn.approve(address(router), 1_000e18);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        router.swap(
            address(tokenIn), address(tokenOut),
            1_000e18, 1,
            alice, deadline
        );
        vm.stopPrank();
    }

    // ─── pause / unpause ─────────────────────────────────────────────────────

    function test_Pause_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        router.pause();
    }

    function test_Unpause_OnlyOwner() public {
        vm.prank(owner);
        router.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        router.unpause();
    }

    function test_PauseUnpause_Roundtrip() public {
        vm.startPrank(owner);
        router.pause();
        assertTrue(router.paused());
        router.unpause();
        assertFalse(router.paused());
        vm.stopPrank();
    }

    // ─── Fuzz: fee arithmetic ─────────────────────────────────────────────────

    function testFuzz_Swap_FeeArithmetic(uint256 amountIn, uint16 bps) public {
        amountIn = bound(amountIn, 10_000, 1_000_000e18);
        bps      = uint16(bound(uint256(bps), 0, 100));

        vm.prank(owner);
        router.setFeeBps(bps);

        // pool must have at least FIXED_OUT of tokenOut ready
        // (mockPool returns FIXED_OUT regardless of amountIn, which is fine)

        tokenIn.mint(alice, amountIn);
        vm.startPrank(alice);
        tokenIn.approve(address(router), amountIn);
        router.swap(
            address(tokenIn), address(tokenOut),
            amountIn, 1,
            alice, deadline
        );
        vm.stopPrank();

        uint256 expectedFee = (amountIn * bps) / 10_000;
        // treasury pulled the fee via depositFee → check its tokenIn balance
        assertEq(tokenIn.balanceOf(address(treasury)), expectedFee);
    }
}
