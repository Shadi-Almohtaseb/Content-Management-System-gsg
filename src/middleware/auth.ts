import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { User } from "../db/entities/User.js";
import { ExpressNS } from "../../@types/index.js";

const authenticate: RequestHandler<any, any, Record<string, any>, any, Record<string, any>> = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1] || "";
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

export { authenticate };
