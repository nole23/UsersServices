const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserInformationSchema = new Schema({
    sex: {
        type: String,
        enum: ["men", "women", "unidentified"],
        default: "unidentified"
    },
    publicMedia: {
        profileImage: {
            type: String,
            required: false
        },
        coverPhoto:  {
            type: String,
            required: false
        },
    },
    dateOfCreation:  {
        type: String,
        required: true,
        default: new Date()
    },
    dateOfBirth:  {
        type: String,
        required: false
    },
    adress: {
        country: {
            type: String,
            required: false
        },
        region: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
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
        }
    },
    jobs: {
        name: {
            type: String,
            required: false
        },
        places: {
            type: String,
            required: false
        },
        nameCompany: {
            type: String,
            required: false
        }
    },
    myText: {
        type: String,
        required: false
    },
    verificationToken: {
        type: String
    },
    options: {
        type: Schema.Types.ObjectId,
        ref: 'UserConfiguration'
    }
});

module.exports = mongoose.model('UserInformation', UserInformationSchema);