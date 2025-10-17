const express = require('express');
const router = express.Router();
const pubaidesCtrl = require('../controllers/pubaides.controller');

router.get('/', pubaidesCtrl.getAides);           // OK
router.get('/categories', pubaidesCtrl.getCategories); // OK

// POST → uniquement le controller, l’upload est géré à l’intérieur
router.post('/', pubaidesCtrl.addObjetAide);

router.delete('/:id', pubaidesCtrl.deleteObjetAide);

module.exports = router;
