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
        console.log(isSave)
        return res.status(isSave.status).send({message: isSave.like});
    })
    .put('/', async function(req, res) {
        var user_id = req.body['user'];
        var publication_id = req.body['publication'];
        var me = res.locals.currUser;

        var isSave = await publicationImpl.like(user_id, publication_id, me);
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