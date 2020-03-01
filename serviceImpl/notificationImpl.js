var Notification = require('../models/notification.js');
var userImpl = require('../function/userImpl.js');

module.exports = {
    // Prijatelj sam ja, a vlasnik je moj prijatelj
    // Sam sebi kad nesto uradim nista se ne desava 
    addNotification: function(friend, me, type = null, publication = null, cordinate = null, image = null) {
        if (friend.toString() != me.toString()) {
            var newNotification = new Notification();
        
            newNotification.owner = me;
            newNotification.friend = friend;
            newNotification.type = type == null ? 'noStructur' : type;
            newNotification.publication = publication;
            newNotification.cordinate = cordinate;
            newNotification.image = image;
    
            newNotification.save();
        }
    },
    getAllNotification: async function(me, limit, page) {
        return Notification.find({owner: me.currUser._id})
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
                        dateNotification: element['dateNotification']
                    });
                });
                return {status: 200, message: ress};
            })
            .catch((err) => {
                return {status: 404, message: 'server error'}
            })

    }
}