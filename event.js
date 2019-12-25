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
const nodemailer_1 = __importDefault(require("nodemailer"));
const dbManager = __importStar(require("./db/dbManager"));
// import BLT from "bitcoin-live-transactions";
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const request_1 = __importDefault(require("request"));
const web3Http = new web3_1.default(new web3_1.default.providers.HttpProvider('https://ropsten.infura.io'));
var provider;
var web3 = undefined;
const insight_servers = "https://insight.bitpay.com/"; //  ("https://insight.bitpay.com/","https://www.localbitcoinschain.com/", "https://search.bitaccess.co/")
const insight_apis_servers = "https://insight.bitpay.com/api/"; // "https://insight.bitpay.com/api/", "https://www.localbitcoinschain.com/api/", "https://search.bitaccess.co/insight-api/"
var bitcoin;
function createProvider() {
    provider = new web3_1.default.providers.WebsocketProvider('wss://ropsten.infura.io/ws');
    if (web3 == undefined)
        web3 = new web3_1.default(provider);
    else
        web3.setProvider(provider);
    provider.on('error', error_callback);
    provider.on('end', end_callback);
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
function getTransaction(tx) {
    request_1.default(insight_apis_servers + 'tx/' + tx, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body);
            if (result.vin instanceof Array) {
                result.vin.forEach((item) => {
                    console.log(item.addr);
                });
            }
            else
                console.log(result.vin.addr);
        }
    });
}
function connectBitcoin() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Try Bitcoin connect");
        bitcoin = socket_io_client_1.default(insight_servers);
        bitcoin.on('connect', function () {
            console.log('Bitcoin connect success');
            bitcoin.emit('subscribe', 'inv');
        });
        bitcoin.on('tx', function (tx) {
            return __awaiter(this, void 0, void 0, function* () {
                if (process.env.SERVER_BTC_WALLET === '') {
                    console.log('>> Transaction detected:', tx);
                    try {
                        getTransaction(tx.txid);
                    }
                    catch (e) {
                        console.log("Get Transaction Error:", e);
                    }
                    return;
                }
                tx.vout.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    if (process.env.SERVER_BTC_WALLET in item) {
                        console.log('>> Transaction detected:', tx);
                        try {
                            getTransaction(tx.txid);
                        }
                        catch (e) {
                            console.log("Get Transaction Error:", e);
                        }
                        // process something
                    }
                }));
            });
        });
        bitcoin.on('disconnect', function (d) {
            console.log('Bitcoin disconnected');
        });
        bitcoin.on('error', function (e) {
            console.log('Bitcoin Error:', e);
        });
    });
}
createProvider();
connectBitcoin();
const minABI = [
    {
        anonymous: false,
        inputs: [{ indexed: true, name: "_from", type: "address" },
            { indexed: true, name: "_to", type: "address" },
            { indexed: false, name: "_value", type: "uint256" }],
        name: "Transfer",
        type: 'event'
    }
];
const WEI = 1000000000000000000;
const ethToWei = (amount) => new decimal_js_1.default(amount).times(WEI);
var transporter = undefined;
function validateTransaction(trx) {
    const toValid = trx.to !== null;
    if (!toValid)
        return false;
    const walletToValid = trx.to.toLowerCase() === process.env.WALLET_TO.toLowerCase();
    const walletFromValid = trx.from.toLowerCase() === process.env.WALLET_FROM.toLowerCase();
    const amountValid = ethToWei(process.env.AMOUNT).equals(trx.value);
    return toValid && walletToValid && walletFromValid && amountValid;
}
function send_email(email_address, balance) {
    if (transporter == undefined) {
        transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SERVICE_EMAIL,
                pass: process.env.SERVICE_EMAIL_PASS
            }
        });
    }
    var mailOptions = {
        from: process.env.SERVICE_EMAIL,
        to: email_address,
        subject: process.env.EMAIL_SUBJECT,
        text: balance + ' Tokens are transfered'
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
}
function getConfirmations(txHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const trx = yield web3Http.eth.getTransaction(txHash);
            const currentBlock = yield web3.eth.getBlockNumber();
            return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber;
        }
        catch (error) {
            console.log(error);
        }
    });
}
function confirmEtherTransaction(txHash, confirmations = 10) {
    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        // Get current number of confirmations and compare it with sought-for value
        const trxConfirmations = yield getConfirmations(txHash);
        console.log('Transaction with hash ' + txHash + ' has ' + trxConfirmations + ' confirmation(s)');
        if (trxConfirmations >= confirmations) {
            console.log('Transaction with hash ' + txHash + ' has been successfully confirmed');
            return;
        }
        return confirmEtherTransaction(txHash, confirmations);
    }), 30 * 1000);
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
            const trx = yield web3Http.eth.getTransaction(txHash);
            // if (!validateTransaction(trx))
            // 	return;
            console.log('Found incoming Ether transaction from ' + trx.from + ' to ' + trx.to);
            ;
            console.log('Transaction value is: ' + trx.value);
            console.log('Transaction hash is: ' + trx.hash);
            console.log('Transaction data is: ' + trx.input);
        }
        catch (error) {
            console.log(error);
        }
    }));
}
function watchTokenTransfers() {
    const tokenContract = new web3.eth.Contract(minABI, process.env.TOKEN_ADDR);
    const options = {
        // filter: {
        // 	_to:    process.env.SERVER_WALLET,
        // },
        fromBlock: 'latest'
    };
    tokenContract.events.Transfer(options, (error, event) => __awaiter(this, void 0, void 0, function* () {
        if (error) {
            console.log(error);
            return;
        }
        if (event.returnValues._to.toLowerCase() !== process.env.SERVER_WALLET.toLowerCase())
            return;
        console.log('Found incoming token transaction from ' + event.returnValues._from);
        console.log('Transaction value is: ' + event.returnValues._value);
        console.log('Transaction hash is: ' + event.transactionHash + '\n');
        try {
            var userWallet = yield dbManager.get_user_wallet(event.returnValues._from.toLowerCase());
            if (userWallet == undefined)
                console.log('There is no user wallet on database');
            else
                send_email(userWallet.email_address, event.returnValues._value / WEI);
        }
        catch (err) {
            console.log(err);
        }
    }));
}
function listenEvent() {
    // console.log('Listening token transfer event');
    // watchTokenTransfers();
}
exports.listenEvent = listenEvent;
