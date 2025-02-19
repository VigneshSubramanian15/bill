import jwt from 'jsonwebtoken';

export function getJWTTokenData(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        const error = new Error('Unauthorized: Authorization header not found');
        error.statusCode = 401;
        throw error;
    }

    try {
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        const error = new Error('Unauthorized: Invalid token');
        error.statusCode = 401;
        throw error;
    }
}
