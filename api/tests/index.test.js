const path = require('path');
const fs = require('fs');
const request = require('supertest');
const nunjucks = require('nunjucks');
const { server } = require('../server.js');
const dotenv = require('dotenv');
dotenv.config({ path: `${path.relative(__dirname, '.env')}` });

describe('API common routes', () => {
	it('Requests with all methods on "http://127.0.0.1:3000" redirects to "http://127.0.0.1:3000/api/v1"', (done) => {
		request(server)
			.get('/')
			.expect(302)
			.expect('Location', '/api/v1')
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				done();
			});
	});
	it('Greeting API page with GET method on "http://127.0.0.1:3000/api/v1/"', (done) => {
		request(server)
			.get('/api/v1/')
			.expect(200)
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(nunjucks.render('main.html', { server_host: `${process.env.SERVER_HOST ?? '127.0.0.1'}` }))
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				done();
			});
	});
	it('Not found page with GET method on "http://127.0.0.1:3000/smth"', (done) => {
		request(server)
			.get('/smth')
			.expect(404)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				done();
			});
	});
	it('Not found page with GET method on "http://127.0.0.1:3000/api/v1/smth"', (done) => {
		request(server)
			.get('/api/v1/smth')
			.expect(404)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				done();
			});
	});
});

describe('API docs routes', () => {
	it('Swagger docummentation service with GET method on "http://127.0.0.1:3000/api/v1/docs"', (done) => {
		request(server)
			.get('/api/v1/docs/')
			.expect(200)
			.expect('Content-Type', 'text/html; charset=utf-8')
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				done();
			});
	});
});

describe('API auth routes', () => {
	it('User\'s successful registration with POST method on "http://127.0.0.1:3000/api/v1/signup"', (done) => {
		done();
	});
});
