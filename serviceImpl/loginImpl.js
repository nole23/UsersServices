var passwordHash = require('password-hash');
var jwt = require('jwt-simple');
var User = require('../models/user.js');
const UserFriends = require('../models/UserFriends.js');
const UserConfiguration = require('../models/UserConfiguration.js');
const UserInformation = require('../models/userInformation.js');
const globalConfigurate = require('../configuration/options.js');
const userImpl = require('../function/userImpl.js');
const userInformationImpl = require('../serviceImpl/userInformationImpl.js');
const userConfigurationImpl = require('../serviceImpl/userConfigurationImpl.js');
const notificationImpl = require('../serviceImpl/notificationImpl.js');
const relationshipImpl = require('../serviceImpl/relationshipImpl.js');

module.exports = {
    login: async function(credencial) {
        return User.findOne({email: credencial.email})
            .populate({ 
                path: 'otherInformation',
                populate: [{
                    path: 'options'
                }] 
             })
            .populate('friends')
            .exec()
            .then(async (user) =>{
                if (user === null) {
                    return {status: 200, message: 'ERROR_NOT_FIND_USER'}
                }

                if (!passwordHash.verify(credencial.password, user.password)) {
                    return {status: 200, message: 'ERROR_UNAUTHORIZED'}
                }

                if (!user.statusProfile) {
                    return {status: 200, message: 'ERROR_PROFILE_NOT_VERIFY'}
                }

                var secret = {
                    sub: new Date().getTime(),
                    name: user.username,
                    iat: new Date().setHours(24),
                    _id: user._id
                }

                var token = jwt.encode(secret, 'XWSMeanDevelopment');

                var data = {
                    user: userImpl.userAllDTO(user, false),
                    token: token,
                    defaultOptions: userConfigurationImpl.optionsDTO(user.otherInformation.options),
                    statusNotification: {
                        notification: await notificationImpl.statusNotification(user),
                        relationship: await relationshipImpl.statusRelationship(user),
                        messages: 0
                    }
                }

                return {status: 200, message: data, socket: 'SOCKET_NULL_POINT'}
            })
            .catch((err) =>{
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND'}
            });
    },
    create: async function(user, userInformation, language, iPInfo) {
        var user = User(user)
        var userInformation = UserInformation(userInformation);
        var userFriends = UserFriends();
        var userConfiguration = UserConfiguration(globalConfigurate['privateOptions'])
        
        var username = user['email'].split('@');
        const status = await userImpl.findUserByUsername(username[0]);
        user.username = username[0];
        user.password = passwordHash.generate(user['password']);
        if (status !== undefined && status !== null) {
            user.username = username[0] + status._id;
        }
        user.friends = userFriends;
        user.otherInformation = userInformation._id;

        var isSaveUser = await userImpl.save(user);
        if (isSaveUser) {

            userInformation.options = userConfiguration._id;
            userInformation.verificationToken = userImpl.getToken();
            userInformation.publicMedia = {
                profileImage: "./assets/picture/avatar1.png",
                coverPhoto: "./assets/picture/cover.png"
            };

            userInformation.adress = {
                country: iPInfo.country_name != null ? iPInfo.country_name : null,
                region: (iPInfo.regio != null && iPInfo.regio != undefined) ? iPInfo.regio : null,
                city: (iPInfo.city != null && iPInfo.city != undefined) ? iPInfo.city : null,
                corrdinate: {
                    latitude: (iPInfo.latitude != null && iPInfo.latitude != undefined) ? iPInfo.latitude : null,
                    longitude: (iPInfo.longitude != null && iPInfo.longitude != undefined) ? iPInfo.longitude : null,
                    accuracy:  (iPInfo.country_area != null && iPInfo.country_area != undefined) ? iPInfo.country_area : nul
                }
            }
            userInformation.jobs = {
                name: null,
                places: null,
                nameCompany: null
            }
            userInformation.myText = null;

            var isSaveInformation = userInformationImpl.save(userInformation)
            if (isSaveInformation) {

                if (iPInfo != null) {
                    userConfiguration.search.location.push(iPInfo.country_name)
                    userConfiguration.navigatInfo = iPInfo;
                }
                if (userInformation.sex === 'men') {
                    userConfiguration.search.location.push('women')
                } else {
                    userConfiguration.search.location.push('men')
                }
                userConfiguration.localization = language

                var isSaveConfiguaation = await userConfigurationImpl.save(userConfiguration);
                if (isSaveConfiguaation) {
                    
                    userFriends.save();
                    userImpl.sendMaile(user, userInformation.verificationToken);
                    return {status: 200, message: 'SUCCESS_CREATE_NEW_PROFILE'}
                } else {
                    user.remove();
                    userInformation.remove();
                    return {status: 200, message: 'ERROR_NOT_SAVE_CONFIGURATION'}
                }
            } else {
                user.remove();
                return {status: 200, message: 'ERROR_NOT_SAVE_INFORMATION'}
            }
        } else {
            return {status: 200, message: 'ERROR_EMAIL_NOT_FREE'}
        } 
    }
}
