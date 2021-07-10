const movieRoutes = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const { validateUrl } = require('../errors/validation-error');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

movieRoutes.get('/movies', auth, getMovies);

movieRoutes.post(
  '/movies',
  celebrate({
    body: Joi.object()
      .keys({
        country: Joi.string().required(),
        director: Joi.string().required(),
        duration: Joi.number().required(),
        year: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required().custom(validateUrl),
        trailer: Joi.string().required().custom(validateUrl),
        nameRU: Joi.string().required(),
        nameEN: Joi.string().required(),
        thumbnail: Joi.string().required().custom(validateUrl),
      })
      .unknown(true),
  }),
  auth,
  createMovie,
);

movieRoutes.delete('/movies/:movieId',
  celebrate({
    params: Joi.object()
      .keys({
        movieId: Joi.string().hex().length(24),
      })
      .unknown(true),
  }), auth, deleteMovie);

module.exports = movieRoutes;
