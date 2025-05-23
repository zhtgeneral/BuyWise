const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Goodbye, cruel world!');
});

app.get('/test', (req, res) => {
    res.send('Testing testing 123.');
});

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;