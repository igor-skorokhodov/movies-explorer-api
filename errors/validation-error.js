const validator = require('validator');

const validateEmail = (value) => {
  const result = validator.isEmail(value);
  if (result) {
    return value;
  }
  throw new Error('Email validation err');
};

const validateUrl = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new Error('URL validation err');
};

module.exports = {
  validateUrl,
  validateEmail,
};
