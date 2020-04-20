var jwt = require('jwt-simple');
var User = require('../models/user.js');
var userImpl = require('../function/userImpl.js');

exports.isLogged = function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['authorization'];
	if (!token) {
		res.json({ success: false, msg: "no token provided" });
	} else {

		var decoded = jwt.decode(token, 'XWSMeanDevelopment');
		var currentId = decoded._id;
		User.findOne({_id:currentId})
			.populate('otherInformation')
			.populate('friends')
			.exec()
			.then((user) => {
				res.locals = decoded;
				res.locals.currUser = user;
				next();

			})
			.catch((err) => {
				res.json({ success: false, msg: "Something wrong with your token" });
			})
		}
};
