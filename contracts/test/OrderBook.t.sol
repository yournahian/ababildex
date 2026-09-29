// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OrderBook} from "../OrderBook.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

/// @dev Minimal FeeTreasury stub that accepts the two-arg depositFee.
///      Pulls the fee tokens from the caller (mirrors FeeTreasury.depositFee).
contract MockFeeTreasuryOB {
    uint256 public totalFees;

    function depositFee(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        totalFees += amount;
    }
}

contract OrderBookTest is Test {
    OrderBook          internal book;
    MockFeeTreasuryOB  internal treasury;
    MockERC20          internal tokenIn;
    MockERC20          internal tokenOut;

    address internal owner = makeAddr("owner");
    address internal maker = makeAddr("maker");
    address internal taker = makeAddr("taker");
    address internal alice = makeAddr("alice");

    uint16  internal constant FEE_BPS = 30;   // 0.30 %
    uint256 internal constant AMOUNT_IN  = 1_000e18;
    uint256 internal constant MIN_OUT    = 990e6;

    // ─── helpers ─────────────────────────────────────────────────────────────

    function _placeOrder(uint64 ttl) internal returns (uint256 orderId) {
        tokenIn.mint(maker, AMOUNT_IN);
        vm.startPrank(maker);
        tokenIn.approve(address(book), AMOUNT_IN);
        orderId = book.placeOrder(
            address(tokenIn), address(tokenOut),
            AMOUNT_IN, MIN_OUT,
            uint64(block.timestamp + ttl)
        );
        vm.stopPrank();
    }

    /// Fill `fillAmountIn` of order `orderId` from the owner's perspective.
    function _fillOrder(uint256 orderId, uint256 fillAmountIn) internal returns (uint256) {
        uint256 amountOut = (fillAmountIn * MIN_OUT) / AMOUNT_IN;
        tokenOut.mint(taker, amountOut);
        vm.startPrank(taker);
        tokenOut.approve(address(book), amountOut);
        vm.stopPrank();

        vm.prank(owner);
        book.fillOrder(orderId, fillAmountIn, taker);
        return amountOut;
    }

    function setUp() public {
        tokenIn  = new MockERC20("TokenIn",  "TIN",  18);
        tokenOut = new MockERC20("TokenOut", "TOUT", 6);
        treasury = new MockFeeTreasuryOB();
        book     = new OrderBook(address(treasury), FEE_BPS, owner);
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    function test_Constructor_SetsFields() public view {
        assertEq(book.feeTreasury(), address(treasury));
        assertEq(book.feeBps(),      FEE_BPS);
        assertEq(book.owner(),       owner);
    }

    function test_Constructor_RevertsZeroTreasury() public {
        vm.expectRevert(OrderBook.ZeroAddress.selector);
        new OrderBook(address(0), FEE_BPS, owner);
    }

    function test_Constructor_RevertsZeroOwner() public {
        // OZ Ownable fires OwnableInvalidOwner before the contract's ZeroAddress guard
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new OrderBook(address(treasury), FEE_BPS, address(0));
    }

    function test_Constructor_RevertsFeeTooHigh() public {
        vm.expectRevert(OrderBook.FeeTooHigh.selector);
        new OrderBook(address(treasury), 101, owner);
    }

    // ─── placeOrder ──────────────────────────────────────────────────────────

    function test_PlaceOrder_HappyPath() public {
        uint64 exp = uint64(block.timestamp + 1 days);

        tokenIn.mint(maker, AMOUNT_IN);
        vm.startPrank(maker);
        tokenIn.approve(address(book), AMOUNT_IN);
        vm.expectEmit(true, true, false, true, address(book));
        emit OrderBook.OrderPlaced(0, maker, address(tokenIn), address(tokenOut), AMOUNT_IN, MIN_OUT, exp);
        uint256 id = book.placeOrder(
            address(tokenIn), address(tokenOut),
            AMOUNT_IN, MIN_OUT, exp
        );
        vm.stopPrank();

        assertEq(id, 0);
        assertEq(book.orderCount(), 1);

        (address _maker, address _tIn, address _tOut, uint256 _amtIn, uint256 _filled,
         uint256 _minOut, uint64 _exp, bool _cancelled) = book.orders(0);

        assertEq(_maker,     maker);
        assertEq(_tIn,       address(tokenIn));
        assertEq(_tOut,      address(tokenOut));
        assertEq(_amtIn,     AMOUNT_IN);
        assertEq(_filled,    0);
        assertEq(_minOut,    MIN_OUT);
        assertEq(_exp,       exp);
        assertFalse(_cancelled);

        // tokenIn escrowed
        assertEq(tokenIn.balanceOf(address(book)), AMOUNT_IN);
    }

    function test_PlaceOrder_RevertsZeroTokenIn() public {
        vm.prank(maker);
        vm.expectRevert(OrderBook.ZeroAddress.selector);
        book.placeOrder(address(0), address(tokenOut), AMOUNT_IN, MIN_OUT, uint64(block.timestamp + 1));
    }

    function test_PlaceOrder_RevertsZeroTokenOut() public {
        vm.prank(maker);
        vm.expectRevert(OrderBook.ZeroAddress.selector);
        book.placeOrder(address(tokenIn), address(0), AMOUNT_IN, MIN_OUT, uint64(block.timestamp + 1));
    }

    function test_PlaceOrder_RevrtsSameToken() public {
        vm.prank(maker);
        vm.expectRevert(OrderBook.OrderInactive.selector);
        book.placeOrder(address(tokenIn), address(tokenIn), AMOUNT_IN, MIN_OUT, uint64(block.timestamp + 1));
    }

    function test_PlaceOrder_RevertsZeroAmountIn() public {
        vm.prank(maker);
        vm.expectRevert(OrderBook.ZeroAmount.selector);
        book.placeOrder(address(tokenIn), address(tokenOut), 0, MIN_OUT, uint64(block.timestamp + 1));
    }

    function test_PlaceOrder_RevertsZeroMinOut() public {
        tokenIn.mint(maker, AMOUNT_IN);
        vm.startPrank(maker);
        tokenIn.approve(address(book), AMOUNT_IN);
        vm.expectRevert(OrderBook.ZeroAmount.selector);
        book.placeOrder(address(tokenIn), address(tokenOut), AMOUNT_IN, 0, uint64(block.timestamp + 1));
        vm.stopPrank();
    }

    function test_PlaceOrder_RevertsExpiredDeadline() public {
        vm.prank(maker);
        vm.expectRevert(OrderBook.OrderExpired.selector);
        book.placeOrder(address(tokenIn), address(tokenOut), AMOUNT_IN, MIN_OUT, uint64(block.timestamp));
    }

    function test_PlaceOrder_RevertsWhenPaused() public {
        vm.prank(owner);
        book.pause();

        tokenIn.mint(maker, AMOUNT_IN);
        vm.startPrank(maker);
        tokenIn.approve(address(book), AMOUNT_IN);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        book.placeOrder(address(tokenIn), address(tokenOut), AMOUNT_IN, MIN_OUT, uint64(block.timestamp + 1 days));
        vm.stopPrank();
    }

    // ─── cancelOrder ─────────────────────────────────────────────────────────

    function test_CancelOrder_RefundsMaker() public {
        uint256 id = _placeOrder(1 days);

        uint256 balBefore = tokenIn.balanceOf(maker);

        vm.prank(maker);
        vm.expectEmit(true, true, false, true, address(book));
        emit OrderBook.OrderCancelled(id, maker, AMOUNT_IN);
        book.cancelOrder(id);

        assertEq(tokenIn.balanceOf(maker), balBefore + AMOUNT_IN);
        (, , , , , , , bool cancelled) = book.orders(id);
        assertTrue(cancelled);
    }

    function test_CancelOrder_RevertsNotMaker() public {
        uint256 id = _placeOrder(1 days);

        vm.prank(alice);
        vm.expectRevert(OrderBook.NotMaker.selector);
        book.cancelOrder(id);
    }

    function test_CancelOrder_RevertsAlreadyCancelled() public {
        uint256 id = _placeOrder(1 days);

        vm.prank(maker);
        book.cancelOrder(id);

        vm.prank(maker);
        vm.expectRevert(OrderBook.OrderInactive.selector);
        book.cancelOrder(id);
    }

    function test_CancelOrder_RevertsFullyFilled() public {
        uint256 id = _placeOrder(1 days);
        _fillOrder(id, AMOUNT_IN); // full fill

        vm.prank(maker);
        vm.expectRevert(OrderBook.OrderInactive.selector);
        book.cancelOrder(id);
    }

    // ─── fillOrder ────────────────────────────────────────────────────────────

    function test_FillOrder_FullFill_HappyPath() public {
        uint256 id       = _placeOrder(1 days);
        uint256 amountOut = (AMOUNT_IN * MIN_OUT) / AMOUNT_IN; // == MIN_OUT
        uint256 fee      = (AMOUNT_IN * FEE_BPS) / 10_000;

        tokenOut.mint(taker, amountOut);
        vm.prank(taker);
        tokenOut.approve(address(book), amountOut);

        vm.prank(owner);
        vm.expectEmit(true, true, false, true, address(book));
        emit OrderBook.OrderFilled(id, taker, AMOUNT_IN, amountOut, fee);
        book.fillOrder(id, AMOUNT_IN, taker);

        // maker received tokenOut
        assertEq(tokenOut.balanceOf(maker), amountOut);
        // taker received tokenIn minus fee
        assertEq(tokenIn.balanceOf(taker), AMOUNT_IN - fee);
        // fee paid to treasury
        assertEq(tokenIn.balanceOf(address(treasury)), fee);
    }

    function test_FillOrder_PartialFill() public {
        uint256 id        = _placeOrder(1 days);
        uint256 half      = AMOUNT_IN / 2;
        uint256 halfOut   = (half * MIN_OUT) / AMOUNT_IN;

        tokenOut.mint(taker, halfOut);
        vm.prank(taker);
        tokenOut.approve(address(book), halfOut);

        vm.prank(owner);
        book.fillOrder(id, half, taker);

        (, , , , uint256 filled, , , ) = book.orders(id);
        assertEq(filled, half);
    }

    function test_FillOrder_RevertsNonOwner() public {
        uint256 id = _placeOrder(1 days);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        book.fillOrder(id, AMOUNT_IN, taker);
    }

    function test_FillOrder_RevertsOrderCancelled() public {
        uint256 id = _placeOrder(1 days);

        vm.prank(maker);
        book.cancelOrder(id);

        vm.prank(owner);
        vm.expectRevert(OrderBook.OrderInactive.selector);
        book.fillOrder(id, AMOUNT_IN, taker);
    }

    function test_FillOrder_RevertsOrderExpired() public {
        uint256 id = _placeOrder(1 hours);

        vm.warp(block.timestamp + 2 hours);

        vm.prank(owner);
        vm.expectRevert(OrderBook.OrderExpired.selector);
        book.fillOrder(id, AMOUNT_IN, taker);
    }

    function test_FillOrder_RevertsOverFill() public {
        uint256 id = _placeOrder(1 days);

        uint256 half = AMOUNT_IN / 2;
        _fillOrder(id, half);

        // try to overfill
        uint256 overfill = AMOUNT_IN; // half already consumed, total would be 1.5x
        uint256 overfillOut = (overfill * MIN_OUT) / AMOUNT_IN;
        tokenOut.mint(taker, overfillOut);
        vm.prank(taker);
        tokenOut.approve(address(book), overfillOut);

        vm.prank(owner);
        vm.expectRevert(OrderBook.OverFill.selector);
        book.fillOrder(id, overfill, taker);
    }

    function test_FillOrder_RevertsZeroFillAmount() public {
        uint256 id = _placeOrder(1 days);
        vm.prank(owner);
        vm.expectRevert(OrderBook.ZeroAmount.selector);
        book.fillOrder(id, 0, taker);
    }

    function test_FillOrder_RevertsZeroTaker() public {
        uint256 id = _placeOrder(1 days);
        vm.prank(owner);
        vm.expectRevert(OrderBook.ZeroAddress.selector);
        book.fillOrder(id, AMOUNT_IN, address(0));
    }

    function test_FillOrder_RevertsWhenPaused() public {
        uint256 id = _placeOrder(1 days);

        vm.prank(owner);
        book.pause();

        vm.prank(owner);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        book.fillOrder(id, AMOUNT_IN, taker);
    }

    // ─── setFeeBps / setFeeTreasury ───────────────────────────────────────────

    function test_SetFeeBps_HappyPath() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(book));
        emit OrderBook.FeeBpsUpdated(50);
        book.setFeeBps(50);
        assertEq(book.feeBps(), 50);
    }

    function test_SetFeeBps_RevertsFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(OrderBook.FeeTooHigh.selector);
        book.setFeeBps(101);
    }

    function test_SetFeeBps_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        book.setFeeBps(10);
    }

    function test_SetFeeTreasury_HappyPath() public {
        address newT = makeAddr("newTreasury");
        vm.prank(owner);
        vm.expectEmit(false, false, false, true, address(book));
        emit OrderBook.TreasuryUpdated(newT);
        book.setFeeTreasury(newT);
        assertEq(book.feeTreasury(), newT);
    }

    function test_SetFeeTreasury_RevertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(OrderBook.ZeroAddress.selector);
        book.setFeeTreasury(address(0));
    }

    function test_SetFeeTreasury_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        book.setFeeTreasury(makeAddr("t"));
    }

    // ─── pause / unpause ─────────────────────────────────────────────────────

    function test_Pause_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        book.pause();
    }

    function test_Unpause_OnlyOwner() public {
        vm.prank(owner);
        book.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        book.unpause();
    }

    function test_PauseUnpause_Roundtrip() public {
        vm.startPrank(owner);
        book.pause();
        assertTrue(book.paused());
        book.unpause();
        assertFalse(book.paused());
        vm.stopPrank();
    }

    // ─── Bilateral settlement invariant ──────────────────────────────────────

    function test_FillOrder_BilateralSettlement() public {
        uint256 id       = _placeOrder(1 days);
        uint256 fillAmt  = AMOUNT_IN;
        uint256 amtOut   = (fillAmt * MIN_OUT) / AMOUNT_IN;
        uint256 fee      = (fillAmt * FEE_BPS) / 10_000;

        uint256 makerTOutBefore = tokenOut.balanceOf(maker);
        uint256 takerTInBefore  = tokenIn.balanceOf(taker);

        _fillOrder(id, fillAmt);

        // maker gets tokenOut
        assertEq(tokenOut.balanceOf(maker), makerTOutBefore + amtOut);
        // taker gets tokenIn minus fee
        assertEq(tokenIn.balanceOf(taker),  takerTInBefore + fillAmt - fee);
        // treasury collects fee
        assertEq(tokenIn.balanceOf(address(treasury)), fee);
    }

    // ─── Fuzz: fee arithmetic ─────────────────────────────────────────────────

    function testFuzz_FillOrder_FeeArithmetic(uint256 fillAmt, uint16 bps) public {
        fillAmt = bound(fillAmt, 1, AMOUNT_IN);
        bps     = uint16(bound(uint256(bps), 0, 100));

        vm.prank(owner);
        book.setFeeBps(bps);

        uint256 id = _placeOrder(1 days);

        uint256 amtOut = (fillAmt * MIN_OUT) / AMOUNT_IN;
        tokenOut.mint(taker, amtOut);
        vm.prank(taker);
        tokenOut.approve(address(book), amtOut);

        vm.prank(owner);
        book.fillOrder(id, fillAmt, taker);

        uint256 expectedFee = (fillAmt * bps) / 10_000;
        assertEq(tokenIn.balanceOf(address(treasury)), expectedFee);
        assertEq(tokenIn.balanceOf(taker), fillAmt - expectedFee);
    }
}
