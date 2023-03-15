const SafeBoxNative = artifacts.require("SafeBoxNative");
const truffleAssert = require('truffle-assertions');

contract("SafeBoxNative", (accounts) => {
    let safebox;

    const owner = accounts[0];
    const depositer = accounts[1];
    const withdrawer = accounts[2];
    const intender = accounts[3];

    beforeEach(async () => {
        safebox = await SafeBoxNative.new({ from: owner });
    });

    it("should withdraw successfully", async() => {
        let amount = web3.utils.toWei("10","ether");
        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await new Promise(r => setTimeout(r, 500));

        await safebox.withdraw(sceret, {from: withdrawer});
    });

    it("should withdraw failed because of error secret", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await new Promise(r => setTimeout(r, 500));
        await truffleAssert.reverts(
            safebox.withdraw(web3.utils.asciiToHex("abcdefg2348989"), {from: withdrawer}),
            "Invalid beneficiary");
    });

    it("should withdraw failed because of error withdrawer", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await new Promise(r => setTimeout(r, 500));
        await truffleAssert.reverts(
            safebox.withdraw(sceret, {from: intender}), "Invalid beneficiary");
    });

    it("should delegateWithdraw successfully", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await new Promise(r => setTimeout(r, 500));

        let balance = await web3.eth.getBalance(withdrawer);

        await safebox.delegateWithdraw(sceret, withdrawer, {from: intender});

        let balanceAfter = await web3.eth.getBalance(withdrawer);
        let delta = balanceAfter - balance;
        assert.equal(delta, amount, "withdraw amount not match");
    });

    it("should withdraw failed because of deadline", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await new Promise(r => setTimeout(r, 1000));

        await truffleAssert.reverts(safebox.withdraw(sceret, {from: withdrawer}), "Deposit has expired");
    });

    it("should refund failed because of deadline", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000;

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await new Promise(r => setTimeout(r, 1000));

        await truffleAssert.reverts(safebox.refund(hash, {from: depositer}), "Invalid refund requester");
    });

    it("should refund failed because of msg.sender", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp;

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await new Promise(r => setTimeout(r, 1000));

        await truffleAssert.reverts(safebox.refund(hash, {from: withdrawer}), "Invalid refund requester");
    });

    it("should refund successfully", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp - 100;

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

        await safebox.refund(hash, {from: depositer});
    });

    it("should get depositor successfully", async() => {
        let amount = web3.utils.toWei("10","ether");

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp + 1000

        await safebox.deposit(withdrawer, hash, timestamp, "test", {from: depositer, value: amount});

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
