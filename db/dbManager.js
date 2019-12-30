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
        type: sequelize_1.default.STRING(256),
        allowNull: false
    },
    tx_hash: {
        type: sequelize_1.default.STRING(256),
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
    timestamps: false,
    freezeTableName: true,
    tableName: 'wallet_event'
});
const walletList = sequelize.define('arcadex_wallet', {
    user_id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true
    },
    user_email: {
        type: sequelize_1.default.STRING(100),
        allowNull: true,
        defaultValue: null,
        unique: true
    },
    user_phone: {
        type: sequelize_1.default.STRING(45),
        allowNull: true,
        defaultValue: null
    },
    user_pass: {
        type: sequelize_1.default.STRING(255),
        allowNull: false,
        defaultValue: ''
    },
    user_status: {
        type: sequelize_1.default.INTEGER(11),
        allowNull: false,
        defaultValue: 0
    },
    user_firstname: {
        type: sequelize_1.default.TEXT
    },
    user_lastname: {
        type: sequelize_1.default.TEXT
    },
    idagent: {
        type: sequelize_1.default.INTEGER(11),
        allowNull: false
    },
    idagents_master: {
        type: sequelize_1.default.INTEGER(11),
        allowNull: false
    },
    sum_in: {
        type: sequelize_1.default.FLOAT,
        defaultValue: 0
    },
    sum_out: {
        type: sequelize_1.default.FLOAT,
        defaultValue: 0
    },
    user_balance: {
        type: sequelize_1.default.FLOAT,
        defaultValue: 0
    },
    user_blocked: {
        type: sequelize_1.default.INTEGER(11),
        defaultValue: 0
    },
    user_registered: {
        type: sequelize_1.default.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('NOW')
    },
    last_login_dt: {
        type: sequelize_1.default.DATE,
        allowNull: true,
        defaultValue: null
    },
    private_key: {
        type: sequelize_1.default.STRING(512),
        allowNull: true,
        defaultValue: null
    },
    address: {
        type: sequelize_1.default.STRING(256),
        allowNull: true,
        defaultValue: null
    },
    user_weeklybalance: {
        type: sequelize_1.default.DECIMAL(10, 0),
        defaultValue: 1400
    },
}, {
    timestamps: false,
    freezeTableName: true,
    tableName: 'arcadex_wallet'
});
walletList.sync();
walletEvent.sync();
function insert_wallet_event(wallet_address, txhash, completed) {
    return walletEvent.create({
        address: wallet_address,
        tx_hash: txhash,
        completed_on: null /*sequelize.fn('NOW')*/,
        completed: completed
    });
}
exports.insert_wallet_event = insert_wallet_event;
function get_all_wallet_address() {
    return walletList.findAll();
}
exports.get_all_wallet_address = get_all_wallet_address;
