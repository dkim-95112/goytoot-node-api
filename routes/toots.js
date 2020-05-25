"use strict";
const express = require('express');
const router = express.Router();
const tootController = require('../controllers/toots');
const userController = require('../controllers/users')
router.get('/', tootController.list);
router.post('/', userController.checkAuthHeader, tootController.insert);
router.delete('/:id', userController.checkAuthHeader, tootController.delete);
module.exports = router;
