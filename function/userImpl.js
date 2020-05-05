const User = require('../models/user.js');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const openGeocoder = require('node-open-geocoder');
var UserInformation = require('../models/userInformation.js');

module.exports = {
    userDTO: function(user) {
        return {
           _id: user._id,
           firstName: user.firstName,
           lastName: user.lastName,
           username: user.username,
           email: user.email,
           otherInformation: {
            sex: user.otherInformation.sex,
            publicMedia: user.otherInformation.publicMedia,
            dateOfBirth: user.otherInformation.dateOfBirth,
            adress: user.otherInformation.adress,
            jobs: user.otherInformation.jobs,
            about: user.otherInformation.myText
           }
        }
    },
    userFriendDTO: function(user, status) {
        var isProfle = user.otherInformation.options.profile;
        let whoCanSeeProfile = user.otherInformation.options.whoCanSeeProfile;
        var object  = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: null,
            otherInformation: {
                sex: null,
                publicMedia: user.otherInformation.publicMedia,
                dateOfBirth: null,
                adress: {},
                jobs: {},
                about: user.otherInformation.myText
            }
        }
        if (whoCanSeeProfile == 'all') {
            object.email = user.email;
            object.otherInformation.sex = user.otherInformation.sex;
            object.otherInformation.dateOfBirth = isProfle.birdthDay ? user.otherInformation.dateOfBirth : null;
            object.otherInformation.adress = isProfle.address ? user.otherInformation.adress : {};
            object.otherInformation.jobs = isProfle.jab ? user.otherInformation.jobs : {};
        }

        if (whoCanSeeProfile == 'friends') {
            if (status) {
                object.email = user.email;
                object.otherInformation.sex = user.otherInformation.sex;
                object.otherInformation.dateOfBirth = isProfle.birdthDay ? user.otherInformation.dateOfBirth : null;
                object.otherInformation.adress = isProfle.address ? user.otherInformation.adress : null;
                object.otherInformation.jobs = isProfle.job ?  user.otherInformation.jobs : null;
            }
        }

        return object;
    },
    userAllDTO: function(user, isBoolean) {
        return {
            _id: user._id,
           firstName: user.firstName,
           lastName: user.lastName,
           username: user.username,
           email: user.email,
           otherInformation: {
            sex: user.otherInformation.sex,
            publicMedia: user.otherInformation.publicMedia,
            dateOfBirth: user.otherInformation.dateOfBirth,
            adress: user.otherInformation.adress,
            jobs: user.otherInformation.jobs,
            about: user.otherInformation.myText
           },
           request: isBoolean,
           listFriends: user.friends.listFriends
        }
    },
    findUserByUsername: async function(username) {
        return User.findOne({username: username})
            .exec()
            .then(user => {
                return user;
            })
            .catch(err => {
                return undefined;
            })
    },
    findUserById: async function(id) {
        return User.findById(id)
            .populate({
                path: 'otherInformation',
                populate: [{
                    path: 'options'
                }]
            })
            .exec()
            .then(user => {
                return user;
            })
            .catch(err => {
                return undefined;
            })
    },
    findUserByEmail: async function(email) {
        return User.findOne({email: email})
            .exec()
            .then(user => {
                if (user != null) {
                    return {status: 200, message: user}
                } else {
                    return {status: 500, message: 'ERROR_NOT_FIND_USER'}
                }
            })
            .catch(err => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND'}
            })
    },
    sendMaile: function(user, verificationToken) {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'twoway.owner@gmail.com',
                pass: 'aplikacija1'
            }
        });

        var link =  'https://twoway1.herokuapp.com/verify/' + user.username + '/' + verificationToken;
        var html = '<body>' +
                        '<h1>Dragi nas ' + user.firstName + '</h1>' +
                        '<br>' +
                        '<p>Prijavili ste se na nas sajt TwoWay, koristeci ovaj email. Da bi ste zavrsili registraciju pratite sledeci link: </p>' +
                        '<a href="' + link + '">https://twoway1.herokuapp.com/verify/?id=...</a>' +
                        '<p>Osnovni podaci vaseg profila: </p>' +
                        '<span style="color: #00c928">Korisnicko ime: </span><span style="color: dark"> ' + user.username + '</span>' + 
                        '<br>' +
                        '<p>Ukoliko link ne bude radio, molimo vas sacekajte par trenutaka pa pokusajte ponovo ili zatrazite novi link da va posaljemo</p>' +
                        '<br>' +
                        '<p>Hvala, Vas TwoWay</p>'
                    '</body>'

        
        var mailOptions = {
            from:'twoway.own@gmail.com',
            to: user.email,
            subject: "Email Verification",
            html: html.toString()
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                return false;
            } else {
                console.log('Email sent: ' + info.response);
                return true;
            }
        });
    },
    sendMaileRestart: function(user) {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'twoway.owner@gmail.com',
                pass: 'aplikacija1'
            }
        });

        var html = '<body>' +
                    '<h1>Dragi nas ' + user.firstName + '</h1>' +
                    '<br>' +
                    '<p>Vas kod za verifikaciju naloga je: </p>' +
                    '<div style="width: 150px; height: 30px; font-size: 20px; text-align: center; border: 1px solid #00c928; border-radius: 5px; padding: 5px; color: #00c928">' + user.tokenForRestartPassword + '</div>' +
                    '<p>Ukoliko kod ne bude bio ispravan, posaljite zahtev za novi kod</p>' +
                    '<br>' +
                    '<p>Hvala, Vas TwoWay</p>'
                '</body>'

        var mailOptions = {
            from:'twoway.owner@gmail.com',
            to: user.email,
            subject: "Token Verification",
            html: html.toString()
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                return false;
            } else {
                console.log('Email sent: ' + info.response);
                return true;
            }
        });
    },
    getRandomInt: function(max) {
        return Math.floor(Math.random() * Math.floor(max));
    },
    getToken: function() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },
    geolocation: function(address, _id) {
        openGeocoder().geocode(address.city.toString()).end((err, corr) => {
            var corrdinate = {
                latitude: corr[0].lat,
                longitude: corr[0].lon,
                accuracy: corr[0].osm_id
            }
            
            UserInformation.findById(_id)
            .exec()
            .then((userInformation) => {
                userInformation.adress.corrdinate = corrdinate
                userInformation.save();
            })
        })
    },
    save: async function(user) {
        var newUser = new User(user);
        return await newUser.save()
            .then(res => {
                return true;
            })
            .catch(err => {
                return false;
            })
    },
    editVerificationToken: async function(email) {
        return User.findOne({email: email})
            .exec()
            .then(user => {
                if (user == null) {
                    return {status: 200, message: 'ERROR_NOT_FIND_USER', socket: 'SOCKET_NULL_POINT'}
                }

                
                if (!user.statusProfile) {
                    return {status: 200, message: 'ERROR_PROFILE_NOT_VERIFY', socket: 'SOCKET_NULL_POINT'}
                }

                var random = '';
                for (var i=0; i<7; i++) {
                    random += '' + this.getRandomInt(10)
                }

                user.tokenForRestartPassword = random;
                user.save();
                this.sendMaileRestart(user);
                return {status: 200, message: 'SUCCESS_SEND_NEW_VERIFICATION_TOKEN', socket: 'SOCKET_NULL_POINT'}
            })
            .catch(err => {
                return {status: 400, message: 'ERROR_SERVER_NOT_FOUND', socket: 'SOCKET_NULL_POINT'}
            })
    },
    restarPassword: async function(params) {
        return User.findOne({email: params.email})
            .exec()
            .then(user =>{
                if (user == null) {
                    return {status: 200, message: 'ERROR_NOT_FIND_USER', socket: 'SOCKET_NULL_POINT'}
                }

                const token = user.tokenForRestartPassword;
                if (token.toString() === params.count) {
                    return {status: 200, message: 'ERROR_VERIFICATION_CODE_IS_ERROR', socket: 'SOCKET_NULL_POINT'};
                }

                user.password = passwordHash.generate(params.passwrod);
                user.save();
                return {status: 200, message: 'SUCCESS_SAVE', socket: 'SOCKET_NULL_POINT'};
            })
            .catch(err => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND', socket: 'SOCKET_NULL_POINT'}
            })
    },
    verificationProfile: async function(data) {
        return User.findOne({otherInformation: data._id})
            .exec()
            .then(user => {
                if (user == null) {
                    return {status: 200, message: 'ERROR_NOT_FIND_USER', socket: 'SOCKET_NULL_POINT'}
                }

                user.statusProfile = true;
                user.save();
                return {status: 200, message: 'SUCCESS_PROFILE_IS_VERIFICATION', socket: 'SOCKET_NULL_POINT'}
            })
            .catch(err => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND', socket: 'SOCKET_NULL_POINT'}
            })
    },
    removeProfile: async function(id) {
        return User.findById(id)
            .exec()
            .then(user => {
                if (user == null) {
                    return {status: 200, message: 'ERROR_NOT_FIND_USER', socket: 'SOCKET_NULL_POINT'}
                }

                user.statusProfile = false;
                user.save();
                return {status: 200, message: 'SUCCESS_PROFILE_IS_REMOVE', socket: 'SOCKET_NULL_POINT'}
            })
            .catch(err => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND', socket: 'SOCKET_NULL_POINT'}
            })
    }
}