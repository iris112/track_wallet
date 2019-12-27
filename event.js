"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const decimal_js_1 = __importDefault(require("decimal.js"));
const dbManager = __importStar(require("./db/dbManager"));
const dotenv = __importStar(require("dotenv"));
// import wallet from './wallet';
dotenv.config();
const web3Http = new web3_1.default(new web3_1.default.providers.HttpProvider('https://ropsten.infura.io/v3/21d44f97cb3f4f2e8c113c76d05bbf77'));
var wallets = [];
var provider;
var web3 = undefined;
var prevTxHash = '';
function createProvider() {
    provider = new web3_1.default.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/21d44f97cb3f4f2e8c113c76d05bbf77');
    if (web3 == undefined)
        web3 = new web3_1.default(provider);
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
};
const end_callback = function () {
    console.log('WSS closed');
    createProvider();
};
const connect_callback = function () {
    console.log('WSS connected');
};
createProvider();
const WEI = 1000000000000000000;
const ethToWei = (amount) => new decimal_js_1.default(amount).times(WEI);
function validateTransaction(trx) {
    const toValid = trx.to !== null;
    if (!toValid)
        return { result: false, address: '' };
    const toWallet = wallets.includes(trx.to.toLowerCase());
    if (toWallet)
        return { result: true, address: trx.to };
    const fromWallet = wallets.includes(trx.from.toLowerCase());
    if (fromWallet)
        return { result: true, address: trx.from };
    return { result: false, address: '' };
}
function getConfirmations(txHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentBlock = yield web3.eth.getBlockNumber();
            const trx = yield web3Http.eth.getTransaction(txHash);
            return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber + 1;
        }
        catch (error) {
            console.log(error);
        }
    });
}
function confirmEtherTransaction(txHash, confirmations = 1, wallet_address) {
    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        // Get current number of confirmations and compare it with sought-for value
        const trxConfirmations = yield getConfirmations(txHash);
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
    }), 10 * 1000);
}
function watchEtherTransfers() {
    const subscription = web3.eth.subscribe('pendingTransactions');
    // Subscribe to pending transactions
    subscription.subscribe((error, result) => {
        if (error)
            console.log(error);
    })
        .on('data', (txHash) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Get transaction details	
            if (prevTxHash === txHash)
                return;
            prevTxHash = txHash;
            const trx = yield web3Http.eth.getTransaction(txHash);
            if (trx === null)
                return;
            const valid = validateTransaction(trx);
            if (!valid.result)
                return;
            console.log('Found incoming Ether transaction from ' + trx.from + ' to ' + trx.to);
            ;
            console.log('Transaction value is: ' + trx.value);
            console.log('Transaction hash is: ' + trx.hash);
            confirmEtherTransaction(txHash, 1, valid.address);
        }
        catch (error) {
            console.log(error);
        }
    }));
}
function listenEvent() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Listening token transfer event');
        let wallet_addresses = yield dbManager.get_all_wallet_address();
        for (let i = 0; i < wallet_addresses.length; i++)
            wallets.push(wallet_addresses[i].address);
        console.log(wallets);
        watchEtherTransfers();
    });
}
listenEvent();
