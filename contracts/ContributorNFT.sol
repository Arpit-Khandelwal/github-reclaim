// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContributorNFT is ERC721, Ownable(msg.sender) {
    uint256 private _tokenIds;
    mapping(address => uint256) public contributorToTokenId;
    mapping(uint256 => uint256) public tokenIdToContributions;

    constructor() ERC721("GitHub Contributor NFT", "GCNFT") {}

    function mintNFT(address contributor, uint256 contributions) external onlyOwner {
        require(contributorToTokenId[contributor] == 0, "Already has NFT");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _safeMint(contributor, newTokenId);
        contributorToTokenId[contributor] = newTokenId;
        tokenIdToContributions[newTokenId] = contributions;
    }

    function updateContributions(address contributor, uint256 newContributions) external onlyOwner {
        uint256 tokenId = contributorToTokenId[contributor];
        require(tokenId != 0, "No NFT found");
        tokenIdToContributions[tokenId] = newContributions;
    }
}