// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @dev Ledger of hashes, scores, and evaluations of completed BKUs.
 */
contract EvidenceRegistry {
    address public admin;

    struct Evidence {
        bytes32 id;
        address student;
        uint256 bkuId;
        uint256 score;            // 0 - 100
        bytes32 evidenceHash;     // IPFS hash or similar document check
        uint256 timestamp;
        address professor;
        bool verified;
        address reviewer;
        bool disputed;
    }

    // Role mappings
    mapping(address => bool) public professors;
    mapping(address => bool) public reviewers;

    // Student -> BKU ID -> Evidence
    mapping(address => mapping(uint256 => bytes32)) public studentBkuEvidence;
    // Evidence ID -> Evidence Details
    mapping(bytes32 => Evidence) public evidences;
    
    bytes32[] public evidenceIds;

    event EvidenceSubmitted(bytes32 indexed id, address indexed student, uint256 indexed bkuId, uint256 score);
    event EvidenceVerified(bytes32 indexed id, address indexed reviewer);
    event EvidenceDisputed(bytes32 indexed id, address indexed reviewer);
    
    event RoleGranted(address indexed account, string role);
    event RoleRevoked(address indexed account, string role);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyProfessor() {
        require(professors[msg.sender] || msg.sender == admin, "Only professors or admin can call");
        _;
    }

    modifier onlyReviewer() {
        require(reviewers[msg.sender] || msg.sender == admin, "Only reviewers or admin can call");
        _;
    }

    constructor() {
        admin = msg.sender;
        professors[msg.sender] = true;
        reviewers[msg.sender] = true;
    }

    function grantProfessor(address account) external onlyAdmin {
        professors[account] = true;
        emit RoleGranted(account, "professor");
    }

    function revokeProfessor(address account) external onlyAdmin {
        professors[account] = false;
        emit RoleRevoked(account, "professor");
    }

    function grantReviewer(address account) external onlyAdmin {
        reviewers[account] = true;
        emit RoleGranted(account, "reviewer");
    }

    function revokeReviewer(address account) external onlyAdmin {
        reviewers[account] = false;
        emit RoleRevoked(account, "reviewer");
    }

    /**
     * @dev Submit evidence of BKU completion.
     */
    function submitEvidence(
        address _student,
        uint256 _bkuId,
        uint256 _score,
        bytes32 _evidenceHash
    ) external onlyProfessor returns (bytes32) {
        require(_student != address(0), "Invalid student address");
        require(_score <= 100, "Score must be between 0 and 100");
        
        bytes32 evidenceId = keccak256(abi.encodePacked(_student, _bkuId, _score, _evidenceHash, block.timestamp));
        require(evidences[evidenceId].id == bytes32(0), "Evidence already exists");

        evidences[evidenceId] = Evidence({
            id: evidenceId,
            student: _student,
            bkuId: _bkuId,
            score: _score,
            evidenceHash: _evidenceHash,
            timestamp: block.timestamp,
            professor: msg.sender,
            verified: false,
            reviewer: address(0),
            disputed: false
        });

        studentBkuEvidence[_student][_bkuId] = evidenceId;
        evidenceIds.push(evidenceId);

        emit EvidenceSubmitted(evidenceId, _student, _bkuId, _score);
        return evidenceId;
    }

    /**
     * @dev Verify submitted evidence of BKU.
     */
    function verifyEvidence(bytes32 _evidenceId) external onlyReviewer {
        Evidence storage ev = evidences[_evidenceId];
        require(ev.id != bytes32(0), "Evidence does not exist");
        require(!ev.verified, "Evidence is already verified");
        require(!ev.disputed, "Cannot verify a disputed evidence");

        ev.verified = true;
        ev.reviewer = msg.sender;

        emit EvidenceVerified(_evidenceId, msg.sender);
    }

    /**
     * @dev Dispute evidence.
     */
    function disputeEvidence(bytes32 _evidenceId) external onlyReviewer {
        Evidence storage ev = evidences[_evidenceId];
        require(ev.id != bytes32(0), "Evidence does not exist");
        require(!ev.disputed, "Evidence is already disputed");

        ev.disputed = true;
        ev.verified = false;
        ev.reviewer = msg.sender;

        emit EvidenceDisputed(_evidenceId, msg.sender);
    }

    /**
     * @dev Check if a student has completed and verified a BKU.
     */
    function isBkuCompleted(address _student, uint256 _bkuId) external view returns (bool, uint256) {
        bytes32 evId = studentBkuEvidence[_student][_bkuId];
        if (evId == bytes32(0)) {
            return (false, 0);
        }
        Evidence memory ev = evidences[evId];
        return (ev.verified && !ev.disputed, ev.score);
    }

    function getEvidenceCount() external view returns (uint256) {
        return evidenceIds.length;
    }
}
