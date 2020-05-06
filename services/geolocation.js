const express = require('express');
const router = express.Router();

var Auth = require('../meddlewares/auth.js');
const openGeocoder = require('node-open-geocoder');
const userImpl = require('../serviceImpl/userImpl.js');

router.use('/', Auth.isLogged);
router
    /**
     * Find Location by name city
     */
    .get('/:city', function(req, res) {
        var city = req.params.city;
        openGeocoder()
            .geocode(city.toString())
            .end((err, result) => {
                return res.status(200).send({message: result, socket: 'SOCKET_NULL_POINT'});
            })
    })
    /**
     * Setn new location
     */
    .post('/', function(req, res) {
        var geolocation = req.body;
        var me = res.locals;   
        console.log('dosao ovde ne znam ')   
        userImpl.setNewCordinate(geolocation, me);
        return res.status(200).send({message: 'SUCCESS_SAVE_NEW_LOCATION', socket: 'SOCKET_NULL_POINT'})
    })


module.exports = router;