const express = require('express');
var passwordHash = require('password-hash');
accepts = require('accepts');
const router = express.Router();
const UserInformation = require('../models/userInformation.js');
const User = require('../models/user.js');
const UserConfiguration = require('../models/UserConfiguration.js');
const globalConfigurate = require('../configuration/options.js');
const UserImpl = require('../function/userImpl.js');
const loginImpl = require('../serviceImpl/loginImpl.js');

var ioc = require('socket.io-client');
var socketc = ioc.connect('https://twoway-statusservice.herokuapp.com', {reconnect: true});

router
    /**
     * Verify router is life
     */
    .get('/', function(req, res) {
        console.log(accepts(req).languages());
        var userConfiguration = UserConfiguration(globalConfigurate['privateOptions'])
        console.log(userConfiguration)
        socketc.emit('getOnline', {});
        return res.status(200).send('Router is life')
    })
    /**
     * Method when resend new verification token
     * return 200 - Send new verification token
     * return 403 - Profile is verificate
     * return 404 - Email is not corect
     * 
     */
    .get('/send-new-token', function(req, res) {
        var parameters = req.body;
        User.findOne({email: parameters.email}, function(err, user) {
            if (err !== null || !user) return res.status(404).send({message: 'email not found'});
            if (user.statusProfile) return res.status(403).send({message: 'profile is verificate'});
            UserInformation.findOne({_id: user.userInformation}, function(error, userInformation) {
                if (error !== null || !userInformation) return res.status(404).send({message: 'user information not found'});

                userInformation.verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                userInformation.save((errsave) =>{
                    if (errsave !== null) return res.status(403).send({message: 'not save'})
                    UserImpl.sendMaile(user, userInformation.verificationToken);

                    return res.status(200).send({message: 'send verification token'});
                })
            })

        })
    })
    /**
     * Method for check code for restart passeword
     * return 200 - Ok
     * return 403 - Code not corect
     * return 404 - Not found user
     */
    .get('/check-code/:email/:code', function(req, res) {
        var email = req.params.email;
        var code = req.params.code;

        User.findOne({email: email}, function(err, user) {
            if (err !== null || !user) return res.status(404).send({message: 'not found user'});
            
            if (parseInt(user.tokenForRestartPassword) === parseInt(code)) {
                return res.status(200).send({message: 'code is verify'})
            } else {
                return res.status(403).send({message: 'not code'});
            }
        })
    })
    /**
     * Login whit username or email and password
     * return 200 - Login is corect
     * return 204 - Credencial is not corect
     * return 400 - Not send usernam and email
     * return 401 - Password is not corect
     * return 403 - Profil is not verify
     */
    .post('/sing-in', async function(req, res) {
        var loger = req.body['user'];

        if (loger.email === undefined || loger.email === null) {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        } else if (loger.password === undefined || loger.password === null) {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        } else {

            var data = await loginImpl.login(loger);
            return res.status(data.status).send({message: data.message})
        }
    })
    /**
     * Create new profile, we will validate data before save in DB
     * return 200 - Profil is corect create
     * return 400 - User not send all parameters for create profile
     * return 403 - Email is not corect or when is save in DB
     */
    .post('/sing-up', async function(req, res) {
        var user = req.body['user'];
        var userInformation = req.body['userInformation'];
        var userLang = req.body['userLang'];
        var iPInfo = req.body['iPInfo'];

        if (user.firstName === '') {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        }
        if (user.lastName === '') {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        }
        if (user.email === '') {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        }
        if (user.password === '') {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        }
        if (userInformation.sex === '') {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        }
        if (userInformation.dateOfBirth === '') {
            return res.status(200).send({message: 'ERROR_NULL_POINTER_EXEPTION'})
        }
        if (userLang === undefined || userLang === null) {
            userLang = (accepts(req).languages()).split[','][0]
        }
        if (iPInfo == undefined) {
            iPInfo = null;
        }

        const data = await loginImpl.create(user, userInformation, userLang, iPInfo);
        return res.status(200).send({message: data.message});
    })
    /**
     * Method for send restart password token
     * return 200 - Send email when token for restart
     * return 403 - Not save new token and send email
     * return 404 - Not found user whit email
     * 
     */
    .put('/token-for-restart-passwrod', function(req, res) {
        
        var parameters = req.body;
        User.findOne({email: parameters.email}, function(err, user) {
            if (err !== null || !user) return res.status(404).send({message: 'email not found'});
            var random = '';
            
            for (var i=0; i<7; i++) {
                random += '' + UserImpl.getRandomInt(10)
            }
            user.tokenForRestartPassword = random;
            user.save((error) => {
                if (error !== null) return res.status(403).send({message: 'not save'});
                UserImpl.sendMaileRestart(user);
                return res.status(200).send({message: 'send token for restart password'});
            })
        })
    })
    /**
     * Method for restart password
     * return 200 - OK
     * return 401 - Not corect code for restart
     * return 403 - Not save new password
     * return 404 - Profile not found
     */
    .put('/retstr-passeord', function(req, res) {
        var params = req.body;
        User.findOne({email: params.email}, function(err, user) {
            if (err !== null || !user) return res.status(404).send({message: 'not found prodile'});
            if (user.tokenForRestartPassword === params.code) return res.status(403).send({message: 'code not corect'});
            
            user.password = passwordHash.generate(params.passwrod);

            user.save((error) => {
                if (error !== null) return res.status(401).send({message: 'not save new password'});
                return res.status(200).send({message: 'save is success'});
            })
        })
    })
    /**
     * Method for verification profile
     * return 200 - Successfy verification prfile
     * return 403 - Prodile not verificate
     * return 404 - Token not foud
     */
    .put('/verify/:token', function(req, res) {
        var token = req. params.token;
        UserInformation.findOne({verificationToken: token}, function(err, userInformation) {
            if (err !== null || !userInformation) return res.status(404).send({message: 'token not found'});
            User.findOne({otherInformation: userInformation._id}, function(error, user) {
                if (error !== null || !user) return res.status(404).send({message: 'profile not found'});
                user.statusProfile = true;

                user.save((errsave) => {
                    if (errsave !== null) return res.status(403).send({message: 'profil not verificate'});
                    return res.status(200).send({message: 'profil is verificate'});
                })
            })
        })
    })
    /**
     * Delete user profile. Profile can delete only own profile
     * return 200 - Profile is sacess delete
     * return 403 - Profil can not delete
     * return 404 - Profile not found
     */
    .delete('/:id', function(req, res) {
        var _id = req.params.id;
        User.findOne({_id: _id}, function(err, user) {
            if (err !== null || !user) return res.status(404).send({message: 'not found'});
            user.statusProfile = false;
            user.save((error) => {
                if (error !== null) return res.status(403).send({message: 'profil wasnt delete'})
                return res.status(200).send({message: 'profil was delete'})
            });
        })
    })

module.exports = router;