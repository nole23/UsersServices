var express = require('express');
var app = express();
var jwt = require('jwt-simple');
var User = require('../models/user.js');
var UserInformation = require('../models/userInformation.js');
var userImpl = require('../serviceImpl/userImpl.js');
var publicationImpl = require('../serviceImpl/publicationImpl.js');

module.exports = {
    editImage: function(data) {
        var token = data.token;
        var urlImg = data.urlImage;

        var decoded = jwt.decode(token, 'XWSMeanDevelopment');
        //get user Id
        var currentId = decoded._id;
        return User.findById(currentId)
            .exec()
            .then((user) => {
                return UserInformation.findById(user.otherInformation)
                    .exec()
                    .then((ui) =>{
                        ui.publicMedia.profileImage = urlImg;
                        ui.save();

                        var user_id = user._id;
                        var text = !data.text ? undefined : data.data;
                        var image = !data.urlImage ? undefined : data.urlImage;
                        var datePublish = new Date;
                        var likesCount = undefined;
                        var likes = undefined;
                        var comments = undefined;
                        var address = undefined;
                        var type = data.data;
                        publicationImpl.savePublicaton(
                            user_id,
                            text,
                            image,
                            datePublish,
                            likesCount,
                            likes,
                            comments,
                            address,
                            type,
                            data.img_id
                        );
                        return urlImg;
                        // socket.emit('test', urlImg);
                        // TO DO ovde treba napraviti neki socket koji ce javiti clijentu da je zvrsena izmjena
                    })
            })
    },
    editImageLocal: async function(data) {
        return UserInformation.findById(data.user.otherInformation)
            .exec()
            .then((otherInformation) => {
                otherInformation.publicMedia.profileImage = data.urlImage;
                otherInformation.save();

                var user_id = data.user._id;
                var text = !data.text ? undefined : data.data;
                var image = !data.urlImage ? undefined : data.urlImage;
                var datePublish = new Date;
                var likesCount = undefined;
                var likes = undefined;
                var comments = undefined;
                var address = undefined;
                var type = 'location';
                publicationImpl.savePublicaton(
                    user_id,
                    text,
                    image,
                    datePublish,
                    likesCount,
                    likes,
                    comments,
                    address,
                    type,
                    null
                );
                
                return {status: 200, message: 'Save is succesifful'}
            })
            .catch((err) => {
                return {status: 404, message: 'Server error'}
            })
    }
}