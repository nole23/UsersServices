const Chat = require('../models/chat.js');
const chatFunction = require('../function/chatFunction.js');

module.exports = {
    getAllChatBayId: async function(user, limit, page) {
        return Chat.find({participants: {"$all": [user._id]}})
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
    creatChaters: async function(me, users) {
        var newParticipants = new Chat();
        newParticipants.participants.push(me._id);

        users.forEach(element => {
            newParticipants.participants.push(element);
        });

        newParticipants.save();
        return {status: 200, message: 'CREATE_PARTICIPANTS'}
    }
}

