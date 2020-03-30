'use static'

var options = {
    fontFamili: 'Ariel',
    fontSize: {
        h4: 25,
        h3: 15
    },
    privateOptions: {
        localization: 'en',
        thems: 'dark',
        whoCanSeeProfile: 'all', // all, frends, never
        whoCanSendMessage: 'all', // all, frends
        online: true, // true - online kad dodjem, false - offline za sve
        search: {
            location: []
        },
        profile: {
            birdthDay: true,
            jab: true,
            address: true,
            location: true,
            newPublication: 'all',
            publicationComment: 'all',
            newPicturShow: 'all'
        },
        chat: {}
    }
}

module.exports = options;