const router = require('express').Router();
const { validationCard, validationCardId } = require('../middlewares/validation-joi');
const {
  createCard, getCards, deleteCardId, likesCard, dislikesCard,
} = require('../controllers/cards');

router.post('/cards', validationCard, createCard);

router.get('/cards', getCards);

router.delete('/cards/:cardId', validationCardId, deleteCardId);

router.put('/cards/:cardId/likes', validationCardId, likesCard);

router.delete('/cards/:cardId/likes', validationCardId, dislikesCard);

module.exports = router;
