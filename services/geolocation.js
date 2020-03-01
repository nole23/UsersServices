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
    .get('/', function(req, res) {
        openGeocoder()
            .geocode('novi sad')
            .end((err, res) => {
                console.log(res[0])
                console.log(res[0].geojson)
            })
        return res.status(200).send('Router is life')
    })
    .post('/', function(req, res) {
        var geolocation = req.body;
        var me = res.locals;      
        userImpl.setNewCordinate(geolocation, me);
    })


module.exports = router;