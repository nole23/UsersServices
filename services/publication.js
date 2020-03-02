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
        var listPublication = await publicationImpl.getAllPublicationById(user_id, 20, 0);
        
        return res.status(listPublication.status).send({publication: listPublication.publication});
    })
    .post('/', async function(req, res) {
        var item = req.body['item'];
        var object = req.body['object'];
        var me = res.locals.currUser;

        isSave = await publicationImpl.addComment(item, object, me);
        return res.status(isSave.status).send({message: isSave.like});
    })
    .post('/location', function(req, res) {
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

        publicationImpl.savePublicaton(
            me._id,
            body.message,
            null,
            new Date(),
            null,
            null,
            null,
            newaddress,
            body.friends
        );

        
        var odg = {
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
        return res.status(200).send(odg)
    })
    .put('/', async function(req, res) {
        var user_id = req.body['user'];
        var publication_id = req.body['publication'];
        var me = res.locals.currUser;

        var isSave = await publicationImpl.like(user_id, publication_id, me);
        // Ovde treba napraviti metodu koja javlja sta se uradilo i kreira notifikaciju
        return res.status(isSave.status).send({publication: isSave.like});
    })
    .put('/remove', async function(req, res) {
        var user_id = req.body['user'];
        var publication_id = req.body['publication'];
        var me = res.locals.currUser;

        var isSave = await publicationImpl.disLike(user_id, publication_id, me);
        return res.status(isSave.status).send({publication: isSave.like});
    })

module.exports = router;