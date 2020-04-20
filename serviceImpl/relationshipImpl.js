var User = require('../models/user.js')
var Relationship = require('../models/relationships.js');

module.exports = {
  listAllFriends: async function(user) {
    return User.findById(user._id)
      .populate('friends')
      .exec()
      .then((friends) => {
        return friends.friends;
      })
      .catch((err) => {
        return null;
      });
  },
  isStatusSend: async function(requester, responder) {
    return Relationship.findOne({requester: requester, responder: responder})
      .exec()
      .then((res) => {
        if (res == null) return true;
        return false;
      })
      .catch((err) => {
        return false;
      })
  },
  getStatusRelationship: async function(requester_id, responser_id) {
    return Relationship.findOne({requester: requester_id, responder: responser_id})
      .exec()
      .then((res) => {
        if (res == null) return false;
        return true;
      })
  },
  delete: async function(requester_id, responser_id) {
    return Relationship.findOne({requester: requester_id, responder: responser_id})
      .exec()
      .then(res => {
        if (res == null) return false;
        res.remove();
        return true;
      })
      .catch(err => {
        return false
      })
  },
  deleteByReqRes: function(requester_id, responser_id) {
    return Relationship.findOne({requester: requester_id, responder: responser_id})
      .exec()
      .then(res => {
        if (res == null) return false;
        res.remove();
        return true;
      })
      .catch(err => {
        return false
      })
  },
  requestedOrResponder: async function(me) {
    return Relationship.find({$or: [{ 'requester': me._id },{ 'responder': me._id }]})
      .exec()
      .then(data => {
          return {status: 200, message: data}
      })
      .catch(err => {
        return {status: 404, message: 'ERROR_SERVER'}
      })
  },
  responder: async function(me) {
    return Relationship.find({responder: me._id})
      .exec()
      .then(data => {
        return {status: 200, message: data}
      })
      .catch(err => {
        return {status: 404, message: 'ERROR_SERVER'}
      })
  }
}

