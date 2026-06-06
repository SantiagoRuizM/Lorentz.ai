// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KnowledgeRegistry
 * @dev Catalog of academic units (BKUs, AKUs, Certifications) and knowledge relations.
 */
contract KnowledgeRegistry {
    address public admin;

    struct BKU {
        uint256 id;
        string name;
        uint256 weight;
        string area;
        uint256 level;
        bytes32 contentHash;
        bool exists;
    }

    struct AKU {
        uint256 id;
        string name;
        uint256[] requiredBKUs;
        uint256 minCompletionPercentage; // e.g. 80
        bool exists;
    }

    struct Certification {
        uint256 id;
        string name;
        uint256[] requiredAKUs;
        bool exists;
    }

    struct GraphNode {
        bytes32 id;
        string label;
        string nodeType; // "bku", "aku", "cert", "concept"
        bool exists;
    }

    struct GraphRelation {
        bytes32 id;
        bytes32 sourceId;
        bytes32 targetId;
        string label;
        bool verified;
        bool exists;
    }

    // Catalogs
    mapping(uint256 => BKU) public bkus;
    mapping(uint256 => AKU) public akus;
    mapping(uint256 => Certification) public certifications;
    
    // Knowledge Graph Mapping
    mapping(bytes32 => GraphNode) public graphNodes;
    mapping(bytes32 => GraphRelation) public graphRelations;

    uint256[] public bkuIds;
    uint256[] public akuIds;
    uint256[] public certificationIds;
    bytes32[] public nodeIds;
    bytes32[] public relationIds;

    event BKUAdded(uint256 indexed id, string name, uint256 weight);
    event AKUAdded(uint256 indexed id, string name);
    event CertificationAdded(uint256 indexed id, string name);
    
    event NodeCreated(bytes32 indexed id, string label, string nodeType);
    event RelationCreated(bytes32 indexed id, bytes32 sourceId, bytes32 targetId, string label);
    event RelationVerified(bytes32 indexed id);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addBKU(
        uint256 _id,
        string memory _name,
        uint256 _weight,
        string memory _area,
        uint256 _level,
        bytes32 _contentHash
    ) external onlyAdmin {
        require(!bkus[_id].exists, "BKU already exists");
        
        bkus[_id] = BKU({
            id: _id,
            name: _name,
            weight: _weight,
            area: _area,
            level: _level,
            contentHash: _contentHash,
            exists: true
        });
        bkuIds.push(_id);
        
        // Also register as node in the graph
        bytes32 nodeId = keccak256(abi.encodePacked("bku_", _id));
        graphNodes[nodeId] = GraphNode({
            id: nodeId,
            label: _name,
            nodeType: "bku",
            exists: true
        });
        nodeIds.push(nodeId);

        emit BKUAdded(_id, _name, _weight);
        emit NodeCreated(nodeId, _name, "bku");
    }

    function addAKU(
        uint256 _id,
        string memory _name,
        uint256[] memory _requiredBKUs,
        uint256 _minCompletionPercentage
    ) external onlyAdmin {
        require(!akus[_id].exists, "AKU already exists");
        
        akus[_id] = AKU({
            id: _id,
            name: _name,
            requiredBKUs: _requiredBKUs,
            minCompletionPercentage: _minCompletionPercentage,
            exists: true
        });
        akuIds.push(_id);

        bytes32 nodeId = keccak256(abi.encodePacked("aku_", _id));
        graphNodes[nodeId] = GraphNode({
            id: nodeId,
            label: _name,
            nodeType: "aku",
            exists: true
        });
        nodeIds.push(nodeId);

        emit AKUAdded(_id, _name);
        emit NodeCreated(nodeId, _name, "aku");
    }

    function addCertification(
        uint256 _id,
        string memory _name,
        uint256[] memory _requiredAKUs
    ) external onlyAdmin {
        require(!certifications[_id].exists, "Certification already exists");
        
        certifications[_id] = Certification({
            id: _id,
            name: _name,
            requiredAKUs: _requiredAKUs,
            exists: true
        });
        certificationIds.push(_id);

        bytes32 nodeId = keccak256(abi.encodePacked("cert_", _id));
        graphNodes[nodeId] = GraphNode({
            id: nodeId,
            label: _name,
            nodeType: "cert",
            exists: true
        });
        nodeIds.push(nodeId);

        emit CertificationAdded(_id, _name);
        emit NodeCreated(nodeId, _name, "cert");
    }

    // Graph Relations functions
    function createNode(bytes32 _id, string memory _label, string memory _type) external onlyAdmin {
        require(!graphNodes[_id].exists, "Node already exists");
        graphNodes[_id] = GraphNode({
            id: _id,
            label: _label,
            nodeType: _type,
            exists: true
        });
        nodeIds.push(_id);
        emit NodeCreated(_id, _label, _type);
    }

    function createRelation(bytes32 _sourceId, bytes32 _targetId, string memory _label) external returns (bytes32) {
        require(graphNodes[_sourceId].exists, "Source node does not exist");
        require(graphNodes[_targetId].exists, "Target node does not exist");

        bytes32 relationId = keccak256(abi.encodePacked(_sourceId, _targetId, _label, block.timestamp));
        require(!graphRelations[relationId].exists, "Relation already exists");

        graphRelations[relationId] = GraphRelation({
            id: relationId,
            sourceId: _sourceId,
            targetId: _targetId,
            label: _label,
            verified: false,
            exists: true
        });
        relationIds.push(relationId);

        emit RelationCreated(relationId, _sourceId, _targetId, _label);
        return relationId;
    }

    function verifyRelation(bytes32 _relationId) external onlyAdmin {
        require(graphRelations[_relationId].exists, "Relation does not exist");
        graphRelations[_relationId].verified = true;
        emit RelationVerified(_relationId);
    }

    // Getters for arrays
    function getBKUIds() external view returns (uint256[] memory) {
        return bkuIds;
    }

    function getAKUIds() external view returns (uint256[] memory) {
        return akuIds;
    }

    function getCertificationIds() external view returns (uint256[] memory) {
        return certificationIds;
    }

    function getRequiredBKUs(uint256 _akuId) external view returns (uint256[] memory) {
        require(akus[_akuId].exists, "AKU does not exist");
        return akus[_akuId].requiredBKUs;
    }

    function getRequiredAKUs(uint256 _certId) external view returns (uint256[] memory) {
        require(certifications[_certId].exists, "Certification does not exist");
        return certifications[_certId].requiredAKUs;
    }
}
