import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";


export const isAuthorized = (func_id) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: "Invalid token" });
        }

        // Attach decoded info to req
        req.user = decoded;

        // Check if user has the required func_id
        if (!decoded.permissions || !decoded.permissions.includes(func_id)) {
          return res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }

        return next();
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      return res.status(500).json({ error: "Token verification failed" });
    }
  };
};
