const hre = require("hardhat");

async function main() {
  const NftEventTicketing = await hre.ethers.getContractFactory("NftEventTicketing");
  const nftEventTicketing = await NftEventTicketing.deploy("Music Festival 2025", 100);
  await nftEventTicketing.waitForDeployment();
  console.log("Contract deployed to:", await nftEventTicketing.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
