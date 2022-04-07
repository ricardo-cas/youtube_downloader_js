const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

require('dotenv').config();

const port = process.env.PORT || 4242;
const morganEnv = process.env.MORGAN_ENV === 'production' ? 'tiny' : 'dev';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan(morganEnv));

app.get('/', (req, res) => {
    res.json({
        message: 'hello world from main route',
        statusCode: res.statusCode,
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
})
