const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * listFriends: [{User: {...}}, {User: {...}}, ...]
 */
const UserFriendsSchema = new Schema({
    listFriends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('UserFriends', UserFriendsSchema);