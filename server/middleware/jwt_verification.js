// --------------------------------------JWT_VERIFICATION
const JWT = require('jsonwebtoken');
const { jwt_config } = require('../services/jwt_config.js');

const verifyToken = (req, res, next) => {
	const token = req.headers.authorization.split(' ')[1];
	JWT.verify(token, jwt_config.jwt_secretKey, (err, decoded) => {
		if (err) {
			res.status(401);
			res.json({
				message: 'Not authenticated! Please, verify your credentials and try again.',
			});
			res.end();
		} else {
			next();
		}
	});
};

// --------------------------------------EXPORT
module.exports = { verifyToken };
