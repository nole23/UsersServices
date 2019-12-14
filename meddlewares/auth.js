var jwt = require('jwt-simple');
var User = require('../models/user.js');

exports.isLogged = function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['authorization'];
	if (!token) {
			res.json({ success: false, msg: "no token provided" });
		}
	else {

			var decoded = jwt.decode(token, 'XWSMeanDevelopment');
			//get user Id
			var currentId = decoded._id;
			User.findOne({_id:currentId},function(err,user){
				if(err || !user)
				{
					res.json({ success: false, msg: "Something wrong with your token" });
				}

				else {
					//put current user to res.locals
					res.locals = decoded;
					res.locals.currUser = user;
					//console.log(user);
					next();
				}
			});

		}
};
