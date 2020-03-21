var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PublicationSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    location: {
        corrdinate: {
            latitude: {
                type: String,
                default: undefined
            },
            longitude: {
                type: String,
                default: undefined
            },
            accuracy:  {
                type: String,
                default: undefined
            }
        },
        address: {
            road: {
                type: String,
                default: undefined
            },
            neighbourhood: {
                type: String,
                default: undefined
            },
            city: {
                type: String,
                default: undefined
            },
            country: {
                type: String,
                default: undefined
            }
        }
    },
    type: {
        type: String,
        default: undefined
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    datePublish: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        dateComent: {
            type: Date,
            default: Date.now
        },
        text: {
            type: String
        }
    }],
    showPublication: {
        removeStatus: {
            type: Boolean,
            default: false
        },
        justFriends: {
            type: Boolean,
            default: false
        },
        noFriendShow: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }
});

module.exports = mongoose.model('Publication', PublicationSchema);