// TODO delete
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const PORT = process.env.PORT || 4000;

// // testing products for FE, delete this later
// const test_products = require('../static/products.json');

// app.use(cors());

// app.get('/', (req, res) => {
//     try {
//         res.status(200).send('Goodbye, cruel world!');
//     } catch(error) {
//         res.status(500).send('Error: ' + error.message);
//     }
// });

// app.get('/test', (req, res) => {
//     try {
//         res.status(200).send('Testing testing 123.');
//     } catch(error) {
//         res.status(500).send('Error: ' + error.message);
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server listening on port: ${PORT}`);
// });

// app.get('/test_products', (req, res) => {
//     try {
//         res.status(200).json(test_products);
//     } catch(error) {
//         res.status(500).send('Error: ' + error.message);
//     }
// });

// module.exports = app;