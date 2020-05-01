var Publication = require('../models/publication.js');
var userImpl = require('../function/userImpl.js');
const notificationImpl = require('../serviceImpl/notificationImpl.js');

module.exports = {

    getAllPublicationById: async function(user, me_id, limit, page, isFriend) {
        return Publication.find({user_id: user._id, 'showPublication.removeStatus': {$ne: true}})
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
            .exec()
            .then((publications) => {
                if (publications !== null) {
                    var listPublication = [];
                    publications.forEach(item => {
                        if (!item.showPublication.removeStatus) {
                            item.user_id = user;
                            if (!item.showPublication.justFriends) {
                                listPublication.push(this.publicationDTO(item, true));
                            } else {
                                if (isFriend != -1) {
                                    listPublication.push(this.publicationDTO(item, true));
                                }
                            }
                        }
                    })
                    return {status: 200, publication: listPublication}
                }
            })
    },
    getAllPublication: async function(me, limit, page) {
        return Publication.find({user_id: me._id})
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
        .exec()
        .then((publications) => {
            if (publications !== null) {
                var listPublication = [];
                publications.forEach(item => {
                    item.user_id = me;
                    listPublication.push(this.publicationDTO(item, false));
                })
                return {status: 200, publication: listPublication}
            }
        })
    },
    getPublicByPicture: async function(id, me) {
        return Publication.findOne({img_id: id})
            .populate('user_id')
            .populate({ 
                path: 'user_id',
                populate: [{
                 path: 'otherInformation'
                }] 
             })
            .exec()
            .then((publication) => {
                if (publication !== null) {
                    if (publication.user_id._id.toString() == me._id.toString()) {
                        return {status: 200, message: this.publicationDTO(publication, true)};
                    } else {
                        return {status: 200, message: 'ERROR_TYPE_PREMISION'};
                    }
                } else {
                    return {status: 200, message: 'ERROR_TYPE_NULL'};
                }
            })
            .catch((err) =>{
                return {status: 503, message: 'ERROR_TYPE_SERVER'};
            })
    },
    publicationDTO: function(item, type) {
        var object = {
            _id: item._id,
            text: item.text,
            image: item.image,
            location: !item.location.corrdinate.latitude ? null : item.location,
            datePublish: item.datePublish,
            likesCount: item.likes.lenght,
            likes: item.likes,
            comments: item.comments,
            type: item.type,
            showPublication: !item.showPublication ? null : item.showPublication,
            img_id: !item.img_id ? null : item.img_id
        }
        if (type) {
            object.user_id = userImpl.userFriendDTO(item.user_id, false)
        } else {
            object.user_id = userImpl.userDTO(item.user_id);
        }
        return object;
    },
    savePublicaton: async function(
        user_id,
        text,
        image,
        datePublish,
        likesCount,
        likes,
        comments,
        address = null,
        friends = [],
        type = null,
        img_id = null
    ) {
        if (!user_id) { 
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
        newPublication.img_id = img_id;

        newPublication.save();

        return newPublication;
    },
    like: async function(user_id, publication_id, me) {
        return Publication.findById(publication_id)
            .exec()
            .then((publication) => {
                publication.likes.push(me._id);
                publication.save();
                notificationImpl.addNotification(me, user_id, 'like', publication._id, null, null)
                return {status: 200, message: 'SUCCESS_SAVE'}
            })
            .catch((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'}
            })
    },
    disLike: async function(user_id, publication_id, me) {
        return Publication.findById(publication_id)
            .exec()
            .then((publication) =>{
                publication.likes.remove(me._id);
                publication.save();
                return {status: 200, message: me}
            })
            .catch((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'}
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
                return {status: 200, message: notificationImpl}
            })
            .catch((err) => {
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'}
            })
    },
    showHidePorfile: function(item) {
        Publication.findById(item._id)
        .exec()
        .then(publication => {

            publication.showPublication.justFriends = item.showPublication.justFriends;
            publication.showPublication.removeStatus = item.showPublication.removeStatus;

            publication.save();
        })
        .catch((err) => {
            return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'}
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
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'}
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
                return {status: 200, message: 'ERROR_SERVER_NOT_FOUND'}
            })
    }
}