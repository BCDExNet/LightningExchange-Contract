const CrossChainSwap = artifacts.require("CrossChainSwap");
const CrossChainSwapNative = artifacts.require("CrossChainSwapNative");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(CrossChainSwap);
    await deployer.deploy(CrossChainSwapNative);
}
