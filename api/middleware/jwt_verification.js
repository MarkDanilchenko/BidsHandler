// --------------------------------------JWT_VERIFICATION
const JWT = require('jsonwebtoken');
const { jwt_config } = require('../services/jwt_config.js');

const notAuthenticated = (res) => {
	res.status(401);
	res.json({
		message: 'Not authenticated! Please, verify your credentials and try again.',
	});
	res.end();
	return;
};

const verifyToken = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		if (!token) {
			notAuthenticated(res);
		}
		JWT.verify(token, jwt_config.jwt_secretKey, (err, decoded) => {
			if (err) {
				notAuthenticated(res);
			}
			next();
		});
	} catch (error) {
		notAuthenticated(res);
	}
};

// --------------------------------------EXPORT
module.exports = { verifyToken };
