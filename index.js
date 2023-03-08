// 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
const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// import { getFirestore } from "firebase/firestore";
// import { doc, setDoc } from "firebase/firestore";

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
            temperature: 0.9,
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
            temperature: 0.9,
            max_tokens: 50,
        });
        res.json({
            message: completion.data.choices[0].message,
        })
    } catch (error) {
        console.error(error);
    }
});

// app.post('/firebase', async (req, res) => {
//     try {
//         const { email, name, photo, uid } = req.body;
//         localStorage.setItem('email', email);
//         localStorage.setItem('name', name);
//         localStorage.setItem('photo', photo);
//         localStorage.setItem('uid', uid);
//         const db = getFirestore(app);
//             setDoc(doc(db, 'users', userUID), {
//                 email: userEmail,
//                 name: userDisplayName,
//                 photo: userPhoto,
//             }, { merge: true });
//         res.json({
//             message: 'Success',
//         })
//     } catch (error) {
//         console.error(error);
//     }
// });

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})