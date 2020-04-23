const express = require('express');
const router = express.Router();

var Auth = require('../meddlewares/auth.js');
const User = require('../models/user.js');
const UserImpl = require('../function/userImpl.js');
const relationshipImpl = require('../serviceImpl/relationshipImpl.js');
const userImpl = require('../serviceImpl/userImpl.js');
const userFriendImpl = require('../serviceImpl/userFriendsImpl.js');

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
     * Get information when one user
     * return 200 - Send information one user
     * return 404 - User is not found
     */
    .get('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var user = await userImpl.getUserById(_id, me._id);

        if (user.status != 200) return res.status(user.status).send({user: null, relationship: null, socket: 'SOCKET_NULL_POINT'});
        var isRequester = await relationshipImpl.getStatusRelationship(me._id, user.user._id);
        var isResponder = await relationshipImpl.getStatusRelationship(user.user._id, me._id);
        return res.status(200).send({user: user.user, isRequester: isRequester, isResponder: isResponder, isFriends: user.friends, socket: 'SOCKET_NULL_POINT'});
    })
    .get('/friends/:id/:page', async function(req, res) {
        var _id = req.params.id;
        var page = req.params.page;
        var me = res.locals.currUser;
        var limit = 20;
        var page = Math.max(0, page)
        
        var listFrineds = await userFriendImpl.getListFriends(me.friends, limit, page);
        return res.status(200).send({listFriends: listFrineds, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * Get all user bat create pagination
     * return 200 - List of users
     */
    .get('/all/:page', function(req, res) {
        var pageReq = req.params.page;

        var limit = 20;
        var page = Math.max(0, pageReq)
        User.find({})
            .limit(limit)
            .skip(limit * page)
            .populate('otherInformation')
            .exec()
            .then((users) => {
                var users = [];
                users.forEach(element => {
                    users.push(UserImpl.userDTO(element));
                });
                return res.status(200).send({users: users, socket: 'SOCKET_NULL_POINT'});
            })
    })
    /**
     * Get user why not my friends
     * return 200 - List of users
     * return 400
     */
    .get('/all-other/:page', async function(req, res) {
        var pageReq = req.params.page;
        var user = res.locals.currUser;
        var listFriends = user.friends.listFriends;
        listFriends.push(user._id);
        var limit = 20;
        var page = Math.max(0, pageReq)

        // Ja sam nekom poslao zahtjev
        var requestedOrResponder = await relationshipImpl.requestedOrResponder(user);
        var allRequestetOrResponder = requestedOrResponder.status == 404 ? [] : requestedOrResponder.message;

        var listUser = await userImpl.getListUser(
            listFriends,
            allRequestetOrResponder,
            limit,
            page);

        return res.status(200).send({message: listUser.message, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * Metoda za pretrazivanje svih korisnika na serveru
     */
    .get('/search/:text', async function(req, res) {
        var text = req.params.text;
        var me = res.locals.currUser;
        var limit = 20;
        var page = 0;
        var listFrineds = me.friends.listFriends;

        var requestedOrResponder = await relationshipImpl.requestedOrResponder(me);
        var allRequestetOrResponder = requestedOrResponder.status == 404 ? [] : requestedOrResponder.message;
        
        var listUser = await userImpl.searchUser(text, limit, page, me, allRequestetOrResponder, listFrineds);
        return res.status(listUser.status).send({users: listUser.usersList, socket: 'SOCKET_NULL_POINT'});
    })
    .post('/friends', async function(req, res) {
        var listOnlineFriends = req.body['listOnlineFriends'];
        var limit = req.body['limit'];
        var me = res.locals.currUser;

        var listFriends = await userFriendImpl.getModifyListFriends(listOnlineFriends, limit, me);
        return res.status(200).send({users: listFriends, socket: 'SOCKET_NULL_POINT'});
    })
    /**
     * Metoda koja vrsi azuriranje onsovnih informacija kao i imena i
     * prezimena, dok se sifra azurira u posebnoj metodi
     */
    .put('/', function (req, res) {
        var data = req.body;
        var me = res.locals.currUser;

        var objectUser = {
            firstName: !data.firstName ? me.firstName : data.firstName,
            lastName: !data.lastName ? me.lastName : data.lastName,
        };

        var objectUserInfo = {
            dateOfBirth: !data.dateOfBirth ? me.otherInformation.dateOfCreation : data.dateOfBirth,
            sex: !data.sex ? me.otherInformation.sex : data.sex
        }

        userImpl.editProfile(me._id, objectUser);
        userImpl.editInfo(me.otherInformation, objectUserInfo);
        return res.status(200).send({message: 'SUCCESS_SAVE', socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * Metoda koja azurira pasword korisnika, i u tom trenutku ga 
     * izloguje sa sistema i posalje ga na ponovnu autentifikaciju
     */
    .put('/password', function (req, res) {
        var data = req.body;
        var me = res.locals.currUser;

        // TODOO - Provjeriti ispravnost podataka
        var objectUser = {
            email: !data.email ? me.email : data.email,
            password: !data.password ? undefined : data.password,
        };

        userImpl.editPassword(me._id, objectUser);
        return res.status(200).send({message: 'SUCCESS_SAVE', socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * Metoda koja azurira profilnu sliku koriniska, medjutim ne vrsi
     * aziriranje na svim mjestima dok god se ne uloguje ponovo
     */
    .put('/information', function (req, res) {
        var data = req.body;
        var me = res.locals.currUser;
        
        var object = {
            myText: !data.about ? me.otherInformation.about : data.about,
            adress: !data.address ? me.otherInformation.address : data.address,
            jobs: {
                name: !data.name ? me.otherInformation.jobs.name : data.name,
                places: !data.places ? me.otherInformation.jobs.places : data.places,
                nameCompany: !data.nameCompany ? me.otherInformation.jobs.nameCompany : data.nameCompany
            }
        }
        userImpl.editInformation(me.otherInformation, object);
        return res.status(200).send({message: 'SUCCESS_SAVE', socket: 'SOCKET_NULL_POINT'})
    })
    .put('/configuration', function (req, res) {
        var data = req.body;
        var me = res.locals.currUser;
        
        // var object = {
        //     myText: !data.about ? me.otherInformation.about : data.about,
        //     adress: !data.address ? me.otherInformation.address : data.address,
        //     jobs: {
        //         name: !data.name ? me.otherInformation.jobs.name : data.name,
        //         places: !data.places ? me.otherInformation.jobs.places : data.places,
        //         nameCompany: !data.nameCompany ? me.otherInformation.jobs.nameCompany : data.nameCompany
        //     }
        // }
        // userImpl.editInformation(me.otherInformation, object);
        return res.status(200).send({message: 'SUCCESS_SAVE', socket: 'SOCKET_NULL_POINT'})
    })
    /**
     * Metoda koja azurira naslovnu sliku profila
     */
    .put('/cover-image', function (req, res) {
        return res.status(200).send({})
    })
    .delete('/:id', async function(req, res) {
        var _id = req.params.id;
        var me = res.locals.currUser;

        var friend = await userImpl.getIdFrinedsList(_id);

        userFriendImpl.delteFriends(me.friends, _id);
        userFriendImpl.delteFriends(friend.friends, me._id);
        
        return res.status(200).send({message: 'succesfyll', socket: 'SOCKET_NULL_POINT'})
    })

module.exports = router;