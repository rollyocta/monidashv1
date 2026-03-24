import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  let token;

  // Check if may token sa headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Kunin token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Save user info sa request
      req.user = decoded;

      next(); // proceed
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, not authorized" });
  }
};

export default authMiddleware;