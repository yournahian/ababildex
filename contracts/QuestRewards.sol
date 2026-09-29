// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract QuestRewards is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Quest {
        string title;
        uint256 rewardPool;
        uint256 rewardPerUser;
        uint256 remainingPool;
        uint32 maxParticipants;
        uint32 claimedCount;
        uint64 expiresAt;
        bool active;
    }

    error QuestNotActive();
    error QuestExpired();
    error AlreadyClaimed();
    error MaxParticipantsReached();
    error QuestNotExpired();
    error ZeroAddress();
    error InvalidParams();

    event QuestCreated(
        uint256 indexed id,
        string title,
        uint256 rewardPool,
        uint32 maxParticipants,
        uint64 expiresAt
    );
    event RewardClaimed(uint256 indexed questId, address indexed claimer, uint256 amount);
    event QuestDeactivated(uint256 indexed questId);
    event UnclaimedRecovered(uint256 indexed questId, address indexed to, uint256 amount);
    event Funded(address indexed from, uint256 amount);

    mapping(uint256 => Quest) public quests;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    uint256 public questCount;
    address public usdc;

    constructor(address usdc_, address initialOwner) Ownable(initialOwner) {
        if (usdc_ == address(0) || initialOwner == address(0)) revert ZeroAddress();
        usdc = usdc_;
    }

    function createQuest(
        string calldata title,
        uint256 rewardPool,
        uint32 maxParticipants,
        uint64 expiresAt
    ) external onlyOwner whenNotPaused {
        if (rewardPool == 0 || maxParticipants == 0 || expiresAt <= block.timestamp) {
            revert InvalidParams();
        }
        uint256 rewardPerUser = rewardPool / maxParticipants;
        uint256 id = questCount;
        quests[id] = Quest({
            title: title,
            rewardPool: rewardPool,
            rewardPerUser: rewardPerUser,
            remainingPool: rewardPool,
            maxParticipants: maxParticipants,
            claimedCount: 0,
            expiresAt: expiresAt,
            active: true
        });
        questCount = id + 1;
        emit QuestCreated(id, title, rewardPool, maxParticipants, expiresAt);
    }

    function claimReward(uint256 questId) external whenNotPaused nonReentrant {
        Quest storage quest = quests[questId];
        if (!quest.active) revert QuestNotActive();
        if (block.timestamp > quest.expiresAt) revert QuestExpired();
        if (hasClaimed[questId][msg.sender]) revert AlreadyClaimed();
        if (quest.claimedCount >= quest.maxParticipants) revert MaxParticipantsReached();

        hasClaimed[questId][msg.sender] = true;
        quest.claimedCount += 1;
        quest.remainingPool -= quest.rewardPerUser;

        IERC20(usdc).safeTransfer(msg.sender, quest.rewardPerUser);
        emit RewardClaimed(questId, msg.sender, quest.rewardPerUser);
    }

    function deactivateQuest(uint256 questId) external onlyOwner {
        Quest storage quest = quests[questId];
        if (!quest.active) revert QuestNotActive();
        quest.active = false;
        emit QuestDeactivated(questId);
    }

    function recoverUnclaimed(uint256 questId, address to) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        Quest storage quest = quests[questId];
        if (quest.rewardPool == 0) revert QuestNotActive();
        if (block.timestamp <= quest.expiresAt) revert QuestNotExpired();
        uint256 remaining = quest.remainingPool;
        if (remaining == 0) revert InvalidParams();
        quest.remainingPool = 0;
        IERC20(usdc).safeTransfer(to, remaining);
        emit UnclaimedRecovered(questId, to, remaining);
    }

    function fundContract(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidParams();
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), amount);
        emit Funded(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function renounceOwnership() public override onlyOwner {
        revert InvalidParams();
    }
}
