var User = require('../models/user.js');
var UserInformation = require('../models/userInformation.js');
var UserFunction = require('../function/userImpl.js');

module.exports = {

    getListUser: async function(listFriends, allRequestetOrResponder, limit, page) {
        return User.find({_id: {$nin: listFriends}, statusProfile: {$ne: false}})
            .limit(limit)
            .skip(limit * page)
            .populate('otherInformation')
            .exec()
            .then((users) => {
                var usersList = [];
                users.forEach(element => {
                    var requested = allRequestetOrResponder.find(x => x.responder._id.toString() == element._id.toString());
                    var responder = allRequestetOrResponder.find(x => x.requester._id.toString() == element._id.toString());

                    var isRelationship = false;
                    var isResOrReq = false;
                    if (requested != undefined || responder != undefined) {
                        isRelationship = true;
                    }
                    if (requested != undefined && responder == undefined) {
                        isResOrReq = true;
                    }
                    usersList.push({
                        user: UserFunction.userDTO(element),
                        isRelationship: isRelationship,
                        isResOrReq: isResOrReq,
                        isFriends: false,
                        isMe: false
                    });
                });
                
                return {status: 200, message: usersList};
            })
            .catch((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    searchUser: async function(text, limit, page, me, allRequestetOrResponder, listFriends) {
        return User.find({statusProfile: {$ne: false}})
            .or([
                { username: new RegExp(text, 'i')},
                { firstName: new RegExp(text, 'i')},
                { lastName: new RegExp(text, 'i')},
                { email: new RegExp(text, 'i')}
            ])
            .limit(limit)
            .populate('otherInformation')
            .exec()
            .then((users) => {
                var usersList = [];
                users.forEach(element => {
                    var requested = allRequestetOrResponder.find(x => x.responder._id.toString() == element._id.toString());
                    var responder = allRequestetOrResponder.find(x => x.requester._id.toString() == element._id.toString());
                    var isFriends = listFriends.find(x =>  x == element._id.toString());

                    var isRelationship = false;
                    var isResOrReq = false;
                    if (requested != undefined || responder != undefined) {
                        isRelationship = true;
                    }
                    if (requested != undefined && responder == undefined) {
                        isResOrReq = true;
                    }
                    
                    usersList.push({
                        user: UserFunction.userDTO(element),
                        isRelationship: isRelationship,
                        isResOrReq: isResOrReq,
                        isFriends: isFriends == undefined ? false : true,
                        isMe: me._id.toString() == element._id.toString()
                    });
                });
                
                return {status: 200, usersList: usersList};
            })
            .catch((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    getUserById: async function(_id, me_id) {
        return User.findOne({username: _id})
            .populate('otherInformation')
            .populate('friends')
            .populate({ 
                path: 'friends',
                populate: [{
                 path: 'listFriends'
                }] 
             })
            .exec()
            .then((user) => {
                if (!user) return {status: 200, message: 'ERROR_NOT_FIND_ITEM'};
                let status = false;
                user.friends.listFriends.forEach(element => {
                    
                    if(element._id.toString() === me_id.toString()) {
                        return status = true;
                    }

                })

                return {status: 200, user: UserFunction.userDTO(user), friends: status};
            })
    },
    getIdFrinedsList: async function(_id) {
        
        return User.findOne({_id: _id}, function(err, user) {
            return user.friends;
        })
    },
    editProfile: function(_id, object) {
        return User.findById(_id)
            .exec()
            .then((user) => {
                if (user == null) return false;

                if (object.firstName) user.firstName = object.firstName;
                if (object.lastName) user.lastName = object.lastName;
                user.save();
                return true;
            })
            .catch((err) => {
                return false;
            })
    },
    editInfo: function(_id, object) {
        return UserInformation.findById(_id)
            .exec()
            .then((userInformation) => {
                
                if (!userInformation) return false;

                if (object.sex) userInformation.sex = object.sex;
                if (object.dateOfBirth) userInformation.dateOfBirth = object.dateOfBirth;

                userInformation.save()
                return true
            })
            .catch((err) => {
                return false;
            })
    },
    editPassword: function(_id, object) {
        return User.findById(_id)
            .exec()
            .then((user) => {
                if (!user) return false;

                if (object.password) user.password = object.password;
                if (object.email) user.email = object.email;

                user.save();
                return true;
            })
            .catch((err) => {
                return false;
            })
    },
    editInformation: async function(_id, object) {
        return UserInformation.findById(_id)
            .exec()
            .then((userInformation) => {
                userInformation.sex = !object.sex ? undefined : object.sex;
                userInformation.adress = !object.adress ? undefined : object.adress;
                userInformation.jobs = !object.jobs ? undefined : object.jobs;
                userInformation.myText = !object.myText ? undefined : object.myText;

                userInformation.save();
                
                UserFunction.geolocation(object.adress, _id);
                return true;
                
            })
            .catch((err) => {
                return false;
            })
    },
    setNewCordinate: function(geolocation, me) {
        UserInformation.findById(me.currUser.otherInformation)
        .exec()
        .then((userInformation) => {

            userInformation.adress.corrdinate = geolocation;
            userInformation.save();

            // TODO Dodati notifikaciju koja kaze gdje je 
        })
        .catch((error) => {
            console.log('greska na serveru')
        })
    }
}