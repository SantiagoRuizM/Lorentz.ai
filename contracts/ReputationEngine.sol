// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IKnowledgeRegistry2 {
    function bkuIds() external view returns (uint256[] memory);
    function bkus(uint256 _id) external view returns (uint256 id, string memory name, uint256 weight, string memory area, uint256 level, bytes32 contentHash, bool exists);
}

interface IEvidenceRegistry2 {
    function isBkuCompleted(address _student, uint256 _bkuId) external view returns (bool completed, uint256 score);
    function getEvidenceCount() external view returns (uint256);
}

interface IAchievementRegistry2 {
    function getStudentAKUs(address _student) external view returns (uint256[] memory);
    function getStudentCerts(address _student) external view returns (uint256[] memory);
}

/**
 * @title ReputationEngine
 * @dev Computes academic metrics: Knowledge, Reputation, and Consistency Scores.
 */
contract ReputationEngine {
    address public admin;

    IKnowledgeRegistry2 public knowledgeRegistry;
    IEvidenceRegistry2 public evidenceRegistry;
    IAchievementRegistry2 public achievementRegistry;

    struct StudentReputation {
        uint256 knowledgeScore;
        uint256 reputationScore;
        uint256 consistencyScore;
        uint256 lastUpdatedBlock;
    }

    mapping(address => StudentReputation) public studentReputations;
    address[] public studentList;
    mapping(address => bool) private _studentExists;

    event ReputationUpdated(address indexed student, uint256 knowledgeScore, uint256 reputationScore, uint256 consistencyScore);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor(
        address _knowledgeRegistry,
        address _evidenceRegistry,
        address _achievementRegistry
    ) {
        admin = msg.sender;
        knowledgeRegistry = IKnowledgeRegistry2(_knowledgeRegistry);
        evidenceRegistry = IEvidenceRegistry2(_evidenceRegistry);
        achievementRegistry = IAchievementRegistry2(_achievementRegistry);
    }

    function updateRegistries(
        address _knowledgeRegistry,
        address _evidenceRegistry,
        address _achievementRegistry
    ) external onlyAdmin {
        knowledgeRegistry = IKnowledgeRegistry2(_knowledgeRegistry);
        evidenceRegistry = IEvidenceRegistry2(_evidenceRegistry);
        achievementRegistry = IAchievementRegistry2(_achievementRegistry);
    }

    /**
     * @dev Recalculates student scores and updates the ledger.
     */
    function updateReputation(address _student) external returns (uint256, uint256, uint256) {
        require(_student != address(0), "Invalid student address");

        uint256[] memory bkuList = knowledgeRegistry.bkuIds();
        
        uint256 kScore = 0;      // Knowledge score
        uint256 totalWeight = 0;
        uint256 weightedScoreSum = 0;
        uint256 completedCount = 0;

        for (uint256 i = 0; i < bkuList.length; i++) {
            uint256 bkuId = bkuList[i];
            (bool completed, uint256 score) = evidenceRegistry.isBkuCompleted(_student, bkuId);
            
            if (completed) {
                (, , uint256 weight, , , , ) = knowledgeRegistry.bkus(bkuId);
                kScore += weight;
                weightedScoreSum += (score * weight);
                totalWeight += weight;
                completedCount++;
            }
        }

        // Add bonus points for obtained AKUs and Certifications
        uint256[] memory akus = achievementRegistry.getStudentAKUs(_student);
        uint256[] memory certs = achievementRegistry.getStudentCerts(_student);
        kScore += (akus.length * 50);    // 50 points per AKU
        kScore += (certs.length * 200);  // 200 points per professional certification

        // Reputation score based on grades/score average (normalized, e.g. base 1000)
        uint256 repScore = 0;
        if (totalWeight > 0) {
            repScore = (weightedScoreSum) / totalWeight; // Average grade score (0 - 100)
            repScore = repScore * 10 + (akus.length * 15) + (certs.length * 40); // Scaling to reputation score (e.g. 0-1000+)
        }

        // Consistency score: ratio of completed BKUs to total BKUs available
        uint256 constScore = 0;
        if (bkuList.length > 0) {
            constScore = (completedCount * 100) / bkuList.length;
        }

        studentReputations[_student] = StudentReputation({
            knowledgeScore: kScore,
            reputationScore: repScore,
            consistencyScore: constScore,
            lastUpdatedBlock: block.number
        });

        if (!_studentExists[_student]) {
            _studentExists[_student] = true;
            studentList.push(_student);
        }

        emit ReputationUpdated(_student, kScore, repScore, constScore);
        return (kScore, repScore, constScore);
    }

    function getStudentReputation(address _student) external view returns (uint256, uint256, uint256) {
        StudentReputation memory rep = studentReputations[_student];
        return (rep.knowledgeScore, rep.reputationScore, rep.consistencyScore);
    }

    function getStudentCount() external view returns (uint256) {
        return studentList.length;
    }
}
