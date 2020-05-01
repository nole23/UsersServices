const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    statusProfile:  {
        type: Boolean,
        required: true,
        default: false
    },
    otherInformation: {
        type: Schema.Types.ObjectId,
        ref: 'UserInformation'
    },
    tokenForRestartPassword: {
        type: Number
    },
    friends: {
        type: Schema.Types.ObjectId,
        ref: 'UserFriends'
    }
});

module.exports = mongoose.model('User', UserSchema);