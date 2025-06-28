// TODO move all tests into src/tests instead of ./tests

// const request = require('supertest');
// const chai = require('chai');
// const expect = chai.expect;
// const app = require('../src/server');
// const { postChat } = require('../src/routes/chatbot');
// const AIService = require('../src/services/AIService');
// const ProductService = require('../src/services/ProductService');

// describe('Tests for server.js', () => {

//   it('GET / endpoint should return "Goodbye, cruel world!"', async () => {
//     const res = await request(app).get('/');
//     expect(res.status).to.equal(200);
//     expect(res.text).to.equal('Goodbye, cruel world!');
//   });

//   it('GET /test endpoint should return "Testing testing 123."', async () => {
//     const res = await request(app).get('/test');
//     expect(res.status).to.equal(200);
//     expect(res.text).to.equal('Testing testing 123.');
//   });
// });


// // Extend as needed down here
// describe('Chatbot tests', async () => {
//   let req, res, next, aiStub, productStub;

//   /** Create mock request/response objects */
//   beforeEach(() => {    
//     req = {
//       body: {}
//     };
//     res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.stub()
//     };
//     next = sinon.stub();
    
//     /** Create stubs for services */
//     aiStub = sinon.stub(AIService, 'chatCompletionGithubModel');
//     productStub = sinon.stub(ProductService, 'searchProducts');
//   });

//   /** Restore original implementations */
//   afterEach(() => {
//     sinon.restore();
//   });

//   describe('/api/chatbot POST', async () => {

//     it('returns 400 code for missing message', async () => {
//       req.body = { message: "" };
//       await postChat(req, res, next);
      
//       expect(res.status).to.have.been.calledWith(400);
//       expect(res.json).to.have.been.calledWith({ error: 'Message is required' });
//     });

//     it('returns 400 code for wrong data type', async () => {
//       req.body = { message: 0 };
//       await postChat(req, res, next);
      
//       expect(res.status).to.have.been.calledWith(400);
//       expect(res.json).to.have.been.calledWith({ error: 'Message must be a string' });
//     });

//     it('returns 500 code for failed chatbot API call', async () => {
//       req.body = { message: "hi" };
//       aiStub.rejects(new Error('AI service failed'));
      
//       await postChat(req, res, next);
      
//       expect(res.status).to.have.been.calledWith(500);
//       expect(res.json).to.have.been.calledWith({ error: "Unable to call chatbot API" });
//     });

//     it('returns 500 code for incomplete chatbot response', async () => {
//       req.body = { message: "give me an incomplete response" };
//       aiStub.resolves(null);
      
//       await postChat(req, res, next);
      
//       expect(res.status).to.have.been.calledWith(500);
//       expect(res.json).to.have.been.calledWith({ error: "AI unable to respond" });
//     });

//     it('returns 200 code for working chatbot API without products', async () => {
//       req.body = { message: "test message" };
//       aiStub.resolves({
//         chatbotMessage: "Here's your response",
//         productRequested: false
//       });
      
//       await postChat(req, res, next);
      
//       expect(res.status).to.have.been.calledWith(200);
//       expect(res.json).to.have.been.calledWith({
//         chatbotMessage: "Here's your response",
//         productData: null
//       });
//     });

//     it('returns 200 code for working chatbot API and failed product API', async () => {
//       req.body = { message: "I want a macbook" };
//       aiStub.resolves({
//         chatbotMessage: "Here are some MacBooks",
//         productRequested: true,
//         productQuery: "MacBook"
//       });
//       productStub.rejects(new Error('Product service failed'));
      
//       await postChat(req, res, next);
      
//       expect(res.status).to.have.been.calledWith(200);
//       expect(res.json).to.have.been.calledWith({
//         chatbotMessage: "Here are some MacBooks",
//         productData: []
//       });
//     });

//     it('returns 200 code for working chatbot API and product API', async () => {
//       req.body = { message: "I want a macbook" };
//       aiStub.resolves({
//         chatbotMessage: "Here are some MacBooks",
//         productRequested: true,
//         productQuery: "MacBook"
//       });
      
//       const mockProducts = [{
//         product_id: "123",
//         title: "MacBook Pro",
//         thumbnail: "image.jpg",
//         extracted_price: 1299,
//         seller_details: { direct_link: "http://example.com" },
//         rating: 4.5,
//         reviews: 120
//       }];
      
//       productStub.resolves(mockProducts);
      
//       await postChat(req, res, next);
      
//       expect(res.status).to.have.been.calledWith(200);
//       expect(res.json).to.have.been.calledWith({
//         chatbotMessage: "Here are some MacBooks",
//         productData: [{
//           id: "123",
//           source: "",
//           title: "MacBook Pro",
//           image: "image.jpg",
//           price: 1299,
//           url: "http://example.com",
//           rating: 4.5,
//           reviews: 120
//         }]
//       });
//     });
//   })
// })

