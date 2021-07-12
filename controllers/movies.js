const Movie = require('../models/movie');

const ReqError = require('../errors/req-error');
const ForbiddenError = require('../errors/forb-error');
const NotFoundError = require('../errors/not-found-err');

function getMovies(req, res, next) {
  return Movie.find({})
    .then((movies) => res.status(200).send(movies))
    .catch(next);
}

function createMovie(req, res, next) {
  return Movie.create({ ...req.body })
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ReqError('ошибка валидации'));
      } else {
        next(err);
      }
    });
}

function deleteMovie(req, res, next) {
  const id = req.params.movieId;
  const userId = req.user._id;

  return Movie.findById(id)
    .orFail(new NotFoundError('Карточка не найдена'))
    .then((movie) => {
      if (movie.owner.toString() === userId) {
        return Movie.findByIdAndRemove(id)
          .orFail(new ReqError('Карточка не найдена'))
          .then((data) => {
            res.status(200).send({ data });
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new ReqError('Карточка не найдена'));
            } else {
              next(err);
            }
          });
      }
      return next(new ForbiddenError('Нет прав на удаление карточки'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ReqError('Карточка не найдена'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
