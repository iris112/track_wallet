import Sequelize from 'sequelize';
const sequelize = new Sequelize('track_wallet', 'root', 'root', {
	dialect: 'mysql',
	host:'localhost',
});

const walletEvent = sequelize.define('wallet_event', {
	address: {
		type: Sequelize.STRING(256),
		allowNull: false
	},
	tx_hash: {
		type: Sequelize.STRING(256),
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
	timestamps: false,
	freezeTableName: true,
	tableName: 'wallet_event'
});

const walletList = sequelize.define('arcadex_wallet', {
	user_id: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	private_key: {
		type: Sequelize.STRING(512),
		allowNull: true,
		defaultValue: null
	},
	address: {
		type: Sequelize.STRING(256),
		allowNull: true,
		defaultValue: null
	}
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

function get_all_wallet_address() {
  return walletList.findAll();
}

export {
  	insert_wallet_event,
  	get_all_wallet_address
};