// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftEventTicketing is ERC721, Ownable {
    uint256 public nextTicketId = 1;
    uint256 public ticketPrice = 0.01 ether;
    uint256 public totalTickets;
    string public eventName;

    mapping(uint256 => bool) public ticketUsed;

    constructor(string memory _eventName, uint256 _totalTickets)
        ERC721("EventTicket", "ETK")
        Ownable(msg.sender)
    {
        eventName = _eventName;
        totalTickets = _totalTickets;
    }

    // Core Function 1: Buy a new NFT ticket
    function buyTicket() external payable {
        require(msg.value == ticketPrice, "Incorrect price");
        require(nextTicketId <= totalTickets, "Tickets sold out");

        _safeMint(msg.sender, nextTicketId);
        nextTicketId++;
    }

    // Core Function 2: Verify a ticket (can only be done once)
    function verifyTicket(uint256 ticketId) external onlyOwner {
        require(_ownerOf(ticketId) != address(0), "Invalid ticket");
        require(!ticketUsed[ticketId], "Ticket already used");

        ticketUsed[ticketId] = true;
    }

    // Core Function 3: Withdraw collected funds
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
