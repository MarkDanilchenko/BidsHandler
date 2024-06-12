// --------------------------------------SERVER_CONFIG
const fs = require('fs');
const express = require('express');
const server = express();
const cors = require('cors');
const corsOptions = {
	origin: '*',
};
server.use(cors(corsOptions));
const { router: APIRouter } = require('./routes/router.js');
const nunjucks = require('nunjucks');
nunjucks.configure('views', {
	autoescape: true,
	express: server,
	tags: {
		blockStart: '{%',
		blockEnd: '%}',
		variableStart: '{{',
		variableEnd: '}}',
		commentStart: '{#',
		commentEnd: '#}',
	},
	views: `${__dirname}/views`,
});

// --------------------------------------SWAGGER_CONFIG
const swaggerUI = require('swagger-ui-express');
const swaggerDocumentation = JSON.parse(fs.readFileSync('./docs/swagger/swagger-output.json'));
server.use(`/api/v1/docs`, swaggerUI.serve, swaggerUI.setup(swaggerDocumentation));

// --------------------------------------COMMON_MIDDLEWARE
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
// server.use((req, res, next) => {
// 	res.setHeader('Content-Type', 'multipart/form-data');
// 	next();
// });
server.use('/api/v1', express.static(`${__dirname}/node_modules`));
server.use('/api/v1', express.static(`${__dirname}/assets`));

// --------------------------------------ROUTES
server.use('/api/v1', APIRouter);

// http://127.0.0.1:3000/ - GREETING_ROUTE (redirects to /api/v1/)
server.all('/', async (req, res) => {
	res.status(302).redirect('/api/v1');
});

// http://127.0.0.1:3000/* - NOT_FOUND
server.all('*', async (req, res) => {
	res.status(404);
	res.json({
		message: 'Resource Not found. Please, check the URL and try again.',
	});
	res.end();
});

// --------------------------------------EXPORT
module.exports = { server };
