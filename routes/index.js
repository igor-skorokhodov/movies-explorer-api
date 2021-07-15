const router = require('express').Router();
const userRoutes = require('./users');
const movieRoutes = require('./movies');
const NotError = require('../errors/not-found-err');
const auth = require('../middlewares/auth');

router.use(userRoutes);

router.use(movieRoutes);

router.all('*', auth, () => {
  throw new NotError('страница не найдена');
});

module.exports = router;
