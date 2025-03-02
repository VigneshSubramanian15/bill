import jwt from 'jsonwebtoken';

export function getJWTTokenData(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        const error = new Error('Authentication Error');
        error.statusCode = 401;
        throw error;
    }

    try {
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        const error = new Error('Authentication Error');
        error.statusCode = 401;
        throw error;
    }
}


export const ErrorResponse = (res, error, status = 500) => {
    status = error.message === "Authentication Error" ? 401 : status;
    return res.status(status).json({ success: false, error: error?.message || error });
}