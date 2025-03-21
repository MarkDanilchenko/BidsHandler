// --------------------------------------JWT_CONFIG
const jwt_config = {
	jwt_secretKey:
		Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
	jwt_expiresInAccess: '1m',
	jwt_expiresInRefresh: '2d',
};

// --------------------------------------EXPORT
module.exports = { jwt_config };
