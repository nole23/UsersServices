const express = require('express');
const router = express.Router();

var Auth = require('../meddlewares/auth.js');
const openGeocoder = require('node-open-geocoder');
const userImpl = require('../serviceImpl/userImpl.js');

router.use('/', Auth.isLogged);
router
    /**
     * Funkcija koja ne radi nista, vrsi se samo provera da li je 
     * ziv ruter
     */
    .get('/:city', function(req, res) {
        var city = req.params.city;
        openGeocoder()
            .geocode(city.toString())
            .end((err, result) => {
                return res.status(200).send({message: result, socket: 'SOCKET_NULL_POINT'});
            })
    })
    .post('/', function(req, res) {
        var geolocation = req.body;
        var me = res.locals;      
        userImpl.setNewCordinate(geolocation, me);
    })


module.exports = router;