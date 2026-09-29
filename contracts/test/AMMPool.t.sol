// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AMMPool} from "../AMMPool.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

contract AMMPoolTest is Test {
    AMMPool   internal pool;
    MockERC20 internal tokenA;
    MockERC20 internal tokenB;

    address internal owner  = makeAddr("owner");
    address internal router = makeAddr("router");
    address internal alice  = makeAddr("alice");
    address internal bob    = makeAddr("bob");

    uint256 internal constant LARGE_A = 100_000e18;
    uint256 internal constant LARGE_B = 200_000e6;

    // ─── helpers ─────────────────────────────────────────────────────────────

    /// Seed alice with tokens and mint initial liquidity into the pool.
    function _seedLiquidity(uint256 amtA, uint256 amtB) internal returns (uint256 lp) {
        tokenA.mint(alice, amtA);
        tokenB.mint(alice, amtB);
        vm.startPrank(alice);
        tokenA.approve(address(pool), amtA);
        tokenB.approve(address(pool), amtB);
        lp = pool.addLiquidity(amtA, amtB, alice);
        vm.stopPrank();
    }

    function setUp() public {
        tokenA = new MockERC20("Token A", "TKA", 18);
        tokenB = new MockERC20("Token B", "TKB", 6);
        pool   = new AMMPool(address(tokenA), address(tokenB), owner);

        vm.prank(owner);
        pool.setRouter(router);
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    function test_Constructor_SetsTokensAndOwner() public view {
        assertEq(pool.tokenA(), address(tokenA));
        assertEq(pool.tokenB(), address(tokenB));
        assertEq(pool.owner(),  owner);
    }

    function test_Constructor_RevertsZeroTokenA() public {
        vm.expectRevert(AMMPool.ZeroAddress.selector);
        new AMMPool(address(0), address(tokenB), owner);
    }

    function test_Constructor_RevertsZeroTokenB() public {
        vm.expectRevert(AMMPool.ZeroAddress.selector);
        new AMMPool(address(tokenA), address(0), owner);
    }

    function test_Constructor_RevertsZeroOwner() public {
        // OZ Ownable fires OwnableInvalidOwner before the contract's ZeroAddress guard
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new AMMPool(address(tokenA), address(tokenB), address(0));
    }

    // ─── setRouter ────────────────────────────────────────────────────────────

    function test_SetRouter_HappyPath() public {
        address newRouter = makeAddr("newRouter");
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(pool));
        emit AMMPool.RouterSet(newRouter);
        pool.setRouter(newRouter);
        assertEq(pool.router(), newRouter);
    }

    function test_SetRouter_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        pool.setRouter(makeAddr("r"));
    }

    function test_SetRouter_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(AMMPool.ZeroAddress.selector);
        pool.setRouter(address(0));
    }

    // ─── addLiquidity ─────────────────────────────────────────────────────────

    function test_AddLiquidity_InitialMint() public {
        uint256 amtA = 1_000e18;
        uint256 amtB = 2_000e6;

        tokenA.mint(alice, amtA);
        tokenB.mint(alice, amtB);

        vm.startPrank(alice);
        tokenA.approve(address(pool), amtA);
        tokenB.approve(address(pool), amtB);
        uint256 lp = pool.addLiquidity(amtA, amtB, alice);
        vm.stopPrank();

        // LP minted > 0 and reserves set
        assertGt(lp, 0);
        (uint112 rA, uint112 rB) = pool.getReserves();
        assertEq(rA, amtA);
        assertEq(rB, amtB);
        assertEq(pool.balanceOf(alice), lp);
    }

    function test_AddLiquidity_SubsequentMintUsesBalanceDelta() public {
        _seedLiquidity(LARGE_A, LARGE_B);

        uint256 addA = 10_000e18;
        uint256 addB = 20_000e6;
        tokenA.mint(bob, addA);
        tokenB.mint(bob, addB);

        vm.startPrank(bob);
        tokenA.approve(address(pool), addA);
        tokenB.approve(address(pool), addB);
        uint256 lp = pool.addLiquidity(addA, addB, bob);
        vm.stopPrank();

        assertGt(lp, 0);
    }

    function test_AddLiquidity_RevertsZeroTo() public {
        tokenA.mint(alice, 1e18);
        tokenB.mint(alice, 1e6);
        vm.startPrank(alice);
        tokenA.approve(address(pool), 1e18);
        tokenB.approve(address(pool), 1e6);
        vm.expectRevert(AMMPool.ZeroAddress.selector);
        pool.addLiquidity(1e18, 1e6, address(0));
        vm.stopPrank();
    }

    function test_AddLiquidity_RevertsZeroAmounts() public {
        vm.prank(alice);
        vm.expectRevert(AMMPool.InsufficientLiquidity.selector);
        pool.addLiquidity(0, 1e6, alice);
    }

    function test_AddLiquidity_RevertsWhenPaused() public {
        vm.prank(owner);
        pool.pause();

        tokenA.mint(alice, 1e18);
        tokenB.mint(alice, 1e6);
        vm.startPrank(alice);
        tokenA.approve(address(pool), 1e18);
        tokenB.approve(address(pool), 1e6);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        pool.addLiquidity(1e18, 1e6, alice);
        vm.stopPrank();
    }

    // ─── removeLiquidity ──────────────────────────────────────────────────────

    function test_RemoveLiquidity_HappyPath() public {
        uint256 amtA = 1_000e18;
        uint256 amtB = 2_000e6;
        uint256 lp   = _seedLiquidity(amtA, amtB);

        uint256 aliceA0 = tokenA.balanceOf(alice);
        uint256 aliceB0 = tokenB.balanceOf(alice);

        vm.startPrank(alice);
        pool.approve(address(pool), lp);
        (uint256 outA, uint256 outB) = pool.removeLiquidity(lp, 0, 0, alice);
        vm.stopPrank();

        assertGt(outA, 0);
        assertGt(outB, 0);
        assertEq(tokenA.balanceOf(alice), aliceA0 + outA);
        assertEq(tokenB.balanceOf(alice), aliceB0 + outB);
    }

    function test_RemoveLiquidity_RevertsSlippage() public {
        uint256 lp = _seedLiquidity(LARGE_A, LARGE_B);

        vm.startPrank(alice);
        pool.approve(address(pool), lp);
        vm.expectRevert(AMMPool.InsufficientOutput.selector);
        pool.removeLiquidity(lp, type(uint256).max, 0, alice);
        vm.stopPrank();
    }

    function test_RemoveLiquidity_RevertsZeroLP() public {
        _seedLiquidity(LARGE_A, LARGE_B);
        vm.prank(alice);
        vm.expectRevert(AMMPool.InsufficientLiquidity.selector);
        pool.removeLiquidity(0, 0, 0, alice);
    }

    function test_RemoveLiquidity_RevertsZeroTo() public {
        uint256 lp = _seedLiquidity(LARGE_A, LARGE_B);
        vm.startPrank(alice);
        pool.approve(address(pool), lp);
        vm.expectRevert(AMMPool.ZeroAddress.selector);
        pool.removeLiquidity(lp, 0, 0, address(0));
        vm.stopPrank();
    }

    function test_RemoveLiquidity_RevertsWhenPaused() public {
        uint256 lp = _seedLiquidity(LARGE_A, LARGE_B);

        vm.prank(owner);
        pool.pause();

        vm.startPrank(alice);
        pool.approve(address(pool), lp);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        pool.removeLiquidity(lp, 0, 0, alice);
        vm.stopPrank();
    }

    // ─── swap ─────────────────────────────────────────────────────────────────

    function test_Swap_AtoB_HappyPath() public {
        _seedLiquidity(LARGE_A, LARGE_B);

        uint256 amountIn = 1_000e18;
        tokenA.mint(router, amountIn);
        vm.startPrank(router);
        tokenA.approve(address(pool), amountIn);

        vm.expectEmit(true, false, false, false, address(pool));
        emit AMMPool.Swapped(address(tokenA), amountIn, 0, bob); // amountOut checked separately

        uint256 out = pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();

        assertGt(out, 0);
        assertEq(tokenB.balanceOf(bob), out);
    }

    function test_Swap_BtoA_HappyPath() public {
        _seedLiquidity(LARGE_A, LARGE_B);

        uint256 amountIn = 1_000e6;
        tokenB.mint(router, amountIn);
        vm.startPrank(router);
        tokenB.approve(address(pool), amountIn);
        uint256 out = pool.swap(address(tokenB), amountIn, 0, bob);
        vm.stopPrank();

        assertGt(out, 0);
        assertEq(tokenA.balanceOf(bob), out);
    }

    function test_Swap_RevertsOnlyRouter() public {
        _seedLiquidity(LARGE_A, LARGE_B);
        tokenA.mint(alice, 1e18);
        vm.startPrank(alice);
        tokenA.approve(address(pool), 1e18);
        vm.expectRevert(AMMPool.OnlyRouter.selector);
        pool.swap(address(tokenA), 1e18, 0, alice);
        vm.stopPrank();
    }

    function test_Swap_RevertsInvalidToken() public {
        _seedLiquidity(LARGE_A, LARGE_B);
        // Deploy a real ERC20 that is neither tokenA nor tokenB
        MockERC20 badToken = new MockERC20("Bad", "BAD", 18);
        badToken.mint(router, 1e18);
        vm.startPrank(router);
        badToken.approve(address(pool), 1e18);
        vm.expectRevert(AMMPool.InvalidToken.selector);
        pool.swap(address(badToken), 1e18, 0, router);
        vm.stopPrank();
    }

    function test_Swap_RevertsInsufficientOutput() public {
        _seedLiquidity(LARGE_A, LARGE_B);

        uint256 amountIn = 1_000e18;
        tokenA.mint(router, amountIn);
        vm.startPrank(router);
        tokenA.approve(address(pool), amountIn);
        vm.expectRevert(AMMPool.InsufficientOutput.selector);
        pool.swap(address(tokenA), amountIn, type(uint256).max, bob);
        vm.stopPrank();
    }

    function test_Swap_RevertsZeroAmountIn() public {
        _seedLiquidity(LARGE_A, LARGE_B);
        vm.prank(router);
        vm.expectRevert(AMMPool.InsufficientOutput.selector);
        pool.swap(address(tokenA), 0, 0, bob);
    }

    function test_Swap_RevertsNoLiquidity() public {
        tokenA.mint(router, 1e18);
        vm.startPrank(router);
        tokenA.approve(address(pool), 1e18);
        vm.expectRevert(AMMPool.InsufficientLiquidity.selector);
        pool.swap(address(tokenA), 1e18, 0, bob);
        vm.stopPrank();
    }

    function test_Swap_RevertsWhenPaused() public {
        _seedLiquidity(LARGE_A, LARGE_B);
        vm.prank(owner);
        pool.pause();

        tokenA.mint(router, 1e18);
        vm.startPrank(router);
        tokenA.approve(address(pool), 1e18);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        pool.swap(address(tokenA), 1e18, 0, bob);
        vm.stopPrank();
    }

    // ─── K-invariant ─────────────────────────────────────────────────────────

    function test_KInvariant_HoldsAfterSwap() public {
        _seedLiquidity(LARGE_A, LARGE_B);

        (uint112 rA0, uint112 rB0) = pool.getReserves();
        uint256 kBefore = uint256(rA0) * uint256(rB0);

        uint256 amountIn = 5_000e18;
        tokenA.mint(router, amountIn);
        vm.startPrank(router);
        tokenA.approve(address(pool), amountIn);
        pool.swap(address(tokenA), amountIn, 0, bob);
        vm.stopPrank();

        (uint112 rA1, uint112 rB1) = pool.getReserves();
        uint256 kAfter = uint256(rA1) * uint256(rB1);

        assertGe(kAfter, kBefore);
    }

    // ─── pause / unpause ─────────────────────────────────────────────────────

    function test_Pause_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        pool.pause();
    }

    function test_Unpause_OnlyOwner() public {
        vm.prank(owner);
        pool.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        pool.unpause();
    }

    function test_PauseUnpause_Roundtrip() public {
        vm.startPrank(owner);
        pool.pause();
        assertTrue(pool.paused());
        pool.unpause();
        assertFalse(pool.paused());
        vm.stopPrank();
    }

    // ─── Fuzz: swap output satisfies constant-product formula ────────────────

    function testFuzz_Swap_AmountOut(uint256 amtA, uint256 amtB, uint256 swapIn) public {
        amtA   = bound(amtA,   1_000e18,  500_000e18);
        amtB   = bound(amtB,   1_000e6,   500_000e6);
        swapIn = bound(swapIn, 1e15,      amtA / 10); // at most 10 % of reserve

        _seedLiquidity(amtA, amtB);

        (uint112 rA, uint112 rB) = pool.getReserves();
        uint256 expectedOut = (uint256(rB) * swapIn) / (uint256(rA) + swapIn);

        tokenA.mint(router, swapIn);
        vm.startPrank(router);
        tokenA.approve(address(pool), swapIn);
        uint256 out = pool.swap(address(tokenA), swapIn, 0, bob);
        vm.stopPrank();

        assertEq(out, expectedOut);
    }
}
