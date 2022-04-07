const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const ytdl = require('ytdl-core');

require('dotenv').config();

const port = process.env.PORT || 4242;
const morganEnv = process.env.MORGAN_ENV === 'production' ? 'tiny' : 'dev';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan(morganEnv));

app.get('/', (req, res) => {
    const { url } = req.query;
    res.header('Content-Disposition', 'attachmentt; filename="video_baixado.mp4"');
    return ytdl(url).pipe(res);
});

app.get('/video', (req, res) => {
    res.json({
        message: 'hello world from main route',
        statusCode: res.statusCode,
    });
});

app.get('api/video/info', async (req, res, error, next) => {
    let { url } = req.query;
    const requested_url = req.query.url;
    const videoID = requested_url.split('v=')[1]; // retirando o ID do video Requisitado
    console.log('requested_ur:l\n', requested_url);
    console.log('videoID:\n', videoID);
    res.json({
        url: requested_url,
        videoID: videoID,
    });
});

// Error Handler
app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🦄' : error.stack,
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})
