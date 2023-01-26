const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

let portfolios = [
    {
        title: "Portfolio 1",
        image: "https://via.placeholder.com/150",
        "project-link": "https://example.com",
        "github-link": "https://github.com/example"
    },
    {
        title: "Portfolio 2",
        image: "https://via.placeholder.com/150",
        "project-link": "https://example.com",
        "github-link": "https://github.com/example"
    }
];

app.get('/portfolios', (req, res) => {
    res.json(portfolios);
});

app.post('/portfolios', (req, res) => {
    const newPortfolio = req.body;
    portfolios.push(newPortfolio);
    res.json(portfolios);
});

app.listen(2208, () => {
    console.log('Server started on port 2208');
});
