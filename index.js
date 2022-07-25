const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const path = require('path');
const { string } = require('i/lib/util');

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
            const title = formatTitle(info.videoDetails.title);
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

function formatTitle(title) {
    /**
    * @param {string}: title;
    * @Summary Função que formata o título do vídeo eliminando caracters especiais
    * @Description dado uma string retorna uma nova string após aplicação de regex.
    * @return {string} retorna uma nova string formatada
    * @since 1.0.0
    * @author: Ricardo Costa <ricardo_cas4@hotmail.com>
    */

    //Título de exemplo:
    //const title = `Thiaguinho - Deixa Acontecer / Brilho de Cristal / Toda Noite (Álbum ​Tardezinha) [Áudio Oficial]`;


    const newTitle = title.replace(/[​​/()-]/g, '');
    const semColchete = newTitle.replace('/[//"[["]]"\s]/g', '');
    const semEspeciais = semColchete.replace(/[\[\].!'@,><|://\\;&*()_+=]/g, "")
    const regexFinal = semEspeciais.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    return regexFinal;
}

app.get('/playlist', async (req, res) => {
    let { url } = req.query;
    songs = [];
    let objSongs = {
        id: '',
        title: '',
        shortUrl: '',
        url: '',
    };

    // const requestedPlaylistURL = req.query.url;
    const requestedPlaylistURL = 'https://www.youtube.com/watch?v=v4Za061pQac&list=PLinUYPRAHYropd0w2RDoCR1tiT52ebsOL';
    // const requestedPlaylistURL = 'PLinUYPRAHYropd0w2RDoCR1tiT52ebsOL';


    // console.log(await ytpl.validateID('requestedPlaylistURL', requestedPlaylistURL));
    const playlistID = await ytpl.getPlaylistID(requestedPlaylistURL);
    // console.log('playlistID', playlistID);
    const playlist = await ytpl(playlistID)
    // console.log('playlist', playlist);

    const channelID = playlist.author.channelID;
    // console.log('channelID', channelID);

    // You can now use the .items property of all result batches e.g.:
    // console.log('firstResultBatch', firstResultBatch.items);
    // console.log('secondResultBatch', secondResultBatch.items);
    // console.log('thirdResultBatch', thirdResultBatch.items);


    // console.log('requestedPlaylistURL:\n', requestedPlaylistURL);
    // console.log('videoID:\n', videoID);

    songs = playlist.items;
    let result = []
    let resultId = []
    let resultTitles = []
    for (let index = 0; index < songs.length; index++) {
        // console.log(songs[index].title);
        result.push(
            songs[index].id,
            songs[index].title,
            songs[index].shortUrl,
            songs[index].url,
            objSongs.id = songs[index].id,
            objSongs.title = songs[index].title,
            objSongs.shortUrl = songs[index].shortUrl,
            objSongs.url = songs[index].url,

        );
        resultId.push(
            songs[index].id,
        )
        resultTitles.push(
            songs[index].title,
        )
        // for (let index = 0; index < result.length; index++) {
        //     const element = result[index];
        //     objSongs.push(
        //     );

        // }
        // console.log(lista);
    }

    res.json({
        result,
        objSongs,
        resultId,
        resultTitles,
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
    console.log(`Server running on http://localhost:${port}`);
})
