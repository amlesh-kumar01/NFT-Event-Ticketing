/* eslint-disable no-console */
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);

  const NAME = process.env.TICKETS_NAME || "Event Tickets";
  const SYMBOL = process.env.TICKETS_SYMBOL || "ETIX";
  const CONFIRMATIONS = Number(process.env.CONFIRMATIONS || (network === "hardhat" ? 1 : 5));

  console.log("=".repeat(50));
  console.log("🎫 NFT Event Ticketing Deployment");
  console.log("=".repeat(50));
  console.log(`Network: ${network}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH`);
  console.log(`Contract Name: ${NAME}`);
  console.log(`Contract Symbol: ${SYMBOL}`);
  console.log("=".repeat(50));

  console.log("📦 Deploying EventTicketing contract...");

  const Factory = await hre.ethers.getContractFactory("EventTicketing");
  const contract = await Factory.deploy(NAME, SYMBOL);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`✅ EventTicketing deployed at: ${address}`);
  console.log(`🔄 Waiting for ${CONFIRMATIONS} block confirmations...`);
  await contract.deploymentTransaction().wait(CONFIRMATIONS);
  console.log(`✅ Deployment confirmed!`);

  // Optional: create an initial event from environment variables
  const CREATE_EVENT = process.env.CREATE_INITIAL_EVENT === "true";
  if (CREATE_EVENT) {
    console.log("\n🎪 Creating initial event...");
    const EVENT_NAME = process.env.EVENT_NAME || "Sample Event";
    const ORGANIZER = process.env.ORGANIZER || deployer.address;
    const MAX_SUPPLY = BigInt(process.env.MAX_SUPPLY || "0"); // 0 = unlimited
    const BASE_URI = process.env.BASE_URI || ""; // e.g., ipfs://<CID>/

    console.log(`Event Name: ${EVENT_NAME}`);
    console.log(`Organizer: ${ORGANIZER}`);
    console.log(`Max Supply: ${MAX_SUPPLY === 0n ? "Unlimited" : MAX_SUPPLY.toString()}`);
    console.log(`Base URI: ${BASE_URI || "Not set"}`);

    try {
      const tx = await contract.createEvent(EVENT_NAME, ORGANIZER, MAX_SUPPLY, BASE_URI);
      const receipt = await tx.wait();
      
      // Find the EventCreated event
      const eventCreatedLog = receipt.logs.find(
        log => log.fragment && log.fragment.name === "EventCreated"
      );
      
      const eventId = eventCreatedLog ? eventCreatedLog.args[0] : "unknown";
      console.log(`✅ Event created with ID: ${eventId.toString()}`);
    } catch (error) {
      console.error(`❌ Failed to create event: ${error.message}`);
    }
  }

  // Optional: Etherscan/Polygonscan verification
  if (process.env.ETHERSCAN_API_KEY || process.env.POLYGONSCAN_API_KEY) {
    console.log("\n🔍 Attempting contract verification...");
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [NAME, SYMBOL],
      });
      console.log("✅ Contract verified successfully!");
    } catch (err) {
      const msg = `${err}`;
      if (msg.includes("Already Verified")) {
        console.log("ℹ️  Contract already verified.");
      } else {
        console.warn(`⚠️  Verification skipped/failed: ${msg}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Deployment Summary");
  console.log("=".repeat(50));
  console.log(`Contract Address: ${address}`);
  console.log(`Network: ${network}`);
  console.log(`Transaction Hash: ${contract.deploymentTransaction().hash}`);
  console.log(`Gas Used: ${(await contract.deploymentTransaction().wait()).gasUsed.toString()}`);
  console.log("=".repeat(50));
  console.log("✅ Done!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});
