const hre = require("hardhat");

async function main() {
  console.log("Deploying MediaAssetNFT contract...");

  const MediaAssetNFT = await hre.ethers.getContractFactory("MediaAssetNFT");
  const mediaAssetNFT = await MediaAssetNFT.deploy();

  await mediaAssetNFT.deployed();

  console.log("MediaAssetNFT deployed to:", mediaAssetNFT.address);
  
  console.log("\nSave this address to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${mediaAssetNFT.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
