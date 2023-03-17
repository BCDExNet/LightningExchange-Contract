const PriceOracle = artifacts.require("PriceOracle");

module.exports = async function(deployer, network, accounts) {
    // price feeds source url
    // https://docs.chain.link/data-feeds/price-feeds/addresses/?network=bnb-chain
    const btcChainLinkFeedContract = "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf"
    const bnbChainLinkFeedContract = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
    await deployer.deploy(PriceOracle, btcChainLinkFeedContract, bnbChainLinkFeedContract);
}
