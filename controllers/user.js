const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  NOT_FOUND_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE, JWT_SECRET,
} = require('../utils/constants');
const BadRequestError = require('../utils/errors/badRequestError');
const NotFoundError = require('../utils/errors/notFoundError');
const ConflictError = require('../utils/errors/conflictError');

module.exports.getUsers = async (req, res, next) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (e) {
    next(e);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(NOT_FOUND_ERROR_CODE).json({
        message: 'передан неверный логин или пароль',
      });
    }

    res.send(user);
  } catch (e) {
    if (e.name === 'CastError') {
      next(new BadRequestError('На сервере произошла ошибка'));
    } else {
      next(e);
    }
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    });
    res.send({
      message: 'Пользователь успешно создан',
    });
  } catch (e) {
    if (e.code === 11000) {
      next(new ConflictError('при регистрации указан email, который уже существует на сервере'));
    } else if (e.name === 'CastError') {
      next(new BadRequestError('На сервере произошла ошибка'));
    } else {
      next(e);
    }
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.checkUser(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.send(token);
  } catch (e) {
    next(e);
  }
};

module.exports.updateUserName = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      {
        new: true,
        runValidators: true,
      },
    );
    res.send(updatedUser);
  } catch (e) {
    if (e.name === 'ValidationError') {
      next(new BadRequestError(e.message));
    } else {
      next(e);
    }
  }
};

module.exports.updateUserAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    );
    res.send(updatedUser);
  } catch (e) {
    if (e.name === 'ValidationError') {
      next(new BadRequestError(e.message));
    } else {
      next(e);
    }
  }
};

module.exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });

    res.send(user);
  } catch (e) {
    return next(e);
  }
};
