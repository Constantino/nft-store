// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable{

    address[16] public owners;
    address[16] public minted;

    constructor() ERC721("MyArtNFT", "NFT") {}

    function mintNFT(uint tokenId) payable public returns (uint) {
        require(tokenId >= 0 && tokenId <= 6);

        _mint(address(this), tokenId);
        minted[tokenId] = msg.sender;

        return tokenId;
    }

    function transferNFT(uint tokenId) payable public returns (uint) {
        require(tokenId >= 0 && tokenId <= 6);

        _transfer(ownerOf(tokenId), msg.sender, tokenId);
        owners[tokenId] = msg.sender;

        return tokenId;
    }

    function getOwners() public view returns (address[16] memory){
        return owners;
    }

    function getMinted() public view returns (address[16] memory){
        return minted;
    }
}