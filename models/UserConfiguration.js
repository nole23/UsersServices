const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserConfigurationSchema = new Schema({
    localization: {
        type: String
    },
    thems: {
        type: String
    },
    whoCanSeeProfile: {
        type: String
    },
    whoCanSendMessage: {
        type: String
    },
    online: {
        type: Boolean
    },
    search: {
        location: [{
            type: String
        }]
    },
    profile: {
        birdthDay: {
            type: Boolean
        },
        jab: {
            type: Boolean
        },
        address: {
            type: Boolean
        },
        location: {
            type: Boolean
        },
        newPublication: {
            type: String
        },
        publicationComment: {
            type: String
        },
        newPicturShow: {
            type: String
        }
    },
    chat: {},
    navigatInfo: {}
});

module.exports = mongoose.model('UserConfiguration', UserConfigurationSchema);

