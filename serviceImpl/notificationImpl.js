var Notification = require('../models/notification.js');
var userImpl = require('../function/userImpl.js');
var relationshipImpl = require('../serviceImpl/relationshipImpl.js');

module.exports = {
    // Prijatelj sam ja, a vlasnik je moj prijatelj
    // Sam sebi kad nesto uradim nista se ne desava 
    addNotification: function(friend, me, type = null, publication = null, cordinate = null, image = null) {
        if (friend._id.toString() != me._id.toString()) {

            if (type !== 'visitor') {
                var newNotification = new Notification();
        
                newNotification.owner = me;
                newNotification.friend = friend;
                newNotification.type = type == null ? 'noStructur' : type;
                newNotification.publication = publication;
                newNotification.cordinate = cordinate;
                newNotification.image = image;
        
                newNotification.save();
            } else {
                Notification.find({friend: friend._id, owner: me._id, type: 'visitor'})
                    .sort({dateNotification: -1})
                    .limit(1)
                    .exec()
                    .then((notification => {
                        if (notification.length > 0) {
                            notification.forEach(element => {
                                var date1 = new Date();
                                var date2 = new Date(element.dateNotification);
                                if(date1-date2 > 1440*60*1000){
                                    var newNotification = new Notification();
        
                                    newNotification.owner = me;
                                    newNotification.friend = friend;
                                    newNotification.type = type == null ? 'noStructur' : type;
                                    newNotification.publication = publication;
                                    newNotification.cordinate = cordinate;
                                    newNotification.image = image;
                            
                                    newNotification.save();
                                } else {
                                    console.log('nije vece')
                                }
                            })
                        } else {
                            var newNotification = new Notification();
        
                            newNotification.owner = me;
                            newNotification.friend = friend;
                            newNotification.type = type == null ? 'noStructur' : type;
                            newNotification.publication = publication;
                            newNotification.cordinate = cordinate;
                            newNotification.image = image;
                    
                            newNotification.save();
                        }
                    }))
                    .catch(err => {
                        console.log('Server not save item')
                    })
            }
        }
    },
    getAllNotification: async function(me, limit, page) { 
        return Notification.find({owner: me._id, type: {$ne: 'visitor'}})
            .sort({dateNotification: -1})
            .limit(limit)
            .skip(limit * page)
            .populate({
                path: 'friend',
                populate: [{
                    path: 'otherInformation'
                }] 
             })
            .populate('publication')
            .exec()
            .then((notification) => {
                var ress = []
                notification.forEach(element => {
                    ress.push({
                        owner: element['owner'],
                        friend: userImpl.userDTO(element['friend']),
                        type: element['type'],
                        publication: element['publication'],
                        cordinate: element['cordinate'],
                        image: element['image'],
                        dateNotification: element['dateNotification'],
                        isStatus: element.status
                    });
                });
                return {status: 200, message: ress};
            })
            .catch((err) => {
                return {status: 404, message: 'server error'}
            })
    },
    getAllVisitors: async function(me, limit, page) {
        return Notification.find({owner: me._id, type: {$nin: ['comment', 'like', 'comment']}})
        .sort({dateNotification: -1})
        .limit(limit)
        .skip(limit * page)
        .populate('friend')
        .populate({
            path: 'friend',
            populate: [{
                path: 'otherInformation'
            }] 
         })
        .populate('publication')
        .exec()
        .then((notification) => {
            var ress = []
            notification.forEach(element => {
                ress.push({
                    owner: element['owner'],
                    friend: userImpl.userDTO(element['friend']),
                    type: element['type'],
                    publication: element['publication'],
                    cordinate: element['cordinate'],
                    image: element['image'],
                    dateNotification: element['dateNotification'],
                    isStatus: element.status
                });
            });
            return {status: 200, message: ress};
        })
        .catch((err) => {
            return {status: 404, message: 'server error'}
        })
    },
    getAllRelationshio: async function(me, limit, page) {
        var item = await relationshipImpl.requester(me._id, limit, page);
        var requestList = []
        if (item.length != 0) {
            item.forEach(element => {
                requestList.push({
                    dateNotification: element.requesteDate,
                    friend: userImpl.userFriendDTO(element['requester'], false),
                    type: 'relationship',
                    isStatus: false
                })
            })
        };
        return {status: 200, message: requestList}
    },
    setShowPublic: function(listType, me) {
        return Notification.find({owner: me._id, type: {$nin: listType}})
            .exec()
            .then(notifications => {
                notifications.forEach(element =>{
                    if (!element.status) {
                        element.status = true;

                        element.save();
                    }
                });

                return {status: 200, message: 'SUCCESS_SAVE'}
            })
            .catch(err => {
                return {status: 404, message: 'ERROR_SERVER_NOT_FOUND'}
            })
    },
    statusNotification: async function(user) {
        return Notification.find({owner: user._id, status: false})
            .exec()
            .then(notifications => {
                let status = {
                    isNotificaton: 0,
                    isVisitor: 0
                }
                notifications.forEach(element => {
                    if (element.type == 'visitor') {
                        status.isVisitor = status.isVisitor + 1;
                    } else {
                        status.isNotificaton = status.isNotificaton + 1;
                    }
                })
                return status
            })
            .catch(err => {
                return {isNotificaton: 0, isVisitor: 0}
            })
    }
}