// --------------------------------------SERVER_CONFIG
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

// --------------------------------------COMMON_MIDDLEWARE
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
// server.use((req, res, next) => {
// 	res.setHeader('Content-Type', 'multipart/form-data');
// 	next();
// });
server.use(express.static(`${__dirname}/node_modules`));
server.use(express.static(`${__dirname}/assets`));

// --------------------------------------ROUTES
server.use('/api/v1', APIRouter);

// http://127.0.0.1:3000/ GREETING_ROUTE
server.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.render('index.html');
});

// --------------------------------------EXPORT
module.exports = { server };
