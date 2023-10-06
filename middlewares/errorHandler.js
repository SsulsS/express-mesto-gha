module.exports = (error, req, res, next) => {
  const { statusCode = 500, message } = error;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'Попробуйте позже, проблемы с сервером' : message,
  });
  next();
};
