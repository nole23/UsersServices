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
        var me = res.locals.currUser;
        var page = JSON.parse(req.query.page);
        var type = JSON.parse(req.query.type);
        var numberOfData = me.otherInformation.options.numberOfData;

        var data = {};
        if (type.toString() == 'visitors') {
            data = await notificationImpl.getAllVisitors(me, numberOfData, page);
        } else if (type.toString() == 'publication') {
            data = await notificationImpl.getAllNotification(me, numberOfData, page);
        }
        
        res.status(200).send({message: data.message, socket: 'SOCKET_NULL_POINT'});
    })


module.exports = router;