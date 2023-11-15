import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../db/entities/User.js";
import { ExpressNS } from "../../@types/index.js";
import { Shop } from "../db/entities/Shop.js";

const authenticateUser: RequestHandler<any, any, Record<string, any>, any, Record<string, any>> = async (req, res, next) => {
  const token = req.cookies["userToken"] || "";
  let validToken;
  try {
    validToken = jwt.verify(token, process.env.SECRET_KEY || "");
  } catch (error) {
    validToken = false;
  }

  if (validToken) {
    const decoded = jwt.decode(token, { json: true });
    if (decoded?.email) {
      const user = await User.findOneBy({ email: decoded.email });
      (req as ExpressNS.RequestWithUser).user = user || null;
    } else {
      (req as ExpressNS.RequestWithUser).user = null;
    }
    next();
  } else {
    res.status(401).send("You are unauthorized, login to continue");
  }
};

const authenticateShop: RequestHandler<any, any, Record<string, any>, any, Record<string, any>> = async (req, res, next) => {
  const token = req.cookies["shopToken"] || "";
  let validToken;
  try {
    validToken = jwt.verify(token, process.env.SECRET_KEY || "");
  } catch (error) {
    validToken = false;
  }

  if (validToken) {
    const decoded = jwt.decode(token, { json: true });
    if (decoded?.email) {
      const shop = await Shop.findOneBy({ email: decoded.email });
      (req as ExpressNS.RequestWithShop).shop = shop || null;
    } else {
      (req as ExpressNS.RequestWithShop).shop = null;
    }
    next();
  } else {
    res.status(401).send("You are unauthorized, login to continue");
  }
};

export { authenticateUser, authenticateShop };
