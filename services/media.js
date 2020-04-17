const express = require('express');
const router = express.Router();
const mediaImpl = require('../serviceImpl/mediaImpl');

var Auth = require('../meddlewares/auth.js');

router.use('/', Auth.isLogged);
router
    /**
     * Funkcija koja ne radi nista, vrsi se samo provera da li je 
     * ziv ruter
     */
    .get('/', function(req, res) {
        return res.status(200).send('Router is life')
    })
    .put('/', function(req, res) {
        var body = req.body;
        var me = res.locals;
        
        var data = {
            user: me.currUser,
            urlImage: body.link
        }
        var ressService = mediaImpl.editImageLocal(data);
        
        return res.status(200).send({message: ressService.message, socket: 'SOCKET_NULL_POINT'});
    })

module.exports = router;