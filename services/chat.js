const express = require('express');
const router = express.Router();
var Auth = require('../meddlewares/auth.js');
const chatImpl = require('../serviceImpl/chatImpl.js');

router.use('/', Auth.isLogged);

router
    /**
     * Funkcija koja vraca sve osobe sa kojima mozemo da chatujemo
     */
    .get('/', async function(req, res) {
        var me = res.locals.currUser;

        var data = await chatImpl.getAllChatBayId(me, 20, 0);
        return res.status(data.status).send({message: data.message})
    })
    /**
     * Kreiramo novu listu za chatovanje,
     * Ovo se desava prilikom prihvatanja zahtjeva za prijateljstvo automatski
     * Ili ukoliko zelimo da zapocnemo chat sa nekim ko nam nije prijatelj
     */
    .post('/', async function(req, res) {
        var me = res.locals.chatImpl;
        var listUser = req.body;

        var data = await chatImpl.creatChaters(me, listUser);
        return res.status(data.status).send({message: data.message});
    })
    /**
     * Dodati novog clana u razgovor,
     * ali tako da kada dodamo novog clana kreira se nova chat grupa
     * i pocinje sve iz pocetka
     */
    .put('/', async function(req, res) {

    })
    /**
     * Kad zelimo da izbrisemo prijatelja iz chata, poruke ostaju ali 
     * brise se grupisanje
     * osmisliti da to predje tamo na drugo mjesto da se ne obrise trajno
     */
    .delete('/', async function(req, res) {

    })


module.exports = router;