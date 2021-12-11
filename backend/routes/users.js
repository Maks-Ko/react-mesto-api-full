const router = require('express').Router();
const { validationUserId, validationUserMe, validationUserAvatar } = require('../middlewares/validation-joi');
const {
  getUsers, updateUser, updateAvatar, getUser,
} = require('../controllers/users');

router.get('/user/me', getUser);

router.get('/users/:userId', validationUserId, getUser);

router.get('/users', getUsers);

router.patch('/users/me', validationUserMe, updateUser);

router.patch('/users/me/avatar', validationUserAvatar, updateAvatar);

module.exports = router;
