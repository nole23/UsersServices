const { ObjectId } = require('mongodb');
const Chat = require('../models/chat.js');
const chatFunction = require('../function/chatFunction.js');

module.exports = {
    getAllChatBayId: async function(user, limit, page) {
        return Chat.find({participants: {"$all": [user._id]}})
            .sort({dateOfCreate: -1})
            .limit(limit)
            .skip(limit * page)
            .populate('participants')
            .populate({ 
                path: 'participants',
                populate: [{
                    path: 'otherInformation'
                }] 
             })
            .exec()
            .then((list) => {
                var data = []
                list.forEach(element => {
                    data.push(chatFunction.chatDTO(element))
                })
                return {status: 200, message: data};
            })
            .catch((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    getChatById: async function(id) {
        return Chat.findById(id)
            .populate('participants')
            .populate({ 
                path: 'participants',
                populate: [{
                    path: 'otherInformation'
                }] 
            })
            .exec()
            .then((chat) =>{
                return {status: 200, message: chatFunction.chatDTO(chat)};
            })
            .chat((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'};
            })
    },
    creatChaters: async function(me, users) {
        var participants = []
        participants.push(ObjectId(me._id))
        var newParticipants = new Chat();
        newParticipants.participants.push(me._id);

        users.forEach(element => {
            const _id = ObjectId(element.toString());
            participants.push(_id)
            newParticipants.participants.push(element);
        });

        var isChat = await isChats(participants)
        if (isChat) {
            newParticipants.save();
        }
        return {status: 200, message: 'CREATE_PARTICIPANTS'}
    }
}

isChats = async function(listUser) {
    return Chat.findOne({participants: {"$all": listUser}})
        .exec()
        .then(item => {
            if (item != null || item != undefined) {
                return false;
            } else {
                return true;
            }
        })
        .catch(err => {
            return true;
        })
}