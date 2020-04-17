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
                var newI = {
                    requester: me._id,
                    responder: friend._id
                }
                var relationship = new Relationship(newI)

                relationship.save(function(err) {
                    if (err) return res.status(404).send({message: 'notSave'});
                    return res.status(200).send({message: 'save', socket: 'SOCKET_NULL_POINT'})
                })
            } else {
                return res.status(200).send({message: 'notSave', socket: 'SOCKET_NULL_POINT'})
            }
        } else {
            return res.status(200).send({message: 'notSave', socket: 'SOCKET_NULL_POINT'})
        }
    })
    .put('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var getIdFrinedsList = await userImpl.getIdFrinedsList(_id);
        var getMyIdFrinedsList = me.friends;

        var isSaveFriend = await userFriendsImpl.saveFriend(getMyIdFrinedsList, getIdFrinedsList._id);
        if (!isSaveFriend) return res.status(404).send({message: 'has not save friend in list', socket: 'SOCKET_NULL_POINT'});

        var isSaveFriend1 = await userFriendsImpl.saveFriend(getIdFrinedsList.friends, me._id);
        if (!isSaveFriend1) return res.status(404).send({message: 'has not save friend in list', socket: 'SOCKET_NULL_POINT'});
        
        relationshipsImpl.deleteByReqRes(me._id, _id);
        relationshipsImpl.deleteByReqRes(_id, me._id);

        chatImpl.creatChaters(me, [_id])
        return res.status(200).send({message: 'succifully', socket: 'SOCKET_NULL_POINT'});
    })
    .delete('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var isDelete = await relationshipsImpl.delete(_id, me._id);
        if (isDelete) return res.status(200).send({isDelete: isDelete, socket: 'SOCKET_NULL_POINT'})
        var isDeleteF = await relationshipsImpl.delete(me._id, _id);
        if (isDeleteF) return res.status(200).send({isDelete: isDeleteF, socket: 'SOCKET_NULL_POINT'});
        return res.status(404).send({isDelete: true, socket: 'SOCKET_NULL_POINT'})
    })

module.exports = router;