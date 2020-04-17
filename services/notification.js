const express = require('express');
const router = express.Router();
const notificationImpl = require('../serviceImpl/notificationImpl.js');
var Auth = require('../meddlewares/auth.js');

router.use('/', Auth.isLogged);
router
    /**
     * Funkcija koja ne radi nista, vrsi se samo provera da li je 
     * ziv ruter
     */
    .get('/', async function(req, res) {
        var me = res.locals;
        var data = await notificationImpl.getAllNotification(me, 20, 0);
        res.status(data.status).send({message: data.message, socket: 'SOCKET_NULL_POINT'});
    })


module.exports = router;