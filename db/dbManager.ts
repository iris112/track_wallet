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
	user_email: {
		type: Sequelize.STRING(100),
		allowNull: true,
		defaultValue: null,
		unique: true
	},
	user_phone: {
		type: Sequelize.STRING(45),
		allowNull: true,
		defaultValue: null
	},
	user_pass: {
		type: Sequelize.STRING(255),
		allowNull: false,
		defaultValue: ''
	},
	user_status: {
		type: Sequelize.INTEGER(11),
		allowNull: false,
		defaultValue: 0
	},
	user_firstname: {
		type: Sequelize.TEXT
	},
	user_lastname: {
		type: Sequelize.TEXT
	},
	idagent: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	},
	idagents_master: {
		type: Sequelize.INTEGER(11),
		allowNull: false
	},
	sum_in: {
		type: Sequelize.FLOAT,
		defaultValue: 0
	},
	sum_out: {
		type: Sequelize.FLOAT,
		defaultValue: 0
	},
	user_balance: {
		type: Sequelize.FLOAT,
		defaultValue: 0
	},
	user_blocked: {
		type: Sequelize.INTEGER(11),
		defaultValue: 0
	},
	user_registered: {
		type: Sequelize.DATE,
		allowNull: false,
		defaultValue: sequelize.fn('NOW')
	},
	last_login_dt: {
		type: Sequelize.DATE,
		allowNull: true,
		defaultValue: null
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
	},
	user_weeklybalance: {
		type: Sequelize.DECIMAL(10, 0),
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

function get_all_wallet_address() {
  return walletList.findAll();
}

export {
  	insert_wallet_event,
  	get_all_wallet_address
};