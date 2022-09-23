var express = require('express');
var router = express.Router();
const { index, inject } = require('./indexController');

router.get('/', index);
router.post('/inject', inject)

module.exports = router;
