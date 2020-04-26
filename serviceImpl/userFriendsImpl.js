var User = require('../models/user.js');
var UserFriends = require('../models/UserFriends.js');
var userImpl = require('../function/userImpl.js');

module.exports = {
    saveFriend: async function(_id_collect, _id_friend) {
        return UserFriends.findById(_id_collect)
            .exec()
            .then((res) => {
                if (!res) return {status: 404, message: 'ERROR_NOT_FIND_ITEM'};
                res.listFriends.push(_id_friend);

                res.save();
                return {status: 200, message: 'SUCCESS_RELATIONSHIP_IS_SAVE'};
            })
            .catch((err) => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    delteFriends: function(_id_collect, _id_friend) {
        return UserFriends.findOne({_id: _id_collect})
            .exec()
            .then((res) => {
                res.listFriends.remove(_id_friend);
                res.save();
                return true;
            })
            .catch((err) => {
                return false;
            })
    },
    getListFriends: async function(_id, limit, page) {
        return UserFriends.findOne({_id: _id})
            .limit(limit)
            .skip(limit * page)
            .populate('listFriends')
            .populate({ 
                path: 'listFriends',
                populate: [{
                 path: 'otherInformation',
                 model: 'UserInformation'
                }] 
             })
            .exec()
            .then((res) => {
                if (!res) return [];
                
                var list = [];
                res.listFriends.forEach((element) => {
                    list.push(userImpl.userDTO(element));
                });

                return list;
            })
            .catch((err) => {
                return []
            })
    },
    getModifyListFriends: async function(listOnlineFriends, limit, me) {
        var listFriend = [];
        
        listOnlineFriends.forEach(element => {
            listFriend.push(element.user._id)
        })
        return UserFriends.findOne({_id: me.friends})
            .limit(limit)
            .populate('listFriends')
            .populate({ 
                path: 'listFriends',
                populate: [{
                 path: 'otherInformation',
                 model: 'UserInformation'
                }] 
             })
            .exec()
            .then((friends) => {
                listResponse = [];
                friends = friends.listFriends.filter(function(val) {
                    return listFriend.indexOf(val._id.toString()) == -1;
                });
                return friends;
            })
            .catch((err) => {
                return [];
            })
    }
}