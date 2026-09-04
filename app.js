const express = require(`express`);
const authRoutes = require("./src/routes/auth.routes");
const expenseRoutes = require("./src/routes/expense.routes");
const savingRoutes = require("./src/routes/saving.routes");
const investmentRoutes = require("./src/routes/investment.routes");

const app = express();

app.use(express.json({ limit: "10kb" }));

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/savings", savingRoutes);
app.use("/investments", investmentRoutes);

module.exports = app;
