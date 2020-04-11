const express = require('express');
const router = express.Router();
const Auth = require('../meddlewares/auth.js');
const userImpl = require('../function/userImpl.js');

router.use('/', Auth.isLogged);
router
    /**
     * Method for get all chat where one user
     */
    .get('/', function(req, res) {
        res.status(200)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment;filename=`)
        res.setHeader('Access-Control-Allow-Origin','*')
        return res.send(userImpl.userDTO(res.locals.currUser))
    })
module.exports = router;