const LightningSwap = artifacts.require("LightningSwap");
const LightningSwapNative = artifacts.require("LightningSwapNative");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(LightningSwap);
    await deployer.deploy(LightningSwapNative);
}
