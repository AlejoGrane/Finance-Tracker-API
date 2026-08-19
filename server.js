const APP = require(`./app`);
require(`dotenv`).config();

const PORT = process.env.PORT || 3000;

APP.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
