const express = require(`express`);
const authRoutes = require("./src/routes/auth.routes");
const expenseRoutes = require("./src/routes/expense.routes");
const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/expenses", expenseRoutes);

module.exports = app;
