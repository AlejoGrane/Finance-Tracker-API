const express = require(`express`);
const authRoutes = require("./src/routes/auth.routes");
const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.get(`/`, (req, res) => {
  res.json({ message: `Expense Tracker API funcionando ` });
});

module.exports = app;
