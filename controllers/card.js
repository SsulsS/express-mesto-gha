const Card = require('../models/card');
const {
  NOT_FOUND_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  INCORRECT_DATA_ERROR_CODE,
} = require('../utils/constants');

const USER_REF = [{ path: 'likes', model: 'user' }];

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (e) {
    res.status(DEFAULT_ERROR_CODE).json({
      message: 'Не удалось получить карточки',
    });
  }
};

module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const card = await Card.create({ name, link, owner: req.user._id });

    res.send({
      message: 'Карточка успешно создана',
    });
  } catch (e) {
    if (e.name === 'ValidationError') {
      res.status(INCORRECT_DATA_ERROR_CODE).json({
        message: 'Переданы не валидные данные'
      });
      return;
    }
    res.status(DEFAULT_ERROR_CODE).json({
      message: 'Не удалось создать карточку',
    });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) {
      return res.status(NOT_FOUND_ERROR_CODE).json({
        message: 'Карточка не найдена',
      });
    }
    const cardDelete = await Card.findByIdAndRemove(req.params.cardId);
    res.send({
      message: 'Карточка удалена',
    });
  } catch (e) {
    if (e.name === 'CastError') {
      res.status(INCORRECT_DATA_ERROR_CODE).json({
        message: 'Переданы не валидные данные'
      });
      return;
    }
    res.status(DEFAULT_ERROR_CODE).json({
      message: 'Не удалось удалить карточку',
    });
  }
};

const handleCardLike = async (req, res, options) => {
  try {
    const action = options.addLike ? '$addToSet' : '$pull';

    const updatedCard = await Card.findOneAndUpdate(
      req.params.cardId,
      { [action]: { likes: req.user._id } },
      { new: true },
    ).populate(USER_REF);

    if (!updatedCard) {
      return res.status(NOT_FOUND_ERROR_CODE).json({
        message: 'Карточка не найдена',
      });
    }

    res.send(updatedCard);
  } catch (e) {
    if (e.name === 'CastError') {
      res.status(INCORRECT_DATA_ERROR_CODE).json({
        message: 'Переданы не валидные данные'
      });
      return;
    }
    res.status(DEFAULT_ERROR_CODE).json({
      message: 'Не удалось изменить карточку',
    });
  }
};

module.exports.likeCard = (req, res) => {
  handleCardLike(req, res, { addLike: true });
};

module.exports.dislikeCard = (req, res) => {
  handleCardLike(req, res, { addLike: false });
};
