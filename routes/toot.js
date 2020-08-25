"use strict";
const express = require('express');
const router = express.Router();
const tootController = require('../controllers/toot');
const userController = require('../controllers/user')
router.get('/', tootController.list);
router.post('/', userController.checkLogin, tootController.insert);
router.delete('/:id', userController.checkLogin, tootController.delete);
module.exports = router;
