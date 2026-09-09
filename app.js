const express = require(`express`);
const helmet = require("helmet");
const authRoutes = require("./src/routes/auth.routes");
const expenseRoutes = require("./src/routes/expense.routes");
const savingRoutes = require("./src/routes/saving.routes");
const investmentRoutes = require("./src/routes/investment.routes");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/savings", savingRoutes);
app.use("/investments", investmentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
