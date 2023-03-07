// 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
const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
    const { messages } = req.body;
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.9,
        max_tokens: 300,
    });
    res.json({
        message: completion.data.choices[0].message,
    })
});
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})