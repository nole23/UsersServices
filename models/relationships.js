const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RealtionshipSchema = new Schema({
    // Onaj koji je poslao zahtjev
    requester: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Onom kome se salje zahtjev
    responder: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesteDate: {
        type: Date,
        default: Date.now
    }
});

RealtionshipSchema.index({requester: 1, responder: 1}, {unique: true});
module.exports = mongoose.model('Relationship', RealtionshipSchema);

