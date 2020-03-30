var User = require('../models/user.js');
var UserInformation = require('../models/userInformation.js');

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
    }
}