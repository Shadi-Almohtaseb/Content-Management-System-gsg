import jwt from 'jsonwebtoken';
import { User } from '../db/entities/User.js';

const generateToken = (user: User) => {
    const payload = {
        id: user.id,
        email: user.email,
    };

    const secretKey = process.env.SECRET_KEY || '';

    const options = {
        expiresIn: '1d',
    };

    return jwt.sign(payload, secretKey, options);
};

export default generateToken;
