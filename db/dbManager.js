"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const sequelize = new sequelize_1.default('track_wallet', 'root', 'root', {
    dialect: 'mysql',
    host: 'localhost',
});
const walletEvent = sequelize.define('wallet_event', {
    address: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    tx_hash: {
        type: sequelize_1.default.STRING,
        allowNull: true,
        defaultValue: null
    },
    completed_on: {
        type: sequelize_1.default.DATE,
        allowNull: true,
        defaultValue: null
    },
    completed: {
        type: sequelize_1.default.TINYINT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
walletEvent.sync();
function insert_wallet_event(wallet_address, txhash, completed) {
    return walletEvent.create({
        address: wallet_address,
        tx_hash: txhash,
        completed_on: sequelize.fn('NOW'),
        completed: completed
    });
}
exports.insert_wallet_event = insert_wallet_event;
