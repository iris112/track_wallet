import Sequelize from 'sequelize';
const sequelize = new Sequelize('dev', 'postgres', 'postgres', {
	dialect: 'postgres',
	host:'postgres',
	// host:'localhost',
});

const UserWallet = sequelize.define('userwallet', {
	wallet_address: Sequelize.STRING,
	email_address: Sequelize.STRING,
}, 
{
	createdAt: 'created_at',
	updatedAt: 'updated_at',
});

UserWallet.sync();

function insert_user_wallet(wallet_address, email_address) {

	return UserWallet.create({
		wallet_address: wallet_address,
		email_address: email_address,
	});
}

function get_user_wallet(wallet_address) {
	return UserWallet.findOne({
		where: {
			wallet_address: wallet_address,
		},
		order: [['created_at', 'DESC']]
	});
}

function update_user_wallet(id, email_address) {
	return UserWallet.update({
		email_address: email_address,
	}, 
	{
		where: {
			id: id,
		}
	});
}

export {
  	UserWallet,
  	insert_user_wallet,
  	get_user_wallet,
  	update_user_wallet
};