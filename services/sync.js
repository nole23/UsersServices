const express = require('express');
const router = express.Router();
var Auth = require('../meddlewares/auth.js');

router.use('/', Auth.isLogged);
router
    /**
     * Method for get all chat where one user
     */
    .get('/', function(req, res) {
        res.status(200)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment;filename=`)
        return res.send(res.locals.currUser)
    })
module.exports = router;