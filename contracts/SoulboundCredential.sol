// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SoulboundCredential
 * @dev Non-transferable ERC-721 token representing academic credentials (AKUs and Certifications).
 */
contract SoulboundCredential {
    string public name = "Lorentz Soulbound Credential";
    string public symbol = "LSBC";
    
    address public owner;
    uint256 private _nextTokenId;
    
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to metadata URI
    mapping(uint256 => string) private _tokenURIs;
    
    // Mapping from token ID to credential details
    struct CredentialInfo {
        uint256 id;
        uint256 credentialType; // 1 = AKU, 2 = Certification
        uint256 referenceId;    // AKU ID or Certification ID
        uint256 timestamp;
    }
    mapping(uint256 => CredentialInfo) private _credentials;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event CredentialMinted(address indexed to, uint256 indexed tokenId, uint256 credentialType, uint256 referenceId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        _nextTokenId = 1;
    }

    /**
     * @dev Mints a new soulbound credential to a student.
     */
    function mint(
        address to, 
        string memory uri, 
        uint256 credentialType, 
        uint256 referenceId
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _balances[to] += 1;
        _tokenURIs[tokenId] = uri;
        
        _credentials[tokenId] = CredentialInfo({
            id: tokenId,
            credentialType: credentialType,
            referenceId: referenceId,
            timestamp: block.timestamp
        });

        emit Transfer(address(0), to, tokenId);
        emit CredentialMinted(to, tokenId, credentialType, referenceId);
        
        return tokenId;
    }

    /**
     * @dev Standard ERC721 balanceOf
     */
    function balanceOf(address student) external view returns (uint256) {
        require(student != address(0), "Zero address is not valid");
        return _balances[student];
    }

    /**
     * @dev Standard ERC721 ownerOf
     */
    function ownerOf(uint256 tokenId) external view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token ID does not exist");
        return tokenOwner;
    }

    /**
     * @dev Retrieves the URI of a token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token ID does not exist");
        return _tokenURIs[tokenId];
    }
    
    /**
     * @dev Retrieves credential info
     */
    function getCredential(uint256 tokenId) external view returns (uint256, uint256, uint256, uint256) {
        require(_owners[tokenId] != address(0), "Token ID does not exist");
        CredentialInfo memory cred = _credentials[tokenId];
        return (cred.id, cred.credentialType, cred.referenceId, cred.timestamp);
    }

    /**
     * @dev Disable transfers to make the token Soulbound.
     */
    function transferFrom(address from, address to, uint256 tokenId) external pure {
        revert("Transfers are disabled: this is a Soulbound token");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external pure {
        revert("Transfers are disabled: this is a Soulbound token");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external pure {
        revert("Transfers are disabled: this is a Soulbound token");
    }
}
