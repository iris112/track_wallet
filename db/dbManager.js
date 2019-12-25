"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const sequelize = new sequelize_1.default('dev', 'postgres', 'postgres', {
    dialect: 'postgres',
    host: 'postgres',
});
const UserWallet = sequelize.define('userwallet', {
    wallet_address: sequelize_1.default.STRING,
    email_address: sequelize_1.default.STRING,
}, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});
exports.UserWallet = UserWallet;
UserWallet.sync();
function insert_user_wallet(wallet_address, email_address) {
    return UserWallet.create({
        wallet_address: wallet_address,
        email_address: email_address,
    });
}
exports.insert_user_wallet = insert_user_wallet;
function get_user_wallet(wallet_address) {
    return UserWallet.findOne({
        where: {
            wallet_address: wallet_address,
        },
        order: [['created_at', 'DESC']]
    });
}
exports.get_user_wallet = get_user_wallet;
function update_user_wallet(id, email_address) {
    return UserWallet.update({
        email_address: email_address,
    }, {
        where: {
            id: id,
        }
    });
}
exports.update_user_wallet = update_user_wallet;
