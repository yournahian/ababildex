// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {QuestRewards} from "../QuestRewards.sol";
import {MockERC20} from "../test-helpers/MockERC20.sol";

contract QuestRewardsTest is Test {
    QuestRewards internal quests;
    MockERC20   internal usdc;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob   = makeAddr("bob");
    address internal carol = makeAddr("carol");

    // Helpers ─────────────────────────────────────────────────────────────────

    /// Fund the contract and create quest 0 with default params.
    function _createDefaultQuest(uint256 pool, uint32 maxP, uint64 ttl)
        internal
        returns (uint256 id, uint256 perUser)
    {
        // fund the contract
        usdc.mint(owner, pool);
        vm.startPrank(owner);
        usdc.approve(address(quests), pool);
        quests.fundContract(pool);

        perUser = pool / maxP;
        quests.createQuest("title", pool, maxP, uint64(block.timestamp + ttl));
        vm.stopPrank();
        id = quests.questCount() - 1;
    }

    function setUp() public {
        usdc   = new MockERC20("Mock USDC", "mUSDC", 6);
        quests = new QuestRewards(address(usdc), owner);
    }

    // ─── Constructor ────────────────────────────────────────────────────────

    function test_Constructor_SetsUsdcAndOwner() public view {
        assertEq(quests.usdc(),  address(usdc));
        assertEq(quests.owner(), owner);
    }

    function test_Constructor_RevertsZeroUsdc() public {
        vm.expectRevert(QuestRewards.ZeroAddress.selector);
        new QuestRewards(address(0), owner);
    }

    function test_Constructor_RevertsZeroOwner() public {
        // OZ Ownable fires OwnableInvalidOwner before the contract's ZeroAddress guard
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new QuestRewards(address(usdc), address(0));
    }

    // ─── fundContract ────────────────────────────────────────────────────────

    function test_FundContract_HappyPath() public {
        usdc.mint(alice, 1_000e6);
        vm.startPrank(alice);
        usdc.approve(address(quests), 1_000e6);
        vm.expectEmit(true, false, false, true, address(quests));
        emit QuestRewards.Funded(alice, 1_000e6);
        quests.fundContract(1_000e6);
        vm.stopPrank();

        assertEq(usdc.balanceOf(address(quests)), 1_000e6);
    }

    function test_FundContract_RevertsZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(QuestRewards.InvalidParams.selector);
        quests.fundContract(0);
    }

    // ─── createQuest ─────────────────────────────────────────────────────────

    function test_CreateQuest_HappyPath() public {
        uint256 pool = 1_000e6;
        uint32  maxP = 10;
        uint64  exp  = uint64(block.timestamp + 1 days);

        usdc.mint(owner, pool);
        vm.startPrank(owner);
        usdc.approve(address(quests), pool);
        quests.fundContract(pool);

        vm.expectEmit(true, false, false, true, address(quests));
        emit QuestRewards.QuestCreated(0, "q1", pool, maxP, exp);
        quests.createQuest("q1", pool, maxP, exp);
        vm.stopPrank();

        assertEq(quests.questCount(), 1);
        (
            string memory title,
            uint256 rewardPool,
            uint256 rewardPerUser,
            uint256 remainingPool,
            uint32  maxParticipants,
            uint32  claimedCount,
            uint64  expiresAt,
            bool    active
        ) = quests.quests(0);

        assertEq(title,           "q1");
        assertEq(rewardPool,      pool);
        assertEq(rewardPerUser,   pool / maxP);
        assertEq(remainingPool,   pool);
        assertEq(maxParticipants, maxP);
        assertEq(claimedCount,    0);
        assertEq(expiresAt,       exp);
        assertTrue(active);
    }

    function test_CreateQuest_RevertsNonOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        quests.createQuest("q", 1_000e6, 5, uint64(block.timestamp + 1));
    }

    function test_CreateQuest_RevertsZeroPool() public {
        vm.prank(owner);
        vm.expectRevert(QuestRewards.InvalidParams.selector);
        quests.createQuest("q", 0, 5, uint64(block.timestamp + 1));
    }

    function test_CreateQuest_RevertsZeroMaxParticipants() public {
        vm.prank(owner);
        vm.expectRevert(QuestRewards.InvalidParams.selector);
        quests.createQuest("q", 1_000e6, 0, uint64(block.timestamp + 1));
    }

    function test_CreateQuest_RevertsExpiredTimestamp() public {
        vm.prank(owner);
        vm.expectRevert(QuestRewards.InvalidParams.selector);
        quests.createQuest("q", 1_000e6, 5, uint64(block.timestamp));
    }

    function test_CreateQuest_RevertsWhenPaused() public {
        vm.prank(owner);
        quests.pause();

        vm.prank(owner);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        quests.createQuest("q", 1_000e6, 5, uint64(block.timestamp + 1));
    }

    // ─── claimReward ─────────────────────────────────────────────────────────

    function test_ClaimReward_HappyPath() public {
        (uint256 id, uint256 perUser) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.prank(alice);
        vm.expectEmit(true, true, false, true, address(quests));
        emit QuestRewards.RewardClaimed(id, alice, perUser);
        quests.claimReward(id);

        assertEq(usdc.balanceOf(alice), perUser);
        assertTrue(quests.hasClaimed(id, alice));

        (, , , uint256 remainingPool, , uint32 claimedCount, , ) = quests.quests(id);
        assertEq(claimedCount,   1);
        assertEq(remainingPool,  1_000e6 - perUser);
    }

    function test_ClaimReward_RevertsAlreadyClaimed() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.prank(alice);
        quests.claimReward(id);

        vm.prank(alice);
        vm.expectRevert(QuestRewards.AlreadyClaimed.selector);
        quests.claimReward(id);
    }

    function test_ClaimReward_RevertsQuestExpired() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 hours);

        vm.warp(block.timestamp + 2 hours);

        vm.prank(alice);
        vm.expectRevert(QuestRewards.QuestExpired.selector);
        quests.claimReward(id);
    }

    function test_ClaimReward_RevertsMaxParticipantsReached() public {
        // 2 participants max, 2 tokens each
        uint256 pool = 4e6;
        uint32  maxP = 2;
        (uint256 id, ) = _createDefaultQuest(pool, maxP, 1 days);

        vm.prank(alice);
        quests.claimReward(id);
        vm.prank(bob);
        quests.claimReward(id);

        vm.prank(carol);
        vm.expectRevert(QuestRewards.MaxParticipantsReached.selector);
        quests.claimReward(id);
    }

    function test_ClaimReward_RevertsQuestNotActive() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.prank(owner);
        quests.deactivateQuest(id);

        vm.prank(alice);
        vm.expectRevert(QuestRewards.QuestNotActive.selector);
        quests.claimReward(id);
    }

    function test_ClaimReward_RevertsWhenPaused() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.prank(owner);
        quests.pause();

        vm.prank(alice);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        quests.claimReward(id);
    }

    // ─── deactivateQuest ──────────────────────────────────────────────────────

    function test_DeactivateQuest_HappyPath() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.prank(owner);
        vm.expectEmit(true, false, false, false, address(quests));
        emit QuestRewards.QuestDeactivated(id);
        quests.deactivateQuest(id);

        (, , , , , , , bool active) = quests.quests(id);
        assertFalse(active);
    }

    function test_DeactivateQuest_RevertsNonOwner() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        quests.deactivateQuest(id);
    }

    function test_DeactivateQuest_RevertsAlreadyInactive() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.startPrank(owner);
        quests.deactivateQuest(id);
        vm.expectRevert(QuestRewards.QuestNotActive.selector);
        quests.deactivateQuest(id);
        vm.stopPrank();
    }

    // ─── recoverUnclaimed ─────────────────────────────────────────────────────

    function test_RecoverUnclaimed_HappyPath() public {
        uint256 pool  = 1_000e6;
        uint32  maxP  = 10;
        (uint256 id, uint256 perUser) = _createDefaultQuest(pool, maxP, 1 hours);

        // alice claims one slot
        vm.prank(alice);
        quests.claimReward(id);

        // fast-forward past expiry
        vm.warp(block.timestamp + 2 hours);

        uint256 expected = pool - perUser;
        vm.prank(owner);
        vm.expectEmit(true, true, false, true, address(quests));
        emit QuestRewards.UnclaimedRecovered(id, bob, expected);
        quests.recoverUnclaimed(id, bob);

        assertEq(usdc.balanceOf(bob), expected);

        // remainingPool should now be 0
        (, , , uint256 remainingPool, , , , ) = quests.quests(id);
        assertEq(remainingPool, 0);
    }

    function test_RecoverUnclaimed_RevertsZeroAddress() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 hours);
        vm.warp(block.timestamp + 2 hours);

        vm.prank(owner);
        vm.expectRevert(QuestRewards.ZeroAddress.selector);
        quests.recoverUnclaimed(id, address(0));
    }

    function test_RecoverUnclaimed_RevertsQuestNotExpired() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 days);

        vm.prank(owner);
        vm.expectRevert(QuestRewards.QuestNotExpired.selector);
        quests.recoverUnclaimed(id, bob);
    }

    function test_RecoverUnclaimed_RevertsZeroRemaining() public {
        uint256 pool = 2e6;
        uint32  maxP = 2;
        (uint256 id, ) = _createDefaultQuest(pool, maxP, 1 hours);

        // fill all slots
        vm.prank(alice);
        quests.claimReward(id);
        vm.prank(bob);
        quests.claimReward(id);

        // pass expiry
        vm.warp(block.timestamp + 2 hours);

        vm.prank(owner);
        vm.expectRevert(QuestRewards.InvalidParams.selector);
        quests.recoverUnclaimed(id, carol);
    }

    function test_RecoverUnclaimed_RevertsNonOwner() public {
        (uint256 id, ) = _createDefaultQuest(1_000e6, 10, 1 hours);
        vm.warp(block.timestamp + 2 hours);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        quests.recoverUnclaimed(id, alice);
    }

    // ─── remainingPool tracks exact balance ───────────────────────────────────

    function test_RemainingPool_TracksClaims() public {
        uint256 pool = 1_000e6;
        uint32  maxP = 10;
        (uint256 id, uint256 perUser) = _createDefaultQuest(pool, maxP, 1 days);

        for (uint256 i = 0; i < 5; i++) {
            address claimer = makeAddr(string(abi.encodePacked("claimer", i)));
            vm.prank(claimer);
            quests.claimReward(id);
        }

        (, , , uint256 remainingPool, , uint32 claimedCount, , ) = quests.quests(id);
        assertEq(claimedCount,  5);
        assertEq(remainingPool, pool - 5 * perUser);
    }

    // ─── pause / unpause ─────────────────────────────────────────────────────

    function test_Pause_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        quests.pause();
    }

    function test_Unpause_OnlyOwner() public {
        vm.prank(owner);
        quests.pause();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        quests.unpause();
    }

    function test_PauseUnpause_Roundtrip() public {
        vm.startPrank(owner);
        quests.pause();
        assertTrue(quests.paused());
        quests.unpause();
        assertFalse(quests.paused());
        vm.stopPrank();
    }

    // ─── renounceOwnership disabled ───────────────────────────────────────────

    function test_RenounceOwnership_Reverts() public {
        vm.prank(owner);
        vm.expectRevert(QuestRewards.InvalidParams.selector);
        quests.renounceOwnership();
    }

    // ─── Fuzz: claimReward distributes exact perUser amount ───────────────────

    function testFuzz_ClaimReward_ExactAmount(uint256 pool, uint32 maxP) public {
        pool = bound(pool, 100, 1_000_000e6);
        maxP = uint32(bound(uint256(maxP), 1, 50));

        uint256 perUser = pool / maxP;
        vm.assume(perUser > 0);

        (uint256 id, ) = _createDefaultQuest(pool, maxP, 1 days);

        vm.prank(alice);
        quests.claimReward(id);

        assertEq(usdc.balanceOf(alice), perUser);
    }

}
