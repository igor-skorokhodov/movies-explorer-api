const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const router = require('./routes/index');
const ServerError = require('./errors/server-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const CORS_WHITELIST = [
  'http://mesto.ivladsk.nomoredomains.club',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://mesto.ivladsk.nomoredomains.club',
];

const { MONGO_ADRESS, NODE_ENV } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const dbAdress = 'mongodb://localhost:27017/bitfilmsdb';

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

app.use(bodyParser.json());

mongoose.connect(NODE_ENV === 'production' ? MONGO_ADRESS : dbAdress, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.use(limiter);

app.use(function(req, res, next) {
  const { method } = req;
  const { origin } = req.headers; // Сохраняем источник запроса в переменную origin
  // проверяем, что источник запроса есть среди разрешённых
  const DEFAULT_ALLOWED_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";
  const requestHeaders = req.headers['access-control-request-headers'];
  if (CORS_WHITELIST.includes(origin)) {
    res.header('Access-Control-Allow-Origin', "*");
  }
  if (method === 'OPTIONS') {
    // разрешаем кросс-доменные запросы любых типов (по умолчанию)
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    // завершаем обработку запроса и возвращаем результат клиенту
    return res.end();
}
  next();
}); ;

app.use(router);

app.use(errorLogger);

app.use(errors());

app.use(ServerError);

app.listen(PORT);
