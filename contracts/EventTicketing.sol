// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title NFT Event Ticketing - simple ERC721 ticket contract with event management
/// @notice Organizers create events and mint limited-supply NFT tickets. Organizers can revoke (burn) tickets.
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EventTicketing is ERC721, AccessControl {
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _eventIdCounter;

    struct EventInfo {
        string name;
        address organizer;
        uint256 maxSupply; // 0 = unlimited
        uint256 minted;
        string baseURI; // optional base for tokenURI fallback
        bool active;
    }

    // eventId => EventInfo
    mapping(uint256 => EventInfo) public events;
    // tokenId => eventId
    mapping(uint256 => uint256) public ticketEvent;
    // per-token explicit URI (optional, typically IPFS uri)
    mapping(uint256 => string) private _tokenURIs;

    event EventCreated(uint256 indexed eventId, string name, address indexed organizer, uint256 maxSupply);
    event EventUpdated(uint256 indexed eventId);
    event TicketMinted(uint256 indexed eventId, uint256 indexed tokenId, address indexed to, string tokenURI);
    event TicketRevoked(uint256 indexed tokenId, uint256 indexed eventId);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // -----------------------
    // Event management
    // -----------------------

    /// @notice Create an event. Admin only.
    function createEvent(
        string calldata name,
        address organizer,
        uint256 maxSupply,
        string calldata baseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(organizer != address(0), "Event: zero organizer");
        _eventIdCounter.increment();
        uint256 eid = _eventIdCounter.current();
        events[eid] = EventInfo({
            name: name,
            organizer: organizer,
            maxSupply: maxSupply,
            minted: 0,
            baseURI: baseURI,
            active: true
        });
        // grant ORGANIZER_ROLE to organizer (admin can still revoke)
        _setupRole(ORGANIZER_ROLE, organizer);
        emit EventCreated(eid, name, organizer, maxSupply);
        return eid;
    }

    /// @notice Update event metadata. Admin or event organizer.
    function updateEvent(uint256 eventId, string calldata name, uint256 maxSupply, string calldata baseURI, bool active)
        external
    {
        EventInfo storage e = events[eventId];
        require(e.organizer != address(0), "Event: not found");
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || msg.sender == e.organizer,
            "Event: not organizer/admin"
        );
        e.name = name;
        e.maxSupply = maxSupply;
        e.baseURI = baseURI;
        e.active = active;
        emit EventUpdated(eventId);
    }

    // -----------------------
    // Minting / revocation
    // -----------------------

    /// @notice Mint a ticket for an event. Caller must be the event.organizer or have ORGANIZER_ROLE.
    /// tokenURI can be an IPFS URI (ipfs://...) or empty to use event.baseURI + tokenId.
    function mintTicket(uint256 eventId, address to, string calldata tokenURI_) external returns (uint256) {
        EventInfo storage e = events[eventId];
        require(e.organizer != address(0), "Event: not found");
        require(e.active, "Event: inactive");
        require(
            msg.sender == e.organizer || hasRole(ORGANIZER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Event: not organizer/admin"
        );
        if (e.maxSupply != 0) {
            require(e.minted < e.maxSupply, "Event: sold out");
        }

        _tokenIdCounter.increment();
        uint256 tid = _tokenIdCounter.current();
        _safeMint(to, tid);

        ticketEvent[tid] = eventId;
        if (bytes(tokenURI_).length != 0) {
            _tokenURIs[tid] = tokenURI_;
        }
        e.minted += 1;

        emit TicketMinted(eventId, tid, to, tokenURI_);
        return tid;
    }

    /// @notice Revoke (burn) a ticket. Only event organizer or admin.
    function revokeTicket(uint256 tokenId) external {
        require(_exists(tokenId), "Ticket: nonexistent");
        uint256 eventId = ticketEvent[tokenId];
        EventInfo storage e = events[eventId];
        require(e.organizer != address(0), "Event: not found");
        require(
            msg.sender == e.organizer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Ticket: not organizer/admin"
        );

        _burn(tokenId);

        // decrement minted count safely
        if (e.minted > 0) {
            e.minted -= 1;
        }

        delete ticketEvent[tokenId];
        delete _tokenURIs[tokenId];

        emit TicketRevoked(tokenId, eventId);
    }

    // -----------------------
    // Metadata overrides
    // -----------------------

    /// @notice Set per-token URI (organizer/admin) — useful to attach IPFS after mint.
    function setTokenURI(uint256 tokenId, string calldata uri) external {
        require(_exists(tokenId), "Token: nonexistent");
        uint256 eventId = ticketEvent[tokenId];
        EventInfo storage e = events[eventId];
        require(
            msg.sender == e.organizer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Token: not organizer/admin"
        );
        _tokenURIs[tokenId] = uri;
    }

    /// @inheritdoc ERC721
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token: nonexistent");
        string memory tUri = _tokenURIs[tokenId];
        if (bytes(tUri).length != 0) {
            return tUri;
        }
        uint256 eventId = ticketEvent[tokenId];
        string memory base = events[eventId].baseURI;
        if (bytes(base).length == 0) {
            return "";
        }
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    // -----------------------
    // Utilities & overrides
    // -----------------------

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // expose event count
    function totalEvents() external view returns (uint256) {
        return _eventIdCounter.current();
    }

    // expose total minted tickets
    function totalTickets() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
