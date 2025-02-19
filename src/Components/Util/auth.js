import jwt from 'jsonwebtoken';

export function getJWTTokenData(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new Error('Authorization header not found');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new Error('Token not provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
}
