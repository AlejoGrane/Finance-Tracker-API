require(`dotenv`).config();

const APP = require(`./app`);

const PORT = process.env.PORT || 3000;

APP.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
