require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const app = express();
const port = 3000;

const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
const deepSeekEndPoint = process.env.DEEPSEEK_ENDPOINT;
console.log(deepSeekApiKey, deepSeekEndPoint);
if (!deepSeekApiKey) {
    console.error("API key is not defined in .env file");
    process.exit(1);
}

app.use(cors());
app.use(express.json()); // to parse json request body

app.post('/api/chat/completions', async (req, res) => {
    try {
        const deepSeekEndpoint = deepSeekEndPoint;
        const requestBody = {
            ...req.body,
            stream: true,
            max_tokens: 4032
        };

        const agent = new https.Agent({
             keepAlive: true, // to keep the connection open
         });

       const response = await axios.post(deepSeekEndpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepSeekApiKey}`,
                'Accept': 'text/event-stream'

            },
            responseType: 'stream',
             httpsAgent: agent,
        });


      res.setHeader('Content-Type','text/event-stream');
         response.data.on('data', (chunk) => {
              res.write(chunk);
         });

        response.data.on('end', () => {
            res.end();
        });


        response.data.on('error', (err) => {
          console.error("Error from DeepSeek Stream:", err);
            res.status(500).send('Error in streaming from DeepSeek API');
         });

    } catch (error) {
         console.error("Error during DeepSeek API call:", error);
        res.status(500).send('Error processing request');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});