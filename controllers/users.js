const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const ReqError = require('../errors/req-error');
const AuthError = require('../errors/auth-error');
const ConflictError = require('../errors/conflict-error');

const { NODE_ENV, JWT_SECRET } = process.env;

function getUser(req, res, next) {
  const id = req.headers.userid;

  return User.findById(id)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      user.password = null;
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ReqError('неверно написан ID'));
      } else {
        next(err);
      }
    });
}

function createUser(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ReqError('Email или пароль не могут быть пустыми');
  }

  if (validator.isEmail(email) === false) {
    throw new ReqError('Email не корректен');
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Такой пользователь уже существует');
      }
    })
    .catch(next);

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
    }))
    .then((user) => {
      user.password = null;
      res.status(200).send({ user });
    })
    .catch(next);
}

function updateUser(req, res, next) {
  const id = req.headers.userid;

  return User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      user.password = null;
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ReqError('ошибка валидации'));
      } else {
        next(err);
      }
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ReqError('Email или пароль не могут быть пустыми');
  }

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new AuthError('Неправильные почта или пароль');
        }
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
          expiresIn: '7d',
        });
        user.password = null;
        res.send({ token, user });
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ReqError('ошибка валидации'));
      } else {
        next(err);
      }
    });
}

module.exports = {
  getUser,
  createUser,
  updateUser,
  login,
};
