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
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            presence_penalty: 0.6,
            frequency_penalty: 0.5,
        });
        res.json({
            message: completion.data.choices[0].message,
        })
    } catch (error) {
        console.error(error);
    }
});

app.post('/summarize', async (req, res) => {
    const { messages } = req.body;
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.3,
            max_tokens: 50,
        });
        res.json({
            message: completion.data.choices[0].message,
        })
    } catch (error) {
        console.error(error);
    }
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})