// --------------------------------------DB_ORM_CONFIG
const Sequelize = require('sequelize');
const { sequelize } = require('./db_connection.js');

// --------------------------------------MODELS
const User = sequelize.define('user', {
	username: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
		validate: {
			is: /^[a-zA-Z0-9_\.\-]+$/,
			msg: 'The username can only contain letters, numbers, underscores, dots and dashes.',
		},
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
		validate: {
			isEmail: true,
			msg: 'The email must be a valid email address.',
		},
	},
	first_name: {
		type: Sequelize.STRING,
		allowNull: true,
		unique: false,
		validate: {
			is: /^[a-zA-Z]{2,}$/,
			msg: 'The first name can only contain letters and must be at least 2 characters long.',
		},
	},
	last_name: {
		type: Sequelize.STRING,
		allowNull: true,
		unique: false,
		validate: {
			is: /^[a-zA-Z]{2,}$/,
			msg: 'The last name can only contain letters and must be at least 2 characters long.',
		},
	},
	avatar: {
		type: Sequelize.STRING,
		allowNull: true,
		unique: false,
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: false,
	},
	created_at: {
		type: Sequelize.DATE,
		allowNull: false,
		unique: false,
		defaultValue: Sequelize.NOW,
		validate: {
			isDate: true,
			msg: 'Invalid date format.',
		},
	},
});
const UserRole = sequelize.define('user_role', {
	role: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
		defaultValue: 'user',
		validate: {
			isIn: [['admin', 'user']],
			msg: 'Invalid role. Only "admin" and "user" are allowed.',
		},
	},
});
const UserRequest = sequelize.define('user_request', {
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: false,
		defaultValue: 'active',
		validate: {
			isIn: [['active', 'resolved']],
			msg: 'Invalid status. Only "active" and "resolved" are allowed.',
		},
	},
	message: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: false,
		validate: {
			notEmpty: true,
			len: [1, 1000],
			msg: 'Text message should be between 1 and 1000 characters.',
		},
	},
	comment: {
		type: Sequelize.TEXT,
		allowNull: true,
		unique: false,
		defaultValue: null,
		validate: {
			checkStatus: (value) => {
				if (this.status === 'resolved' && !value) {
					throw new Error('Comment is required when status is "resolved"');
				}
			},
		},
	},
	created_at: {
		type: Sequelize.DATE,
		allowNull: false,
		unique: false,
		defaultValue: Sequelize.NOW,
		validate: {
			isDate: true,
			msg: 'Invalid date format.',
		},
	},
	updated_at: {
		type: Sequelize.DATE,
		allowNull: true,
		unique: false,
		defaultValue: null,
		validate: {
			isDate: true,
			msg: 'Invalid date format.',
		},
	},
});
const TokenBlacklist = sequelize.define(
	'token_blacklist',
	{
		jwt_token: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		freezeTableName: true,
	}
);

// --------------------------------------MODELS_RELATIONS
UserRole.hasMany(User, {
	onDelete: 'cascade',
	foreignKey: {
		allowNull: false,
		name: 'user_role_id',
	},
});
User.hasMany(UserRequest, {
	onDelete: 'cascade',
	foreignKey: {
		allowNull: false,
		name: 'created_by',
	},
});
User.hasMany(UserRequest, {
	onDelete: 'cascade',
	foreignKey: {
		allowNull: true,
		name: 'resolved_by',
	},
});

// --------------------------------------EXPORT
module.exports = { sequelize, UserRole, User, UserRequest, TokenBlacklist };
