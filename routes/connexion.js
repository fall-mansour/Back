const express = require('express');
const router = express.Router();
const { seConnecter } = require('../controllers/connexion.controller');

router.post('/', seConnecter);

module.exports = router;
