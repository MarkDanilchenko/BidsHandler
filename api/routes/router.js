// --------------------------------------ROUTER_CONFIG
const router = require('express').Router();
const { check, header, body, param, query } = require('express-validator');

// --------------------------------------API_URLS "http://127.0.0.1:3000/api/v1/..."
// http://127.0.0.1:3000/api/v1/
router.route('/').get((req, res) => {
	res.status(200);
	res.render('main.html');
});
// http://127.0.0.1:3000/api/v1...
router.route('');

// --------------------------------------EXPORT
module.exports = { router };
