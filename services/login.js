const express = require('express');
accepts = require('accepts');
const router = express.Router();
const UserImpl = require('../function/userImpl.js');
const loginImpl = require('../serviceImpl/loginImpl.js');
const userInformationImpl = require('../serviceImpl/userInformationImpl.js');

router
    /**
     * Verify router is life
     */
    .get('/', function(req, res) {
        return res.status(200).send('Router is life')
    })
    /**
     * Method when resend new verification token
     * return 200 - Send new verification token
     * 
     */
    .get('/send-new-token', async function(req, res) {
        var parameters = req.body;
        var user = await UserImpl.findUserByEmail(parameters.email);
        if (user != null) {

            if (user.statusProfile) {
                return res.status(200).send({
                    message: 'ERROR_PROFILE_IS_VERIFY', 
                    socket: 'SOCKET_NULL_POINT'});
            }

            var data = await userInformationImpl.sendNewToken(user);
            return res.status(200).send({
                message: data.message,
                socket: data.socket
            })
        } else {
            return res.status(200).send({
                message: 'ERROR_EMAIL_NOT_FREE', 
                socket: 'SOCKET_NULL_POINT'});
        }
    })
    /**
     * Method for check code for restart passeword
     * return 200 - Ok
     */
    .get('/check-code/:email/:code', async function(req, res) {
        var email = req.params.email;
        var code = req.params.code;

        var user = await UserImpl.findUserByEmail(email);
        if (user.status != 200) {
            return res.status(200).send({
                message: 'ERROR_NOT_FIND_USER', 
                socket: 'SOCKET_NULL_POINT'});
        } else {
            if (parseInt(user['message'].tokenForRestartPassword) === parseInt(code)) {
                return res.status(200).send({
                    message: 'SUCCESS_VERIFICATION_CODE_IS_SUCCESS', 
                    socket: 'SOCKET_NULL_POINT'
                })
            } else {
                return res.status(200).send({
                    message: 'ERROR_VERIFICATION_CODE_IS_ERROR', 
                    socket: 'SOCKET_NULL_POINT'
                });
            }
        }
    })
    /**
     * Login whit username or email and password
     * return 200 - Login is corect
     */
    .post('/sing-in', async function(req, res) {
        var loger = req.body['user'];

        if (loger.email === undefined || loger.email === null) {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        } else if (loger.password === undefined || loger.password === null) {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        } else {
            
            var data = await loginImpl.login(loger);
            return res.status(data.status).send({
                message: data.message, 
                socket: 'SOCKET_NULL_POINT'
            })
        }
    })
    /**
     * Create new profile, we will validate data before save in DB
     * return 200 - Profil is corect create
     */
    .post('/sing-up', async function(req, res) {
        var user = req.body['user'];
        var userInformation = req.body['userInformation'];
        var userLang = req.body['userLang'];
        var iPInfo = req.body['iPInfo'];

        if (user.firstName === '') {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        }
        if (user.lastName === '') {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        }
        if (user.email === '') {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        }
        if (user.password === '') {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        }
        if (userInformation.sex === '') {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        }
        if (userInformation.dateOfBirth === '') {
            return res.status(200).send({
                message: 'ERROR_NULL_POINTER_EXEPTION', 
                socket: 'SOCKET_NULL_POINT'
            })
        }
        if (userLang === undefined || userLang === null) {
            userLang = (accepts(req).languages()).split[','][0]
        }
        if (iPInfo == undefined) {
            iPInfo = null;
        }

        const data = await loginImpl.create(user, userInformation, userLang, iPInfo);
        return res.status(200).send({
            message: data.message, 
            socket: 'SOCKET_NULL_POINT'
        });
    })
    /**
     * Method for send restart password token
     * return 200 - Send email when token for restart
     * 
     */
    .put('/token-for-restart-passwrod', async function(req, res) {
        var parameters = req.body;

        var data = await UserImpl.editVerificationToken(parameters.email);
        return res.status(200).send({
            message: data.message, 
            socket: data.socket
        });
    })
    /**
     * Method for restart password
     * return 200 - OK
     */
    .put('/retstr-passeord', async function(req, res) {
        var params = req.body;

        var data = await UserImpl.restarPassword(params)
        return res.status(200).send({
            message: data.message, 
            socket: data.socket});
    })
    /**
     * Method for verification profile
     * return 200 - Successfy verification prfile
     * return 403 - Prodile not verificate
     * return 404 - Token not foud
     */
    .put('/verify/:token', async function(req, res) {
        var token = req. params.token;

        var data = await userInformationImpl.verificationToken(token);
        if (data.status != 200) {
            return res.status(200).send({
                message: data.message, 
                socket: data.socket
            }); 
        } else {
            var user = await UserImpl.verificationProfile(data.message);

            return res.status(200).send({
                message: user.message, 
                socket: user.socket
            }); 
        }
    })
    /**
     * Delete user profile. Profile can delete only own profile
     * return 200 - Profile is sacess delete
     * return 403 - Profil can not delete
     * return 404 - Profile not found
     */
    .delete('/:id', async function(req, res) {
        var _id = req.params.id;

        var data = await UserImpl.removeProfile(_id);
        return res.status(200).send({
            message: data.message, 
            socket: data.socket
        })
    })

module.exports = router;