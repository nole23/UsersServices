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
     * Funkcija koja ne radi nista, vrsi se samo provera da li je 
     * ziv ruter
     */
    .get('/', function(req, res) {
        return res.status(200).send('Router is life')
    })
    /**
     * Get all publication for this user
     * return 200 - null
     * return 200 - list publication
     * return 404 - server not found 
     */
    .get('/:id', async function(req, res) {
        var user_id = req.params.id;
        var me = res.locals.currUser;
        var page = JSON.parse(req.query.page);

        var listPublication = await publicationImpl.getAllPublicationById(user_id, me._id, 10, page);
        return res.status(listPublication.status).send({publication: listPublication.publication, socket: 'SOCKET_NULL_POINT'});
    })
    .get('/image/:id', async function(req, res) {
        var id = req.params.id;
        var me = res.locals.currUser;

        var publicOfPicture = await publicationImpl.getPublicByPicture(id, me);

        return res.status(publicOfPicture.status).send({publication: publicOfPicture.message, socket: 'SOCKET_NULL_POINT'})
    })
    .post('/', async function(req, res) {
        var item = req.body['item'];
        var object = req.body['object'];
        var me = res.locals.currUser;

        isSave = await publicationImpl.addComment(item, object, me);
        return res.status(isSave.status).send({message: isSave.like, socket: 'SOCKET_NULL_POINT'});
    })
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
    .put('/', async function(req, res) {
        var user_id = req.body['user'];
        var publication_id = req.body['publication'];
        var me = res.locals.currUser;

        var isSave = await publicationImpl.like(user_id, publication_id, me);
        // Ovde treba napraviti metodu koja javlja sta se uradilo i kreira notifikaciju
        return res.status(isSave.status).send({publication: isSave.like, socket: 'SOCKET_NULL_POINT'});
    })
    .put('/remove', async function(req, res) {
        var user_id = req.body['user'];
        var publication_id = req.body['publication'];
        var me = res.locals.currUser;

        var isSave = await publicationImpl.disLike(user_id, publication_id, me);
        return res.status(isSave.status).send({publication: isSave.like, socket: 'SOCKET_NULL_POINT'});
    })
    .put('/status/:type', function(req, res) {
        var me = res.locals.currUser;
        var type = req.params.type; // Mozda nekad ako se promjeni arhitektura
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
    .delete('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var data = await publicationImpl.delete(_id, me);
        return res.status(data.status).send({message: data.message, socket: 'SOCKET_NULL_POINT'})
    })

module.exports = router;