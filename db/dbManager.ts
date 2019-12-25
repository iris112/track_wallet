import Sequelize from 'sequelize';
const sequelize = new Sequelize('track_wallet', 'root', 'root', {
	dialect: 'mysql',
	host:'localhost',
});

const walletEvent = sequelize.define('wallet_event', {
	address: {
		type: Sequelize.STRING,
		allowNull: false
	},
	tx_hash: {
		type: Sequelize.STRING,
		allowNull: true,
		defaultValue: null
	},
	completed_on: {
		type: Sequelize.DATE,
		allowNull: true,
		defaultValue: null
	},
	completed: {
		type: Sequelize.TINYINT,
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

export {
  	insert_wallet_event
};