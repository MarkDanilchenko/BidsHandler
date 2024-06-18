// --------------------------------------DB_CONFIG
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const name_db = process.env.DB_NAME;
const user_db = process.env.DB_USERNAME;
const pass_db = process.env.DB_PASSWORD;
const sequelize = new Sequelize(name_db, user_db, pass_db, {
	dialect: 'postgres',
	host: process.env.DB_HOST || '127.0.0.1',
	// Database inner port = 5432 by default and must be changed anyway.
	port: 5432,
	define: {
		timestamps: false,
	},
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	logging: false,
});

// --------------------------------------EXPORT
module.exports = { sequelize };
