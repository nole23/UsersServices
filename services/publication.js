const express = require('express');
const router = express.Router();

var Auth = require('../meddlewares/auth.js');
const Publication = require('../models/publication.js');
const UserImpl = require('../function/userImpl.js');
const relationshipImpl = require('../serviceImpl/relationshipImpl.js');
const publicationImpl = require('../serviceImpl/publicationImpl.js');

router.use('/', Auth.isLogged);

router
    /**
     * First router
     */
    .get('/', function(req, res) {
        return res.status(200).send('Router is life')
    })
    /**
     * Get all publication
     * First for all user, second get all my publication
     * return 200 - null
     * return 200 - list publication
     * return 404 - server not found 
     */
    .get('/:id', async function(req, res) {
        var user_id = req.params.id;
        var me = res.locals.currUser;
        var page = JSON.parse(req.query.page);
        var numberOfData = me.otherInformation.options.numberOfData;
        
        var listPublication = null;
        if (user_id.toString() == me._id.toString()) {
            listPublication = await publicationImpl.getAllPublication(me, numberOfData, page);
        } else {
            var user = await UserImpl.findUserById(user_id);
            if (user == null) {
                listPublication = [];
            } else {
                var index = me.friends.listFriends.indexOf(user._id.toString());
                listPublication = await publicationImpl.getAllPublicationById(user, me._id, numberOfData, page, index);
            }
        }
        return res.status(200).send({publication: listPublication.publication, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * 
     */
    .get('/image/:id', async function(req, res) {
        var id = req.params.id;
        var me = res.locals.currUser;

        var publicOfPicture = await publicationImpl.getPublicByPicture(id, me);

        return res.status(publicOfPicture.status).send({publication: publicOfPicture.message, socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * Add comment in publication
     */
    .post('/', async function(req, res) {
        var item = req.body['item'];
        var object = req.body['object'];
        var me = res.locals.currUser;

        isSave = await publicationImpl.addComment(item, object, me);
        return res.status(isSave.status).send({message: isSave.message, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * Set new gps location
     */
    .post('/location', async function(req, res) {
        var body = req.body;
        var me = res.locals;
        
        var newaddress = {
            corrdinate: {
                latitude: body.address.lat,
                longitude: body.address.lon,
                accuracy: body.address.osm_id
            },
            address: {
                road: body.address.address.road,
                neighbourhood: body.address.address.neighbourhood,
                city: body.address.address.city,
                country: body.address.address.country
            }
        }

        var data = await publicationImpl.savePublicaton(
            me._id,
            body.message,
            null,
            new Date(),
            null,
            null,
            null,
            newaddress,
            body.friends,
            'location',
            null
        );
        
        var odg = {
            _id: data._id,
            user_id: me._id,
            text: body.message,
            image: null,
            datePublish: new Date(),
            likes: [],
            comments: [],
            showPublication: {
                removeStatus: false
            },
            location: newaddress,
            friends: body.friends
        }
        return res.status(200).send({message: odg, socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * 
     */
    .post('/text', async function(req, res) {
        var body = req.body;
        var me = res.locals;

        var data = await publicationImpl.savePublicaton(
            me._id,
            body['message'],
            null,
            new Date(),
            null,
            null,
            null,
            null,
            null,
            'text',
            null
        );

        return res.status(200).send({message: data, socket: 'SOCKET_NULL_POINT'});
    })
    .post('/add-publication', async function(req, res) {
        var body = req.body
        var me = res.locals.currUser;

        var data = await publicationImpl.savePublicaton(
            me._id,
            body['text'],
            body['link'],
            new Date(),
            null,
            null,
            null,
            null,
            null,
            body['type'],
            null
        )

        if (body['type'].toString() == 'imageProfil') {
            UserImpl.setProfilImage(me, body['link']);
        }
        return res.status(200).send({message: data, socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * Like publicaton
     */
    .put('/like', async function(req, res) {
        var user_id = req.body['user'];
        var publication_id = req.body['publication'];
        var me = res.locals.currUser;

        var isSave = await publicationImpl.like(user_id, publication_id, me);
        return res.status(isSave.status).send({message: isSave.message, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * Remove publicaton
     */
    .put('/remove', async function(req, res) {
        var user_id = req.body['user'];
        var publication_id = req.body['publication'];
        var me = res.locals.currUser;

        var isSave = await publicationImpl.disLike(user_id, publication_id, me);
        return res.status(isSave.status).send({publication: isSave.message, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * Set status from publication
     */
    .put('/status/:type', function(req, res) {
        var me = res.locals.currUser;
        var type = req.params.type;
        var item = req.body;

        if (me._id.toString() == item.user_id._id.toString()) {

            if (type === 'friends') {
                item.showPublication.removeStatus = false;
                item.showPublication.justFriends = true;
            } else if (type === 'show') {
                item.showPublication.removeStatus = false;
                item.showPublication.justFriends = false;
            } else if (type === 'hide') {
                item.showPublication.removeStatus = true;
                item.showPublication.justFriends = false;
            }

            var isSave = publicationImpl.showHidePorfile(item);
            return res.status(200).send({message: 'success', socket: 'SOCKET_NULL_POINT'})
        } else {
            return res.status(200).send({message: 'error', socket: 'SOCKET_NULL_POINT'})
        }
    })
    /**
     * Reactive to ald publication
     */
    .put('/public-again/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var data = await publicationImpl.publicAgain(_id, me);
        if (data.message != null) {
            var save = await publicationImpl.savePublicaton(
                me._id,
                data['message']['text'],
                data['message']['image'],
                new Date(),
                null,
                null,
                null,
                data['message']['location'],
                null,
                'again',
                null
            )

            return res.status(data.status).send({message: save, socket: 'SOCKET_NULL_POINT'})
        } else {
            return res.status(data.status).send({message: data.message, socket: 'SOCKET_NULL_POINT'})
        }
        
    })
    /**
     * Delte publication
     */
    .delete('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var data = await publicationImpl.delete(_id, me);
        return res.status(data.status).send({message: data.message, socket: 'SOCKET_NULL_POINT'})
    })

module.exports = router;