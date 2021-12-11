const NotFoundError = require('../errors/notFound-error');

module.exports = (req, res, next) => {
  next(new NotFoundError('Запрашиваемая страница не найдена'));
};
