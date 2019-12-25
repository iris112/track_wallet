import Web3 from 'web3';
import Decimal from 'decimal.js';
import * as dbManager from './db/dbManager';
import request from 'request';
import * as dotenv from 'dotenv';

dotenv.config();
const web3Http = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'));
var provider;
var web3 = undefined;

function createProvider() {
    provider = new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
    if (web3 == undefined)
    	web3 = new Web3(provider);
   	else
    	web3.setProvider(provider);

    provider.on('error', error_callback);
    provider.on('end', end_callback);
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
  	return false;
  
  const walletToValid = trx.to.toLowerCase() === process.env.WALLET_TO.toLowerCase();
  const walletFromValid = trx.from.toLowerCase() === process.env.WALLET_FROM.toLowerCase();
  
  return toValid && walletToValid && walletFromValid;
}

async function getConfirmations(txHash) {
	try {

		const trx = await web3Http.eth.getTransaction(txHash);

		const currentBlock = await web3.eth.getBlockNumber();

		return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber;
	}
	catch (error) {
		console.log(error);
	}
}

function confirmEtherTransaction(txHash, confirmations = 10) {
	setTimeout(async () => {
		// Get current number of confirmations and compare it with sought-for value
		const trxConfirmations = await getConfirmations(txHash);
		console.log('Transaction with hash ' + txHash + ' has ' + trxConfirmations + ' confirmation(s)');

		if (trxConfirmations >= confirmations) {
			console.log('Transaction with hash ' + txHash + ' has been successfully confirmed');
			return;
		}

		return confirmEtherTransaction(txHash, confirmations);
	}, 30 * 1000);
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
			const trx = await web3Http.eth.getTransaction(txHash)
			// if (!validateTransaction(trx))
			// 	return;

			console.log('Found incoming Ether transaction from ' + trx.from + ' to ' + trx.to);;
			console.log('Transaction value is: ' + trx.value);
			console.log('Transaction hash is: ' + trx.hash);
			console.log('Transaction data is: ' + trx.input);
		}
		catch (error) {
			console.log(error);
		}
	})
}

function listenEvent() {
	// console.log('Listening token transfer event');
	// watchEtherTransfers();
}