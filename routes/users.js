const userRoutes = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const { validateEmail } = require('../errors/validation-error');

const {
  getUser,
  updateUser,
  createUser,
  login,
} = require('../controllers/users');

userRoutes.get('/users/me', auth, getUser);

userRoutes.patch('/users/me',
  celebrate({
    body: Joi.object()
      .keys({
        email: Joi.string().required().custom(validateEmail),
        name: Joi.string().required(),
      }),
  }), auth, updateUser);

userRoutes.post('/signin',
  celebrate({
    body: Joi.object()
      .keys({
        email: Joi.string().required().custom(validateEmail),
        password: Joi.string().required(),
      })
      .unknown(true),
  }), login);

userRoutes.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail),
      password: Joi.string().required(),
    }).unknown(true),
  }),
  createUser,
);

module.exports = userRoutes;
