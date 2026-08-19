const EXPRESS = require(`express`);

const APP = EXPRESS();

APP.use(EXPRESS.json());

APP.get(`/`, (req, res) => {
  res.json({ message: `Expense Tracker API funcionando ` });
});

module.exports = APP;
