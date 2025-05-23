const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../src/server');

describe('Tests for server.js', () => {

  it('GET / endpoint should return "Goodbye, cruel world!"', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('Goodbye, cruel world!');
  });

  it('GET /test endpoint should return "Testing testing 123."', async () => {
    const res = await request(app).get('/test');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('Testing testing 123.');
  });
});

// Extend as needed down here