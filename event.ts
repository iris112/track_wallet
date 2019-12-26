import Web3 from 'web3';
import Decimal from 'decimal.js';
import * as dbManager from './db/dbManager';
import request from 'request';
import * as dotenv from 'dotenv';
// import wallet from './wallet';

dotenv.config();
const web3Http = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/21d44f97cb3f4f2e8c113c76d05bbf77'));
var wallets = [];
var provider;
var web3 = undefined;
var prevTxHash = '';

function createProvider() {
    provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/21d44f97cb3f4f2e8c113c76d05bbf77');
    if (web3 == undefined)
    	web3 = new Web3(provider);
   	else
    	web3.setProvider(provider);

    provider.on('error', error_callback);
    provider.on('end', end_callback);
    provider.on('close', end_callback);
    provider.on('connect', connect_callback);
}

const error_callback = function () {
	console.log('WSS error');
	createProvider();
}

const end_callback = function () {
	console.log('WSS closed');
	createProvider();
}

const connect_callback = function () {
	console.log('WSS connected');
}

createProvider();

const WEI = 1000000000000000000;
const ethToWei = (amount) => new Decimal(amount).times(WEI);

function validateTransaction(trx) {
  const toValid = trx.to !== null;
  if (!toValid) 
  	return {result: false, address: ''};

  const toWallet = wallets.includes(trx.to.toLowerCase());
  if (toWallet)
  	return {result: true, address: trx.to};

  const fromWallet = wallets.includes(trx.from.toLowerCase());
  if (fromWallet)
  	return {result: true, address: trx.from};

  return {result: false, address: ''};
}

async function getConfirmations(txHash) {
	try {

		const currentBlock = await web3.eth.getBlockNumber();
		const trx = await web3Http.eth.getTransaction(txHash);

		return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber + 1;
	}
	catch (error) {
		console.log(error);
	}
}

function confirmEtherTransaction(txHash, confirmations = 1, wallet_address) {
	setTimeout(async () => {
		// Get current number of confirmations and compare it with sought-for value
		const trxConfirmations = await getConfirmations(txHash);
		console.log('Transaction with hash ' + txHash + ' has ' + trxConfirmations + ' confirmation(s)');

		if (trxConfirmations >= confirmations) {
			console.log('Transaction with hash ' + txHash + ' has been successfully confirmed');
			
			// // Get Balance
			// const balance = await web3Http.eth.getBalance(wallet_address);
			// if (balance < ethToWei(process.env.LIMIT_BALANCE))
			console.log("Add Wallet Event", wallet_address, txHash);
			dbManager.insert_wallet_event(wallet_address, txHash, 0);
			return;

		}

		return confirmEtherTransaction(txHash, confirmations, wallet_address);
	}, 10 * 1000);
}

function watchEtherTransfers() {
	const subscription = web3.eth.subscribe('pendingTransactions')

	// Subscribe to pending transactions
	subscription.subscribe((error, result) => {
		if (error) 
			console.log(error);
	})
	.on('data', async (txHash) => {
		try {
			// Get transaction details	
			if (prevTxHash === txHash)
				return;

			prevTxHash = txHash;
			const trx = await web3Http.eth.getTransaction(txHash)
			if (trx === null)
				return;

			const valid = validateTransaction(trx);
			if (!valid.result)
				return;

			console.log('Found incoming Ether transaction from ' + trx.from + ' to ' + trx.to);;
			console.log('Transaction value is: ' + trx.value);
			console.log('Transaction hash is: ' + trx.hash);
			
			confirmEtherTransaction(txHash, 1, valid.address);
		}
		catch (error) {
			console.log(error);
		}
	})
}

async function listenEvent() {
	console.log('Listening token transfer event');
	wallets = await dbManager.get_all_wallet_address();
	watchEtherTransfers();
}

listenEvent();