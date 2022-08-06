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
    const titlesShortUrl = []

    const requestedPlaylistURL = 'https://www.youtube.com/watch?v=v4Za061pQac&list=PLinUYPRAHYropd0w2RDoCR1tiT52ebsOL';
    const playlistID = await ytpl.getPlaylistID(requestedPlaylistURL);
    const playlist = await ytpl(playlistID)

    playlist.items.forEach(song => {
        const { id, title, shortUrl } = song;
        titlesShortUrl.push({ id, title, shortUrl })
    });
    console.log(titlesShortUrl);

    res.json({
        titlesShortUrl
    });

    titlesShortUrl.forEach(data => {
        console.log(data.shortUrl);
        // download(data.shortUrl);
    });

});

/**
 * FIXME: Necessário arrumar essa função, pois está dependendo do 'res', 
 * FIXME: mas ele é o retorno da requisição http, precisa bolar um jeito de chamar a função no get do express
 * FIXME: exemplo:
 * 
 * app.get('/playlist', (download()) => {}
 * 
 * */
function download(url) {
    return ytdl.getBasicInfo(url)
        .then(info => {
            const title = formatTitle(info.videoDetails.title);
            res.header('Content-Disposition', `attachmentt; filename=${title}.mp4`);
            return ytdl(url, {
                quality: 'highest',
                format: 'mp4'
            }).pipe(res);
        }, console.log('Download concluído...'))
        .catch(error => {
            console.error(error);
        });
}

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
