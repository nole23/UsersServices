const express = require('express');
const router = express.Router();
var Auth = require('../meddlewares/auth.js');
const chatImpl = require('../serviceImpl/chatImpl.js');

router.use('/', Auth.isLogged);

router
    /**
     * Find all chat by one user
     */
    .get('/', async function(req, res) {
        var me = res.locals.currUser;
        var numberOfData = me.otherInformation.options.numberOfData;

        var data = await chatImpl.getAllChatBayId(me, numberOfData, 0);
        return res.status(data.status).send({message: data.message, me: me, socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * Get chat
     */
    .get('/:id', async function(req, res) {
        var id = req.params.id;

        var data = await chatImpl.getChatById(id);
        return res.status(data.status).send({message: data.message, socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * Create new chat with user who not my friend
     */
    .post('/', async function(req, res) {
        var me = res.locals.chatImpl;
        var listUser = req.body;

        var data = await chatImpl.creatChaters(me, listUser);
        return res.status(data.status).send({message: data.message, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * Not Implement
     */
    .put('/', async function(req, res) {
        // TO DO 
    })
    /**
     * Not Implement
     */
    .delete('/', async function(req, res) {
        // TO DO
    })


module.exports = router;