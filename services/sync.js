const express = require('express');
const router = express.Router();
var Auth = require('../meddlewares/auth.js');

router.use('/', Auth.isLogged);
router
    /**
     * Method for get all chat where one user
     */
    .get('/', function(req, res) {
        console.log('upao u sink')
        res.status(200)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment;filename=`)
        res.setHeader('Access-Control-Allow-Origin','*')
        return res.send(res.locals.currUser)
    })
module.exports = router;