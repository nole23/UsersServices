var User = require('../models/user.js');
var UserConfiguration = require('../models/UserConfiguration.js');

module.exports = {

    save: async function(userConfiguration) {
        var newUserConfiguration = new UserConfiguration(userConfiguration);
        return await newUserConfiguration.save()
            .then(res => {
                return true;
            })
            .catch(err => {
                return false;
            })
    },
    optionsDTO: function(item) {
        var options = [
            {name: 'Oblast pretrage', type: 'String', idData: ['search', 'location', 'region'], idName: item.search.location[1], selectionParameter: null},
            // {name: 'Koga', type: 'Select', idData: ['search', 'location', 'type'], idName: item.search.location[0], selectionParameter: ['women', 'men']},
            // {name: 'Ko moze vidjeti slike', type: 'Select', idData: ['profile', 'newPicturShow', 'type'], idName: item.profile.newPicturShow, selectionParameter: ['all', 'friends', 'nothing']},
            {name: 'Jezik', type: 'String', idData: ['localization', 'language'], idName: item.localization, selectionParameter: null},
            // {name: 'Tema', type: 'Select', idData: ['thems', 'type'], idName: item.thems, selectionParameter: ['dark']},
            // {name: 'Ko moze videti profil', type: 'Select', idData: ['whoCanSeeProfile', 'type'], idName: item.whoCanSeeProfile, selectionParameter: ['all', 'nothing']},
            // {name: 'Ko moze poslati poruku', type: 'Select', idData: ['whoCanSendMessage', 'type'], idName: item.whoCanSendMessage, selectionParameter: ['all', 'nothing']},
            // {name: 'Prikazati status online', type: 'Select', idData: ['online', 'type'], idName: item.onlien, selectionParameter: ['online', 'offline']},
            // {name: 'Prikazati datum rodjenja', type: 'Select', idData: ['profile', 'birdthDay', 'type'], idName: item.profile.birdthDay, selectionParameter: ['all', 'nothing']},
            // {name: 'Prikazati zanimanje', type: 'Select', idData: ['profile', 'jab', 'type'], idName: item.profile.jab, selectionParameter: ['all', 'nothing']},
            // {name: 'Prikazati adresu', type: 'Select', idData: ['profile', 'address', 'type'], idName: item.profile.address, selectionParameter: ['all', 'nothing']},
            // {name: 'Prikazati lokaciju', type: 'Select', idData: ['profile', 'location', 'type'], idName: item.profile.location, selectionParameter: ['all', 'nothing']},
            // {name: 'Ko moze videti novu objavu', type: 'Select', idData: ['profile', 'newPublication', 'type'], idName: item.profile.newPublication, selectionParameter: ['all', 'friends', 'nothing']},
            // {name: 'Ko moze komentarisati objavu', type: 'Select', idData: ['profile', 'publicationComment', 'type'], idName: item.profile.publicationComment, selectionParameter: ['all', 'friends', 'nothing']},

        ]
        return options
    }
}