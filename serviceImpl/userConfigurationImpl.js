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
            // {name: 'Oblast pretrage', type: 'String', idData: ['search', 'location', 'region'], idName: 'search', selectionParameter: null, value: null},
            {name: 'Broj prikaza po strani', type: 'Number', idData: ['numberOfData'], idName: 'numberOfData', selectionParameter: null, value: item.numberOfData !== undefined ? item.numberOfData : 20},
            // {name: 'Koga', type: 'Select', idData: ['search', 'location', 'type'], idName: item.search.location[0], selectionParameter: ['women', 'men']},
            {name: 'Ko moze videti slike', type: 'Select', idData: ['profile', 'newPicturShow', 'type'], idName: 'public', selectionParameter: ['all', 'nothing'], value: item.profile.newPicturShow},
            {name: 'Jezik', type: 'String', idData: ['localization', 'language'], idName: 'languag', selectionParameter: null, value: item.localization},
            // {name: 'Tema', type: 'Select', idData: ['thems', 'type'], idName: item.thems, selectionParameter: ['dark']},
            // {name: 'Ko moze videti profil', type: 'Select', idData: ['whoCanSeeProfile', 'type'], idName: item.whoCanSeeProfile, selectionParameter: ['all', 'nothing']},
            // {name: 'Ko moze poslati poruku', type: 'Select', idData: ['whoCanSendMessage', 'type'], idName: item.whoCanSendMessage, selectionParameter: ['all', 'nothing']},
            // {name: 'Prikazati status online', type: 'Select', idData: ['online', 'type'], idName: item.onlien, selectionParameter: ['online', 'offline']},
            {name: 'Prikazati datum rodjenja', type: 'Boolean', idData: ['profile', 'birdthDay', 'type'], idName: 'birdthDay', selectionParameter: null, value: item.profile.birdthDay},
            {name: 'Prikazati zanimanje', type: 'Boolean', idData: ['profile', 'jab', 'type'], idName: 'jab', selectionParameter: null, value: item.profile.jab},
            {name: 'Prikazati adresu', type: 'Boolean', idData: ['profile', 'address', 'type'], idName: 'address', selectionParameter: null, value: item.profile.address},
            {name: 'Prikazati lokaciju', type: 'Boolean', idData: ['profile', 'location', 'type'], idName: 'location', selectionParameter: null, value: item.profile.location},
            // {name: 'Prikazati lokaciju', type: 'Select', idData: ['profile', 'location', 'type'], idName: item.profile.location, selectionParameter: ['all', 'nothing']},
            {name: 'Ko moze videti novu objavu', type: 'Select', idData: ['profile', 'newPublication', 'type'], idName: 'newPublication', selectionParameter: ['all', 'friends', 'nothing'], value: item.profile.newPublication},
            // {name: 'Ko moze komentarisati objavu', type: 'Select', idData: ['profile', 'publicationComment', 'type'], idName: item.profile.publicationComment, selectionParameter: ['all', 'friends', 'nothing']},

        ]
        return options
    }
}