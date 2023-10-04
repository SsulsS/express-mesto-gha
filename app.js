const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const {
  NOT_FOUND_ERROR_CODE,
} = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());
mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '651d220e51352853f915db10', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);
app.use('*', (req, res) => {
  res.status(NOT_FOUND_ERROR_CODE).send({
    message: 'Запрашиваемый адрес не найден. Проверьте URL и метод запроса'
  });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
