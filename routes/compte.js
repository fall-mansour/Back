const express = require('express');
const router = express.Router();
const { creerCompte } = require('../controllers/compte.controller');

router.post('/creer', creerCompte);

module.exports = router;
