const SafeBox = artifacts.require("SafeBox");
const SafeBoxNative = artifacts.require("SafeBoxNative");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(SafeBox);
    await deployer.deploy(SafeBoxNative);
}
