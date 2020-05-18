const DeedMultiPayouts = artifacts.require('DeedMultiPayouts');

contract('DeedMultiPayouts', (accounts) => {
	let deedMultiPayouts = null;
	before(async () => {
		deedMultiPayouts = await DeedMultiPayouts.deployed();
	});

	it('Should withdraw for all payouts (1)', async () => {
		for(let i = 0; i < 4; i++) {
			const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
			await new Promise(resolve => setTimeout(resolve, 1000));
			await deedMultiPayouts.withdraw({from: accounts[1]});
			const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
			assert(balanceAfter.sub(balanceBefore).toNumber() === 250);
		}
	});

	it('Should withdraw for all payouts (2)', async () => {
		const deedMultiPayouts = await DeedMultiPayouts.new(accounts[0], accounts[1], 1, {from: 1000});
		for(let i = 0; i < 2; i++) {
			const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
			await new Promise(resolve => setTimeout(resolve, 2000));
			await deedMultiPayouts.withdraw({from: accounts[1]});
			const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
			assert(balanceAfter.sub(balanceBefore).toNumber() === 500);
		}
	});

	it('Should not withdraw too early', async () => {
		const deedMultiPayouts = await DeedMultiPayouts.new(accounts[0], accounts[1], 5, {value: 1000});
		try {
			await deedMultiPayouts.withdraw({from: accounts[1]});
		} catch (e){
			assert(e.message.includes('too early to make call'));
			return;
		}
		assert(false);
	});

	it('Should not withdraw if caller is not beneficiary', async () => {
		const deedMultiPayouts = await DeedMultiPayouts.new(accounts[0], accounts[1], 5, {value: 1000});
		try {
			await deedMultiPayouts.withdraw({from: accounts[7]});
		} catch (e){
			assert(e.message.includes('only beneficiary can call this'));
			return;
		} 
		assert(false);
	});
}); 

