const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

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
    const { url } = req.query;

    ytdl.getBasicInfo(url)
        .then(info => {
            const title = info.videoDetails.title;
            res.header('Content-Disposition', `attachmentt; filename=${title}.mp4`);
            return ytdl(url, {
                quality: 'highest',
                format: 'mp4'
            }).pipe(res);
        })
        .catch(error => {
            console.error(error);
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
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
});

app.listen(port, () => {
    console.log(`:::::::::::::::::::::::::::::::::::::::::::`);
    console.log(`  Server running on http://localhost:${port} `);
    console.log(`:::::::::::::::::::::::::::::::::::::::::::`);
})
