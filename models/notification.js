const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    friend: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        default: undefined
    },
    publication: {
        type: Schema.Types.ObjectId,
        ref: 'Publication',
        default: undefined
    },
    cordinate: {
        myCorrdinate: {
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
        friendCorrdinate: {
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
        }
    },
    image: {
        _id_image: {
            type: String,
            default: undefined
        },
        link_image: {
            type: String,
            default: undefined
        }
    },
    dateNotification: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);