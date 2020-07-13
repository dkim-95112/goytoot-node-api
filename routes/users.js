const express = require('express');
const router = express.Router();
const {
  list,
  login,
  getsession,
  postsession,
  deletesession,
  signup,
  sendmail,
} = require('../controllers/users');
router.get('/', list);
router.get('/session', getsession)
router.post('/session', postsession)
router.delete('/session', deletesession)
router.post('/login', login)
router.post('/signup', signup)
router.post('/sendmail', sendmail)
module.exports = router;
