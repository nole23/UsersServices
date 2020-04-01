var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    dateOfCreate: {
        type : Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Chat', ChatSchema);