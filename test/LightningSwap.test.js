const LightningSwap = artifacts.require("LightningSwap");
const MockERC20 = artifacts.require("MockERC20");
const truffleAssert = require('truffle-assertions');

contract("LightningSwap", (accounts) => {
    let safebox;
    let token;

    const owner = accounts[0];
    const depositer = accounts[1];
    const withdrawer = accounts[2];
    const intender = accounts[3];

    beforeEach(async () => {
        safebox = await LightningSwap.new({ from: owner });
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

        let balance = await token.balanceOf(depositer);
        await safebox.refund(hash, {from: depositer});
        let balanceAfter = await token.balanceOf(depositer);
        let delta = balanceAfter - balance;
        assert.equal(delta, amount, "refund amount not match");
    });

    it("should delegateRefund successfully", async() => {
        let amount = web3.utils.toWei("100","ether");
        await token.mint(depositer, amount);
        await token.approve(safebox.address, amount, {from: depositer});

        const sceret = web3.utils.asciiToHex("abcdefg234898988");

        let hash = await safebox.sha256Hash(sceret);

        let blockNumber = await web3.eth.getBlockNumber();
        let block = await web3.eth.getBlock(blockNumber);
        let timestamp = block.timestamp - 100;

        await safebox.deposit(token.address, amount, withdrawer, hash, timestamp, "test", {from: depositer});

        let balance = await token.balanceOf(depositer);
        await safebox.delegateRefund(hash, depositer, {from: intender});
        let balanceAfter = await token.balanceOf(depositer);
        let delta = balanceAfter - balance;
        assert.equal(delta, amount, "delegateRefund amount not match");
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

    it("should get the correct btc price", async() => {
        const amount1 = web3.utils.toWei("30750000","ether");
        const amount2 = web3.utils.toWei("30750","ether");
        const amount3 = web3.utils.toWei("30.75","ether");
        const amount4 = web3.utils.toWei("0.03075","ether");
        const invoice1 = "lnbc1230000m1pjpxknapp5clhq77zsx5ccwvm3y7wm949xprcw29535g2mkvaf6dhlf9le4s4qdqqcqzzgxqyz5vqrzjqwnvuc0u4txn35cafc7w94gxvq5p3cu9dd95f7hlrh0fvs46wpvhd70yyr655rkktyqqqqryqqqqthqqpyrzjqw8c7yfutqqy3kz8662fxutjvef7q2ujsxtt45csu0k688lkzu3ld70yyr655rkktyqqqqryqqqqthqqpysp53napftl8mj9sh6q7nu2t4zm0gpuguzd59xxl00l9gkvaxr0rdrcs9qypqsqjvxy3kfugtkl3v5g6sv3jhwn8rujaz98yc88lfhl3fp8fpglxufss2x2gm5c4cq3evcklr7scv5mtgjh6qw33z6qyef9ck7t8c0jx9gqm66g03";
        const invoice2 = "lnbc1230000u1pjpxknapp5clhq77zsx5ccwvm3y7wm949xprcw29535g2mkvaf6dhlf9le4s4qdqqcqzzgxqyz5vqrzjqwnvuc0u4txn35cafc7w94gxvq5p3cu9dd95f7hlrh0fvs46wpvhd70yyr655rkktyqqqqryqqqqthqqpyrzjqw8c7yfutqqy3kz8662fxutjvef7q2ujsxtt45csu0k688lkzu3ld70yyr655rkktyqqqqryqqqqthqqpysp53napftl8mj9sh6q7nu2t4zm0gpuguzd59xxl00l9gkvaxr0rdrcs9qypqsqjvxy3kfugtkl3v5g6sv3jhwn8rujaz98yc88lfhl3fp8fpglxufss2x2gm5c4cq3evcklr7scv5mtgjh6qw33z6qyef9ck7t8c0jx9gqm66g03";
        const invoice3 = "lnbc1230000n1pjpxknapp5clhq77zsx5ccwvm3y7wm949xprcw29535g2mkvaf6dhlf9le4s4qdqqcqzzgxqyz5vqrzjqwnvuc0u4txn35cafc7w94gxvq5p3cu9dd95f7hlrh0fvs46wpvhd70yyr655rkktyqqqqryqqqqthqqpyrzjqw8c7yfutqqy3kz8662fxutjvef7q2ujsxtt45csu0k688lkzu3ld70yyr655rkktyqqqqryqqqqthqqpysp53napftl8mj9sh6q7nu2t4zm0gpuguzd59xxl00l9gkvaxr0rdrcs9qypqsqjvxy3kfugtkl3v5g6sv3jhwn8rujaz98yc88lfhl3fp8fpglxufss2x2gm5c4cq3evcklr7scv5mtgjh6qw33z6qyef9ck7t8c0jx9gqm66g03";
        const invoice4 = "lnbc1230000p1pjpxknapp5clhq77zsx5ccwvm3y7wm949xprcw29535g2mkvaf6dhlf9le4s4qdqqcqzzgxqyz5vqrzjqwnvuc0u4txn35cafc7w94gxvq5p3cu9dd95f7hlrh0fvs46wpvhd70yyr655rkktyqqqqryqqqqthqqpyrzjqw8c7yfutqqy3kz8662fxutjvef7q2ujsxtt45csu0k688lkzu3ld70yyr655rkktyqqqqryqqqqthqqpysp53napftl8mj9sh6q7nu2t4zm0gpuguzd59xxl00l9gkvaxr0rdrcs9qypqsqjvxy3kfugtkl3v5g6sv3jhwn8rujaz98yc88lfhl3fp8fpglxufss2x2gm5c4cq3evcklr7scv5mtgjh6qw33z6qyef9ck7t8c0jx9gqm66g03";

        const inv1 = await safebox.parseInvoice(invoice1)
        assert.equal(inv1.amount, 1230000000000000, "wrong btc amount of parse invoice")
        const price1 = await safebox.calculateBTCtoTokenPrice(token.address, amount1, invoice1)        
        assert.equal(price1, 2500000000000, "wrong btc price result of calc method")


        const inv2 = await safebox.parseInvoice(invoice2)
        assert.equal(inv2.amount, 1230000000000, "wrong btc amount of parse invoice")
        const price2 = await safebox.calculateBTCtoTokenPrice(token.address, amount2, invoice2)
        assert.equal(price2, 2500000000000, "wrong btc price result of calc method")


        const inv3 = await safebox.parseInvoice(invoice3)
        assert.equal(inv3.amount, 1230000000, "wrong btc amount of parse invoice")
        const price3 = await safebox.calculateBTCtoTokenPrice(token.address, amount3, invoice3)
        assert.equal(price3, 2500000000000, "wrong btc price result of calc method")


        const inv4 = await safebox.parseInvoice(invoice4)
        assert.equal(inv4.amount, 1230000, "wrong btc amount of parse invoice")
        const price4 = await safebox.calculateBTCtoTokenPrice(token.address, amount4, invoice4)
        assert.equal(price4, 2500000000000, "wrong btc price result of calc method")
    });
})
