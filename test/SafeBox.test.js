const SafeBox = artifacts.require("SafeBox");
const MockERC20 = artifacts.require("MockERC20");
const truffleAssert = require('truffle-assertions');

contract("SafeBox", (accounts) => {
    let safebox;
    let token;

    const owner = accounts[0];
    const depositer = accounts[1];
    const withdrawer = accounts[2];
    const intender = accounts[3];

    beforeEach(async () => {
        safebox = await SafeBox.new({ from: owner });
        token = await MockERC20.new({ from: owner });
    });

    it("should withdraw successfully", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await new Promise(r => setTimeout(r, 500));

        await safebox.withdraw(sceret, {from: withdrawer});
    });

    it("should withdraw failed because of error secret", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await new Promise(r => setTimeout(r, 500));
        await truffleAssert.reverts(
            safebox.withdraw(web3.utils.asciiToHex("abcdefg2348989"), {from: withdrawer}),
            "Invalid beneficiary");
    });

    it("should withdraw failed because of error withdrawer", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await new Promise(r => setTimeout(r, 500));
        await truffleAssert.reverts(
            safebox.withdraw(sceret, {from: intender}), "Invalid beneficiary");
    });

    it("should delegateWithdraw successfully", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await new Promise(r => setTimeout(r, 500));

        await safebox.delegateWithdraw(sceret, withdrawer, {from: intender});
    });

    it("should withdraw failed because of deadline", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await new Promise(r => setTimeout(r, 1000));

        await truffleAssert.reverts(safebox.withdraw(sceret, {from: withdrawer}), "Deposit has expired");
    });

    it("should refund failed because of deadline", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000;

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await new Promise(r => setTimeout(r, 1000));

        await truffleAssert.reverts(safebox.refund(hash, {from: depositer}), "Invalid refund requester");
    });

    it("should refund failed because of msg.sender", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp;

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await new Promise(r => setTimeout(r, 1000));

        await truffleAssert.reverts(safebox.refund(hash, {from: withdrawer}), "Invalid refund requester");
    });

    it("should refund successfully", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp - 100;

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        await safebox.refund(hash, {from: depositer});
    });

    it("should get depositor successfully", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        let len = await safebox.getDepositorHashLength(depositer);
        assert.equal(len, 1, "depositor hash length not match");

        let hash1 = await safebox.getDepositorHashByIndex(depositer, 0);
        assert.equal(hash1, hash, "depositor hash not match");

        len = await safebox.getWithdrawerHashLength(withdrawer);
        assert.equal(len, 1, "withdrawer hash length not match");

        hash1 = await safebox.getWithdrawerHashByIndex(withdrawer, 0);
        assert.equal(hash1, hash, "withdrawer hash not match");

        await safebox.withdraw(sceret, {from: withdrawer});

        len = await safebox.getDepositorHashLength(depositer);
        assert.equal(len, 0, "depositor hash length not match after withdraw");
        len = await safebox.getWithdrawerHashLength(withdrawer);
        assert.equal(len, 0, "withdrawer hash length not match after withdraw");
    });
})
