const request = require('supertest');
const nunjucks = require('nunjucks');
const { server } = require('../server.js');

describe('API routes', () => {
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
			.expect(nunjucks.render('main.html'))
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				done();
			});
	});
});
