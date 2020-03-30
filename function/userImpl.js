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
           request: isBoolean
        }
    },
    findUserByUsername: async function(username) {
        return User.findOne({username: username}, function(err, user) {
            return user;
        })
    },
    sendMaile: function(user, verificationToken) {
        var transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: 'twoway.own@gmail.com',
                pass: 'aplikacija1'
            }
        }));
        var link =  'https://twoway1.herokuapp.com/verify/' + user.username + '/' + verificationToken;
        var mailOptions = {
            from:'twoway.own@gmail.com',
            to: user.email,
            subject: "Email Verification",
            html: "<body><h1>Two Way</h1><br><p>Please click this <a href="+link+">link</a></p></body>"
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
        var transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: 'twoway.owner@gmail.com',
                pass: 'aplikacija1'
            }
        }));
        
        console.log("email: " +user.email)
        var mailOptions = {
            from:'twoway.owner@gmail.com',
            to: user.email,
            subject: "Email Verification",
            html: "<body><h1>Two Way</h1><br><p>Your verification code "+user.tokenForRestartPassword+"</p></body>"
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
    }
}