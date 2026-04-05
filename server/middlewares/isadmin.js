import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as refreshTokenModel from "../models/refresh_token_model.js";
import * as authModel from '../models/user_model.js';

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          const expiredPayload = jwt.decode(token);

          if (!expiredPayload?.device_id || !expiredPayload?.user_id || !expiredPayload?.ref_token) {
			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
            return res.status(403).json({ error: "Invalid session" });
          }

          // Get refresh token from DB
          const dbToken = await refreshTokenModel.getTokenByDeviceId(
            expiredPayload.city_id,
            expiredPayload.user_id,
            expiredPayload.device_id
          );

		  const user = await authModel.getUserByEmail(expiredPayload.email);

		   if (!user || !dbToken) {
			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
			  return res.status(403).json({ error: "Session expired, please login again" });
			}

          // Validate refresh token from JWT payload
          if (dbToken.ref_token !== expiredPayload.ref_token) {
			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
            return res.status(403).json({ error: "Invalid session" });
          }

          // Check refresh token expiry
          if (new Date(dbToken.expires_at) < new Date()) {
            await refreshTokenModel.deleteTokenByDeviceId(
              expiredPayload.city_id,
              expiredPayload.user_id,
              expiredPayload.device_id,
              expiredPayload.access_names
            );
			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
            return res.status(403).json({ error: "Session expired, please login again" });
          }

          // Rotate refresh token
          const newRefToken = crypto.randomBytes(24).toString("hex");

          // Generate new JWT including the new ref_token
          const newToken = jwt.sign(
            {
              user_id: expiredPayload.user_id,
              city_id: expiredPayload.city_id,
              email: expiredPayload.email,
              role: expiredPayload.role,
              fullname: expiredPayload.fullname,
              device_id: expiredPayload.device_id,
              ref_token: newRefToken,
              access_names:expiredPayload.access_names
            },
            JWT_SECRET,
            { expiresIn: "30m" }
          );

          // Update refresh token in DB
          await refreshTokenModel.updateToken(
            expiredPayload.city_id,
            expiredPayload.user_id,
            expiredPayload.device_id,
            newRefToken,
            expiredPayload.access_names
          );

          // Set new JWT cookie
          res.cookie("authToken", newToken, {
            httpOnly: true,
            secure: false, // true if using HTTPS
            sameSite: "strict",
            maxAge: 24*30*60 * 60 * 1000
          });

          // Role check
          if (expiredPayload.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
          }

          req.user = { ...expiredPayload, ref_token: newRefToken };
          return next();
        } else {
						res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
          return res.status(403).json({ error: "Invalid or expired token" });
        }
      } else {
        // Token valid → role check
        if (decoded.role !== "admin") {
          return res.status(403).json({ error: "Access denied. Admins only." });
        }

        req.user = decoded;
        return next();
      }
    });

  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Token verification failed" });
  }
};
