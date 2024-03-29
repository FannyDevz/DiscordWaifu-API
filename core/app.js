const express = require('express');
const cookie = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const { auth } = require('../middlewares/auth');
const error = require('../middlewares/error');

const config = require('../config.json').app;

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ credentials: true, origin: config.origin }));
app.use(cookie());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auth());

app.use((req, res, next) => ((req.data = {}), next()));
app.use('/', require('../routes/main'));
app.use('/auth', require('../routes/auth'));
app.use('/profile', require('../routes/profile'));
app.use('/users', require('../routes/user'));
app.use('/pictures', require('../routes/picture'));
app.use('/albums', require('../routes/album'));
app.use('/tags', require('../routes/tag'));

app.use(error.notFound);
app.use(error.handle);

module.exports = data => {
    app.listen(port, () => {
        console.log('App running at port', port);

        app.data = data;
    });
};
