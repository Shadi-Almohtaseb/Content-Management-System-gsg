import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../db/entities/User.js";
import { Shop } from "../db/entities/Shop.js";
import { ExpressNS } from "../../@types/index.js";
import { AppError } from "../utils/errorHandler.js";

const authenticate = (entity: 'user' | 'shop'): RequestHandler<any, any, Record<string, any>, any, Record<string, any>> => {
  return async (req, res, next) => {
    const tokenHeader = req.headers["authorization"]?.split(" ")[1] || "";
    const tokenCookie = req.cookies[`${entity}Token`] || tokenHeader;
    if (!tokenCookie) {
      throw new AppError("Unauthorized", 401, true);
    }

    try {
      jwt.verify(tokenCookie, process.env.SECRET_KEY || "");
      const decoded = jwt.decode(tokenCookie, { json: true }) as jwt.JwtPayload;

      if (decoded?.email) {
        let entityInstance;
        if (entity === 'user') {
          entityInstance = await User.findOneBy({ email: decoded.email });
          (req as ExpressNS.RequestWithUser).user = entityInstance?.isDeleted || !entityInstance?.isVerified ? undefined : entityInstance;
        } else if (entity === 'shop') {
          entityInstance = await Shop.findOneBy({ email: decoded.email });
          (req as ExpressNS.RequestWithShop).shop = entityInstance?.isDeleted || !entityInstance?.isVerified ? undefined : entityInstance;
        }
      } else {
        if (entity === 'user') {
          (req as ExpressNS.RequestWithUser).user = undefined;
        } else if (entity === 'shop') {
          (req as ExpressNS.RequestWithShop).shop = undefined;
        }
      }
      next();
    } catch (error) {
      throw new AppError("Invalid token", 401, true);
    }
  };
};

const authenticateUser = authenticate('user');
const authenticateShop = authenticate('shop');

export { authenticateUser, authenticateShop };
