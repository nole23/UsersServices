const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');

var mongodbUri = "mongodb://nole23:novica23@ds135796.mlab.com:35796/twoway_user"
mongoose.connect(mongodbUri, {useNewUrlParser: true});
var options = { useNewUrlParser: true,
    server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(mongoSanitize());

var login = require('./services/login.js');
var user = require('./services/user.js');
var chat = require('./services/chat.js');
var publication = require('./services/publication.js');
var relationships = require('./services/relationships.js')
var media = require('./services/media.js');
var sync = require('./services/sync');
var geolocation = require('./services/geolocation');
var notification = require('./services/notification.js');

var port = process.env.PORT || 8080;
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");
    next();
});

app.use('/api/authentation', login);
app.use('/api/users', user);
app.use('/api/chats', chat);
app.use('/api/publication', publication);
app.use('/api/relationships', relationships);
app.use('/api/media', media);
app.use('/api/sync', sync);
app.use('/api/geolocation', geolocation);
app.use('/api/notification', notification);

var http = require('http').Server(app);
http.listen(port, () => console.log(`UserServer is start on port: ${ port }`))