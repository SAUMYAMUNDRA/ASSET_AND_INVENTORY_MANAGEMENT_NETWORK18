import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as refreshTokenModel from "../models/refresh_token_model.js";
import * as authModel from '../models/user_model.js';
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const isLoggedIn = async (req, res, next) => {
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
			  			   console.log("CHECK FAILED 0");

			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
            return res.status(403).json({ error: "Invalid session" });
          }
          // Get refresh token from DB
          const dbToken = await refreshTokenModel.getTokenByDeviceId(
            expiredPayload.user_id,
            expiredPayload.device_id
          );
		  const user = await authModel.getUserByEmail(expiredPayload.email);

		   if (!user || !dbToken) {
			   console.log("CHECK FAILED 1");
			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
			  return res.status(403).json({ error: "Session expired, please login again" });
			}
          // Validate refresh token from JWT payload
          if (dbToken.ref_token !== expiredPayload.ref_token) {
			  			   console.log("CHECK FAILED2 ");

			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
            return res.status(403).json({ error: "Invalid session" });
          }

          // Check refresh token expiry
          if (new Date(dbToken.expires_at) < new Date()) {
			  			   console.log("CHECK FAILED 3");

            await refreshTokenModel.deleteTokenByDeviceId(
              expiredPayload.user_id,
              expiredPayload.device_id,
            );
			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
            return res.status(403).json({ error: "Session expired, please login again" });
          }

          // Generate new JWT (rotate refresh token)
          const newRefToken = crypto.randomBytes(24).toString("hex");
          const newToken = jwt.sign(
            {
              user_id: user.user_id,
              city_id: user.city_id,
              email: user.email,
              role: user.role,
              fullname: user.fullname,
              device_id: expiredPayload.device_id,
              permissions: user.permissions,
              ref_token: newRefToken,
              access_name:expiredPayload.access_name
            },
            JWT_SECRET,
            { expiresIn: "30m" }
          );

          // Update refresh token in DB
          await refreshTokenModel.updateToken(
            expiredPayload.user_id,
            expiredPayload.device_id,
            newRefToken,
          );

          // Replace JWT cookie
          res.cookie("authToken", newToken, {
            httpOnly: true,
            secure: false, // true if using HTTPS
            sameSite: "strict",
            maxAge: 24*30*60 * 60 * 1000 
          });

          req.user = { ...expiredPayload, ref_token: newRefToken };
          return next();
        } else {
						   console.log("CHECK FAILED 44");

			res.clearCookie("authToken", {
			  httpOnly: true,
			  secure: false,
			  sameSite: "strict"
			});
          return res.status(403).json({ error: "Invalid or expired token" });
        }
      } else {
        // Token still valid
        req.user = decoded;
        return next();
      }
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Token verification failed" });
  }
};
