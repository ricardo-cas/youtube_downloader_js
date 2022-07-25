const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const path = require('path');

require('dotenv').config();

const port = process.env.PORT || 4242;
const morganEnv = process.env.MORGAN_ENV === 'production' ? 'tiny' : 'dev';

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan(morganEnv));

// app.use(express.static('./public'));

// TODO: link da playlist: https://www.youtube.com/watch?v=v4Za061pQac&list=PLinUYPRAHYropd0w2RDoCR1tiT52ebsOL&index=31&ab_channel=NoCopyrightSounds

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
        }, console.log('Download concluído ;)'))
        .catch(error => {
            console.error(error);
        });
});

app.post('/youtube', (req, res) => {
    const url = req.body.query;
    console.log(url);
    ytdl.getBasicInfo(url)
        .then(info => {
            const title = info.videoDetails.title;
            res.header('Content-Disposition', `attachmentt; filename=${title}.mp4`);
            ytdl(url, {
                quality: 'highest',
                format: 'mp4'
            }).pipe(res);
        }, console.log('Download concluído ;)'))
        .catch(error => {
            console.error(error);
        });
});

app.get('/playlist', async (req, res) => {
    let { url } = req.query;
    let songs = [];
    // const requestedPlaylistURL = req.query.url;
    const requestedPlaylistURL = 'https://www.youtube.com/watch?v=v4Za061pQac&list=PLinUYPRAHYropd0w2RDoCR1tiT52ebsOL';
    // const requestedPlaylistURL = 'PLinUYPRAHYropd0w2RDoCR1tiT52ebsOL';


    // console.log(await ytpl.validateID('requestedPlaylistURL', requestedPlaylistURL));
    const playlistID = await ytpl.getPlaylistID(requestedPlaylistURL);
    // console.log('playlistID', playlistID);
    const playlist = await ytpl(playlistID)
    // console.log('playlist', playlist);

    const channelID = playlist.author.channelID;
    console.log('channelID', channelID);

    // You can now use the .items property of all result batches e.g.:
    // console.log('firstResultBatch', firstResultBatch.items);
    // console.log('secondResultBatch', secondResultBatch.items);
    // console.log('thirdResultBatch', thirdResultBatch.items);


    // console.log('requestedPlaylistURL:\n', requestedPlaylistURL);
    // console.log('videoID:\n', videoID);
    res.json({
        Autor: playlist.author,
        Description: playlist.description,
        channelID: channelID,
        Playlist: playlist
    });
    console.log('playlist items', playlist.items);
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
    console.log(`Server running on http://localhost:${port}`);
})
