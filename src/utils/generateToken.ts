import jwt from 'jsonwebtoken';
import { User } from '../db/entities/User.js';
import { Shop } from '../db/entities/Shop.js';

interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

const secretKey = process.env.SECRET_KEY || '';

const generateToken = (id: string, email: string, role: string) => {
    const payload: TokenPayload = { id, email, role };
    const options = { expiresIn: '1d' };
    return jwt.sign(payload, secretKey, options);
};

const generateUserToken = (user: User) => {
    return generateToken(user.id, user.email, user.role);
};

const generateShopToken = (shop: Shop) => {
    return generateToken(shop.shop_id, shop.email, shop.role);
};

export { generateUserToken, generateShopToken };
