const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Acceso no autorizado" });
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Formato de token no valido" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
}

module.exports = authMiddleware;
