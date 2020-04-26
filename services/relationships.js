var express = require('express');
var router = express.Router();

var relationshipsImpl = require('../serviceImpl/relationshipImpl.js');
var userImpl = require('../serviceImpl/userImpl.js');
var userFriendsImpl = require('../serviceImpl/userFriendsImpl.js');
var chatImpl = require('../serviceImpl/chatImpl.js');

var Auth = require('../meddlewares/auth.js');
var Relationship = require('../models/relationships.js');

router.use('/',Auth.isLogged);

router
    .get('/', function(req, res) {

    })
    .post('/', async function(req, res) {
        var friend = req.body['user'];
        var me = res.locals.currUser;

        var isReq = await relationshipsImpl.isStatusSend(friend, me);
        if (isReq) {
            var isRes = await relationshipsImpl.isStatusSend(me, friend);
            if (isRes) {
                var data = {
                    requester: me._id,
                    responder: friend._id
                }
                
                relationshipsImpl.save(data)

                return res.status(200).send({
                    message: 'SUCCESS_SAVE', 
                    socket: {
                        type: 'RELATIONSHIP',
                        link: 'new-relationship-',
                        participants: [friend],
                        data: me
                    }
                })
            } else {
                return res.status(200).send({message: 'ERROR_NOT_SAVE_RELATIONSHIP', socket: 'SOCKET_NULL_POINT'})
            }
        } else {
            return res.status(200).send({message: 'ERROR_NOT_SAVE_RELATIONSHIP', socket: 'SOCKET_NULL_POINT'})
        }
    })
    .put('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var getIdFrinedsList = await userImpl.getIdFrinedsList(_id);
        var getMyIdFrinedsList = me.friends;

        var saveFriend = await userFriendsImpl.saveFriend(getMyIdFrinedsList, getIdFrinedsList._id);
        if (saveFriend.status == 404) {
            return res.status(200).send({message: saveFriend.message, socket: 'SOCKET_NULL_POINT'});
        }

        var saveFriend1 = await userFriendsImpl.saveFriend(getIdFrinedsList.friends, me._id);
        if (saveFriend1.status == 404) {
            return res.status(200).send({message: saveFriend1.message, socket: 'SOCKET_NULL_POINT'});
        }
        
        relationshipsImpl.deleteByReqRes(me._id, _id);
        relationshipsImpl.deleteByReqRes(_id, me._id);

        chatImpl.creatChaters(me, [_id])
        return res.status(200).send({message: 'SUCCESS_ACCEPT_NEW_FRIEND', socket: 'SOCKET_NULL_POINT'});
    })
    .delete('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var deleteP = await relationshipsImpl.delete(_id, me._id);
        if (deleteP.status == 404) {
            return res.status(200).send({isDelete: deleteP.message, socket: 'SOCKET_NULL_POINT'})
        }

        var deleteF = await relationshipsImpl.delete(me._id, _id);
        if (deleteF.status == 404) {
            return res.status(200).send({isDelete: deleteF.message, socket: 'SOCKET_NULL_POINT'})
        } else {
            return res.status(200).send({message: 'SUCCESS_SAVE_REMOVE', socket: 'SOCKET_NULL_POINT'})
        }
    })

module.exports = router;