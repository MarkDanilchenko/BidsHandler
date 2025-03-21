// --------------------------------------ROUTES_VALIDATION
const { validationResult } = require('express-validator');
const fs = require('fs');

const routesDataValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Validate if there is a file in the request and delete it if there is one.
		req.files && req.files[0] ? fs.unlinkSync(req.files[0].path) : null;
		res.status(422);
		res.json({ message: errors.array() });
		res.end();
	} else {
		next();
	}
};

// --------------------------------------EXPORT
module.exports = { routesDataValidation };
