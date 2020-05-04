const UserInformation = require('../models/userInformation.js');
const User = require('../models/user.js');
const userImpl = require('../serviceImpl/userImpl.js');

module.exports = {

    save: async function(userInformation) {
        var newUserInformation = new UserInformation(userInformation);
        return await newUserInformation.save()
            .then(res => {
                return true;
            })
            .catch(err => {
                return false;
            })
    },
    sendNewToken: async function(user) {
        return UserInformation.findOne({_id: user.userInformation})
            .exec()
            .then((userInformation) => {
                if (userInformation == null) {
                    return {status: 200, message: 'ERROR_NOT_FIND_ITEM', socket: 'SOCKET_NULL_POINT'};
                }

                userInformation.verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                userInformation.save();
                userImpl.sendMaile(user, userInformation.verificationToken);

                return {status: 200, message: 'SUCCESS_SEND_VERIFICATION_TOKEN', socket: 'SOCKET_NULL_POINT'}
            })
            .catch(err => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND', socket: 'SOCKET_NULL_POINT'}
            })
    },
    verificationToken: async function(username, token) {
        return User.findOne({username: username})
            .populate('otherInformation')    
            .exec()
            .then(user => {

                if (user == null) {
                    return {status: 500, message: 'ERROR_NOT_FIND_USER', socket: 'SOCKET_NULL_POINT'};
                }

                if (user.otherInformation.verificationToken.toString() != token.toString()) {
                    return {status: 500, message: 'ERROR_NOT_FIND_ITEM', socket: 'SOCKET_NULL_POINT'};
                }

                user.statusProfile = true;
                user.save();
                return {status: 200, message: 'SUCCESS_TOKEN_IS_OK', socket: 'SOCKET_NULL_POINT'};
            })
            .catch(err => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND', socket: 'SOCKET_NULL_POINT'}
            })
    }
}