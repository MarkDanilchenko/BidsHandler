// --------------------------------------DB_ORM_CONFIG
const Sequelize = require('sequelize');
const { sequelize } = require('./db_connection.js');

// --------------------------------------MODELS

// const User = sequelize.define('user', {});
const UserRole = sequelize.define('user_role', {
	role: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
		defaultValue: 'user',
		validate: {
			isIn: [['admin', 'user']],
		},
	},
});
// const UserRequest = sequelize.define('user_request', {});

// --------------------------------------EXPORT
module.exports = { sequelize, UserRole };
