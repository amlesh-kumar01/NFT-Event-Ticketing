const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicketing", function () {
  let eventTicketing;
  let owner, organizer, buyer, buyer2;

  beforeEach(async function () {
    [owner, organizer, buyer, buyer2] = await ethers.getSigners();

    const EventTicketing = await ethers.getContractFactory("EventTicketing");
    eventTicketing = await EventTicketing.deploy("Event Tickets", "ETIX");
    await eventTicketing.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await eventTicketing.DEFAULT_ADMIN_ROLE();
      expect(await eventTicketing.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set the correct name and symbol", async function () {
      expect(await eventTicketing.name()).to.equal("Event Tickets");
      expect(await eventTicketing.symbol()).to.equal("ETIX");
    });
  });

  describe("Event Management", function () {
    it("Should create an event", async function () {
      const tx = await eventTicketing.createEvent(
        "Test Event",
        organizer.address,
        100, // max supply
        "https://example.com/metadata/"
      );

      await expect(tx)
        .to.emit(eventTicketing, "EventCreated")
        .withArgs(1, "Test Event", organizer.address, 100);

      const event = await eventTicketing.events(1);
      expect(event.name).to.equal("Test Event");
      expect(event.organizer).to.equal(organizer.address);
      expect(event.maxSupply).to.equal(100);
      expect(event.active).to.be.true;
    });

    it("Should grant organizer role to event organizer", async function () {
      await eventTicketing.createEvent(
        "Test Event",
        organizer.address,
        100,
        "https://example.com/metadata/"
      );

      const ORGANIZER_ROLE = await eventTicketing.ORGANIZER_ROLE();
      expect(await eventTicketing.hasRole(ORGANIZER_ROLE, organizer.address)).to.be.true;
    });

    it("Should only allow admin to create events", async function () {
      await expect(
        eventTicketing.connect(organizer).createEvent(
          "Test Event",
          organizer.address,
          100,
          "https://example.com/metadata/"
        )
      ).to.be.reverted;
    });

    it("Should update event details", async function () {
      await eventTicketing.createEvent(
        "Test Event",
        organizer.address,
        100,
        "https://example.com/metadata/"
      );

      await eventTicketing.connect(organizer).updateEvent(
        1,
        "Updated Event",
        200,
        "https://updated.com/metadata/",
        false
      );

      const event = await eventTicketing.events(1);
      expect(event.name).to.equal("Updated Event");
      expect(event.maxSupply).to.equal(200);
      expect(event.active).to.be.false;
    });
  });

  describe("Ticket Minting", function () {
    beforeEach(async function () {
      await eventTicketing.createEvent(
        "Test Event",
        organizer.address,
        100,
        "https://example.com/metadata/"
      );
    });

    it("Should mint a ticket", async function () {
      const tx = await eventTicketing.connect(organizer).mintTicket(
        1,
        buyer.address,
        "https://ipfs.io/ipfs/QmTest"
      );

      await expect(tx)
        .to.emit(eventTicketing, "TicketMinted")
        .withArgs(1, 1, buyer.address, "https://ipfs.io/ipfs/QmTest");

      expect(await eventTicketing.ownerOf(1)).to.equal(buyer.address);
      expect(await eventTicketing.ticketEvent(1)).to.equal(1);

      const event = await eventTicketing.events(1);
      expect(event.minted).to.equal(1);
    });

    it("Should only allow organizer or admin to mint", async function () {
      await expect(
        eventTicketing.connect(buyer).mintTicket(
          1,
          buyer.address,
          "https://ipfs.io/ipfs/QmTest"
        )
      ).to.be.reverted;
    });

    it("Should respect max supply", async function () {
      // Create event with max supply of 1
      await eventTicketing.createEvent(
        "Limited Event",
        organizer.address,
        1,
        "https://example.com/metadata/"
      );

      // Mint first ticket - should succeed
      await eventTicketing.connect(organizer).mintTicket(
        2,
        buyer.address,
        ""
      );

      // Try to mint second ticket - should fail
      await expect(
        eventTicketing.connect(organizer).mintTicket(
          2,
          buyer2.address,
          ""
        )
      ).to.be.revertedWith("Event: sold out");
    });

    it("Should not mint for inactive events", async function () {
      // Deactivate the event
      await eventTicketing.connect(organizer).updateEvent(
        1,
        "Test Event",
        100,
        "https://example.com/metadata/",
        false
      );

      await expect(
        eventTicketing.connect(organizer).mintTicket(
          1,
          buyer.address,
          ""
        )
      ).to.be.revertedWith("Event: inactive");
    });
  });

  describe("Ticket Management", function () {
    beforeEach(async function () {
      await eventTicketing.createEvent(
        "Test Event",
        organizer.address,
        100,
        "https://example.com/metadata/"
      );
      await eventTicketing.connect(organizer).mintTicket(
        1,
        buyer.address,
        "https://ipfs.io/ipfs/QmTest"
      );
    });

    it("Should allow ticket transfers", async function () {
      await eventTicketing.connect(buyer).transferFrom(
        buyer.address,
        buyer2.address,
        1
      );

      expect(await eventTicketing.ownerOf(1)).to.equal(buyer2.address);
    });

    it("Should revoke tickets", async function () {
      const tx = await eventTicketing.connect(organizer).revokeTicket(1);

      await expect(tx)
        .to.emit(eventTicketing, "TicketRevoked")
        .withArgs(1, 1);

      await expect(eventTicketing.ownerOf(1)).to.be.reverted;

      // Check that minted count decreased
      const event = await eventTicketing.events(1);
      expect(event.minted).to.equal(0);
    });

    it("Should only allow organizer or admin to revoke", async function () {
      await expect(
        eventTicketing.connect(buyer).revokeTicket(1)
      ).to.be.reverted;
    });

    it("Should set token URI", async function () {
      const newURI = "https://ipfs.io/ipfs/QmNewTest";
      await eventTicketing.connect(organizer).setTokenURI(1, newURI);

      expect(await eventTicketing.tokenURI(1)).to.equal(newURI);
    });

    it("Should use base URI when no token URI is set", async function () {
      // Mint a ticket without specific URI
      await eventTicketing.connect(organizer).mintTicket(
        1,
        buyer2.address,
        ""
      );

      const tokenURI = await eventTicketing.tokenURI(2);
      expect(tokenURI).to.equal("https://example.com/metadata/2");
    });
  });

  describe("Utility Functions", function () {
    it("Should return total events", async function () {
      expect(await eventTicketing.totalEvents()).to.equal(0);

      await eventTicketing.createEvent(
        "Event 1",
        organizer.address,
        100,
        "https://example.com/metadata/"
      );

      expect(await eventTicketing.totalEvents()).to.equal(1);

      await eventTicketing.createEvent(
        "Event 2",
        organizer.address,
        50,
        "https://example.com/metadata/"
      );

      expect(await eventTicketing.totalEvents()).to.equal(2);
    });

    it("Should return total tickets", async function () {
      await eventTicketing.createEvent(
        "Test Event",
        organizer.address,
        100,
        "https://example.com/metadata/"
      );

      expect(await eventTicketing.totalTickets()).to.equal(0);

      await eventTicketing.connect(organizer).mintTicket(
        1,
        buyer.address,
        ""
      );

      expect(await eventTicketing.totalTickets()).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("Should support ERC721 and AccessControl interfaces", async function () {
      // ERC721 interface ID
      expect(await eventTicketing.supportsInterface("0x80ac58cd")).to.be.true;
      
      // AccessControl interface ID  
      expect(await eventTicketing.supportsInterface("0x7965db0b")).to.be.true;
    });
  });
});