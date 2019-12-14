const express = require('express');
const router = express.Router();

router
    /**
     * Funkcija koja ne radi nista, vrsi se samo provera da li je 
     * ziv ruter
     */
    .get('/', function(req, res) {
        
        return res.status(200).send('Router is life')
    })


module.exports = router;