const userRoutes = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const { validateEmail } = require('../errors/validation-error');

const {
  getUser,
  updateUser,
} = require('../controllers/users');

userRoutes.get('/users/me', auth, getUser);

userRoutes.patch('/users/me',
  celebrate({
    headers: Joi.object()
      .keys({
        userid: Joi.string().hex().length(24),
      })
      .unknown(true),
    body: Joi.object()
      .keys({
        password: Joi.string().required(),
        email: Joi.string().required().custom(validateEmail),
        name: Joi.string().required(),
      }),
  }), auth, updateUser);

module.exports = userRoutes;
