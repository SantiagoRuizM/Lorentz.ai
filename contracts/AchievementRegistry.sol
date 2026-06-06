// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IKnowledgeRegistry {
    function getRequiredBKUs(uint256 _akuId) external view returns (uint256[] memory);
    function getRequiredAKUs(uint256 _certId) external view returns (uint256[] memory);
    function bkus(uint256 _id) external view returns (uint256 id, string memory name, uint256 weight, string memory area, uint256 level, bytes32 contentHash, bool exists);
    function akus(uint256 _id) external view returns (uint256 id, string memory name, uint256 minCompletionPercentage, bool exists);
    function certifications(uint256 _id) external view returns (uint256 id, string memory name, bool exists);
}

interface IEvidenceRegistry {
    function isBkuCompleted(address _student, uint256 _bkuId) external view returns (bool completed, uint256 score);
}

interface ISoulboundCredential {
    function mint(address to, string calldata uri, uint256 credentialType, uint256 referenceId) external returns (uint256);
}

/**
 * @title AchievementRegistry
 * @dev Manages the auto-evaluation of requirements and issuance of Soulbound NFTs.
 */
contract AchievementRegistry {
    address public admin;

    IKnowledgeRegistry public knowledgeRegistry;
    IEvidenceRegistry public evidenceRegistry;
    ISoulboundCredential public sbcToken;

    // Student -> AKU ID -> Unlocked
    mapping(address => mapping(uint256 => bool)) public studentAKUs;
    // Student -> Certification ID -> Unlocked
    mapping(address => mapping(uint256 => bool)) public studentCertifications;
    
    // Mapping from Student -> Array of obtained AKUs
    mapping(address => uint256[]) private _studentObtainedAKUs;
    // Mapping from Student -> Array of obtained Certifications
    mapping(address => uint256[]) private _studentObtainedCerts;

    event AKUGranted(address indexed student, uint256 indexed akuId, uint256 tokenId);
    event CertificationGranted(address indexed student, uint256 indexed certId, uint256 tokenId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor(
        address _knowledgeRegistry,
        address _evidenceRegistry,
        address _sbcToken
    ) {
        admin = msg.sender;
        knowledgeRegistry = IKnowledgeRegistry(_knowledgeRegistry);
        evidenceRegistry = IEvidenceRegistry(_evidenceRegistry);
        sbcToken = ISoulboundCredential(_sbcToken);
    }

    function updateRegistries(
        address _knowledgeRegistry,
        address _evidenceRegistry,
        address _sbcToken
    ) external onlyAdmin {
        knowledgeRegistry = IKnowledgeRegistry(_knowledgeRegistry);
        evidenceRegistry = IEvidenceRegistry(_evidenceRegistry);
        sbcToken = ISoulboundCredential(_sbcToken);
    }

    /**
     * @dev Checks BKU requirements for an AKU. If met, grants the AKU and mints the Soulbound NFT.
     */
    function checkAndGrantAKU(address _student, uint256 _akuId) external returns (bool, uint256) {
        require(!studentAKUs[_student][_akuId], "AKU already completed");
        
        uint256[] memory requiredBKUs = knowledgeRegistry.getRequiredBKUs(_akuId);
        require(requiredBKUs.length > 0, "No required BKUs defined for this AKU");
        
        uint256 completedCount = 0;
        for (uint256 i = 0; i < requiredBKUs.length; i++) {
            (bool completed, ) = evidenceRegistry.isBkuCompleted(_student, requiredBKUs[i]);
            if (completed) {
                completedCount++;
            }
        }
        
        // Fetch required percentage from KnowledgeRegistry
        (, , uint256 minPct, bool exists) = knowledgeRegistry.akus(_akuId);
        require(exists, "AKU does not exist in catalog");
        
        uint256 achievedPct = (completedCount * 100) / requiredBKUs.length;
        
        if (achievedPct >= minPct) {
            studentAKUs[_student][_akuId] = true;
            _studentObtainedAKUs[_student].push(_akuId);
            
            // Mint Soulbound NFT
            string memory tokenURI = string(abi.encodePacked("lorentz://credentials/aku/", uintToString(_akuId)));
            uint256 tokenId = sbcToken.mint(_student, tokenURI, 1, _akuId);
            
            emit AKUGranted(_student, _akuId, tokenId);
            return (true, tokenId);
        }
        
        return (false, 0);
    }

    /**
     * @dev Checks AKU requirements for a Professional Certification. If met, grants it and mints the Soulbound NFT.
     */
    function checkAndGrantCertification(address _student, uint256 _certId) external returns (bool, uint256) {
        require(!studentCertifications[_student][_certId], "Certification already completed");
        
        uint256[] memory requiredAKUs = knowledgeRegistry.getRequiredAKUs(_certId);
        require(requiredAKUs.length > 0, "No required AKUs defined for this Certification");
        
        bool allCompleted = true;
        for (uint256 i = 0; i < requiredAKUs.length; i++) {
            if (!studentAKUs[_student][requiredAKUs[i]]) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            studentCertifications[_student][_certId] = true;
            _studentObtainedCerts[_student].push(_certId);
            
            // Mint Soulbound NFT
            string memory tokenURI = string(abi.encodePacked("lorentz://credentials/cert/", uintToString(_certId)));
            uint256 tokenId = sbcToken.mint(_student, tokenURI, 2, _certId);
            
            emit CertificationGranted(_student, _certId, tokenId);
            return (true, tokenId);
        }
        
        return (false, 0);
    }

    function getStudentAKUs(address _student) external view returns (uint256[] memory) {
        return _studentObtainedAKUs[_student];
    }

    function getStudentCerts(address _student) external view returns (uint256[] memory) {
        return _studentObtainedCerts[_student];
    }

    // Helper function to convert uint to string
    function uintToString(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (uint8)(48 + _i % 10);
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        return string(bstr);
    }
}
