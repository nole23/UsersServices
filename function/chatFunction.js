const userImpl = require('./userImpl.js');

module.exports = {
    chatDTO: function(data) {
        var resData = {
            _id: data._id,
            dateOfCreate: data.dateOfCreate,
            participants: []
        }
        data.participants.forEach(element => {
            resData.participants.push(userImpl.userDTO(element))
        });
        return resData;
    }
}