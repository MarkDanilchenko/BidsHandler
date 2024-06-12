// --------------------------------------ROUTER_CONFIG
const router = require('express').Router();
const { check, header, body, param, query } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

// --------------------------------------API_URLS "http://127.0.0.1:3000/api/v1/..."
// http://127.0.0.1:3000/api/v1/ - GREETING_ROUTE
router.route('/').get(async (req, res) => {
	// #swagger.tags = ['Greeting']
	// #swagger.summary = 'Greeting HTML-page end-point.'
	/* 
	#swagger.description = 'This is a base greeting HTML-page of the API,
	where you can learn more about it purpose and get links to the documentation and source code on GitHub.com'
	*/
	// #swagger.operationId = 'greeting'
	/*
	#swagger.responses[200] = {
		description: 'OK',
		content: {
			"text/html":{
				schema: {
					type: 'string',
					format: 'html',
					example: '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello, world!</h1>\n</body>\n</html>',
					description: 'Greeting HTML-page',
				}
			}
		}
	}
	*/
	res.status(200);
	res.render('main.html', { server_host: `${process.env.SERVER_HOST ?? '127.0.0.1'}` });
});

// http://127.0.0.1:3000/api/v1/* - NOT_FOUND
router.route('*').get(async (req, res) => {
	res.status(404);
	res.json({
		message: 'Resource Not found. Please, check the URL and try again.',
	});
	res.end();
});

// --------------------------------------EXPORT
module.exports = { router };
