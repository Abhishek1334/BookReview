import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ebf1c6e69a0488e7e80f1efa1ed4f75af2f7158462a6f0004c9a1648b52c2d27';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'cab514622fdb64f238aa2d530a51a47043cb93d2afb6f011a99a84ab403a942b';

export const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '30m'
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    });
};

export const verifyToken = (token, secret = JWT_SECRET) => {
    return jwt.verify(token, secret);
};
