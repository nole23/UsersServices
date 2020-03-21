var Publication = require('../models/publication.js');
var userImpl = require('../function/userImpl.js');
const notificationImpl = require('../serviceImpl/notificationImpl.js');

var ioc = require('socket.io-client');
var socketc = ioc.connect('https://twoway1.herokuapp.com/', {reconnect: true});

module.exports = {

    getAllPublicationById: async function(id, me_id, limit, page, me) {
        return Publication.find({user_id: id})
            .sort({datePublish: -1})
            .limit(limit)
            .skip(limit * page)
            .populate('comments.user')
            .populate({ 
                path: 'comments.user',
                populate: [{
                 path: 'otherInformation'
                }] 
             })
            .populate('user_id')
            .populate({ 
                path: 'user_id',
                populate: [{
                 path: 'otherInformation'
                }] 
             })
            .exec()
            .then((publications) => {
                if (publications !== null) {
                    var listPublication = [];
                    publications.forEach(item => {
                        if (id.toString() == me_id.toString()) {
                            listPublication.push(this.publicationDTO(item))
                        } else {
                            if (!item.showPublication.removeStatus) {
                                listPublication.push(this.publicationDTO(item))
                            }
                        }
                    })

                    return {status: 200, publication: listPublication}
                }
            })
    },
    publicationDTO: function(item) {
        return {
            _id: item._id,
            user_id: userImpl.userDTO(item.user_id),
            text: item.text,
            image: item.image,
            location: !item.location.corrdinate.latitude ? null : item.location,
            datePublish: item.datePublish,
            likesCount: item.likes.lenght,
            likes: item.likes,
            comments: item.comments,
            type: item.type,
            showPublication: !item.showPublication ? null : item.showPublication
        }
    },
    savePublicaton: async function(user_id, text, image, datePublish, likesCount, likes, comments, address = null, friends = [], type = null) {
        if (!user_id) { 
            console.log('System not found - dont id user')
            return null;
        }
        
        if (!datePublish) {
            datePublish = new Date;
        }

        if (!likesCount) { 
            likesCount = 0;
        }

        if (!likes) { 
            likes = [];
        }

        if (!comments) { 
            comments = [];
        }

        if (!text) { 
            text = null;
        }
        var newPublication = new Publication();
        newPublication.user_id = user_id;
        newPublication.text = text;
        newPublication.image = image;
        newPublication.datePublish = datePublish;
        newPublication.likes = likes;
        newPublication.comments = comments;
        newPublication.location = address;
        newPublication.friends = friends;
        newPublication.type = type;

        newPublication.save();

        socketc.emit('autoPublication-' + user_id, newPublication);
        // TODO Ovo proslediti metodi koja sheruje na sve strane

        return newPublication;
    },
    like: async function(user_id, publication_id, me) {
        return Publication.findById(publication_id)
            .exec()
            .then((publication) => {
                publication.likes.push(me._id);
                publication.save();
                notificationImpl.addNotification(me._id, user_id, 'like', publication._id, null, null)
                return {status: 200, message: ''}
            })
            .catch((err) => {
                return {status: 404, like: ''}
            })
    },
    disLike: async function(user_id, publication_id, me) {
        return Publication.findById(publication_id)
            .exec()
            .then((publication) =>{
                publication.likes.remove(me._id);
                publication.save();
                return {status: 200, message: ''}
            })
            .catch((err) => {
                return {status: 404, like: ''}
            })
    },
    addComment: async function(item, object, me) {
        return Publication.findById(item._id)
            .exec()
            .then(publication => {
                var data = {
                    user: me._id,
                    dateComent: object.dateComent,
                    text: object.text
                }
                publication.comments.push(data);
                publication.save();
                notificationImpl.addNotification(me._id, publication.user_id, 'comment', publication._id, null, null)
                return {status: 200, like: ''}
            })
            .catch((err) => {
                return {status: 404, like: ''}
            })
    },
    showHidePorfile: function(item) {
        Publication.findById(item._id)
        .exec()
        .then(publication => {

            publication.showPublication.justFriends = item.showPublication.justFriends;
            publication.showPublication.removeStatus = item.showPublication.removeStatus;

            publication.save();
            // console.log(publication)
        })
        .catch((err) => {
            return {status: 404, like: ''}
        })
    },
    publicAgain: async function(id, me) {
        return Publication.findById(id)
            .exec()
            .then((publication) => {

                if (publication.user_id.toString() == me._id.toString()) {
                    if (publication != null || publication != undefined) {
                        return {status: 200, message: publication}
                    } else {
                        return {status: 200, message: null}
                    }
                } else {
                    return {status: 404, message: 'permision'}
                }
                
            })
            .catch((err) => {
                return {status: 404, message: 'not save'}
            })
    },
    delete: async function(id, me) {
        return Publication.findById(id)
            .exec()
            .then(publication => {

                if (publication.user_id.toString() == me._id.toString()) {
                    if (publication != null || publication != undefined) {
                        publication.remove();
                        return {status: 200, message: publication}
                    } else {
                        return {status: 200, message: 'error'}
                    }
                } else {
                    return {status: 404, message: 'permision'}
                }
            })
            .catch((err) => {
                return {status: 404, message: 'error'}
            })
    }
}