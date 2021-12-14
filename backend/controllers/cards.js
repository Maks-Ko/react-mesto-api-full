const Card = require('../models/card');
const ValidationError = require('../errors/validation-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/notFound-error');

// создаёт карточку
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные'));
      }
      next(err);
    });
};

// возвращает все карточки
const getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(next);
};

// удаляет карточку по id
const deleteCardId = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => new PropertyError('NotFound', 'Объект не найден'))
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Запрещено, нет прав');
      } else {
        Card.findByIdAndRemove(req.params.cardId)
          .then((cardDelete) => res.send({ data: cardDelete }))
          .catch((err) => {
            if (err.name === 'ReferenceError') {
              next(new NotFoundError('Объект не найден'));
            }
            if (err.name === 'CastError') {
              next(new ValidationError('Переданы некорректные данные'));
            }
            next(err);
          });
      }
    })
    .catch(next);
};

// поставить лайк карточке
const likesCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => new PropertyError('NotFound', 'Объект не найден'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ReferenceError') {
        next(new NotFoundError('Объект не найден'));
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные'));
      }
      next(err);
    });
};

// удалить лайк карточки
const dislikesCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => new PropertyError('NotFound', 'Объект не найден'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ReferenceError') {
        next(new NotFoundError('Объект не найден'));
      }
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные'));
      }
      next(err);
    });
};

module.exports = {
  createCard, getCards, deleteCardId, likesCard, dislikesCard,
};
