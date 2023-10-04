const userRoutes = require('express').Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUserName,
  updateUserAvatar
} = require('../controllers/user');

userRoutes.get('/', getUsers);
userRoutes.get('/:id', getUser);
userRoutes.post('/', createUser);
userRoutes.patch('/me', updateUserName);
userRoutes.patch('/me/avatar', updateUserAvatar);

module.exports = userRoutes;
