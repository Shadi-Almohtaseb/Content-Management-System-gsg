import jwt from 'jsonwebtoken';
import { User } from '../db/entities/User.js';
import { Shop } from '../db/entities/Shop.js';

interface TokenPayload {
    id: string;
    email: string;
}

const secretKey = process.env.SECRET_KEY || '';

const generateToken = (user: User) => {
    const payload: TokenPayload = {
        id: user.id,
        email: user.email,
    };

    const options = {
        expiresIn: '1d',
    };

    return jwt.sign(payload, secretKey, options);
};

const generateShopToken = (shop: Shop) => {
    const payload: TokenPayload = {
        id: shop.shop_id,
        email: shop.email,
    };

    const options = {
        expiresIn: '1d',
    };

    return jwt.sign(payload, secretKey, options);
};

export { generateToken, generateShopToken };
