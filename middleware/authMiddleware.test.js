const authMiddleware = require('./authMiddleware');
const jwt = require('jsonwebtoken');

describe('authMiddleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.restoreAllMocks();
    });

    it('should return 401 when no Authorization header is present', () => {
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header has Bearer with no token', () => {
        req.headers.authorization = 'Bearer ';

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token format' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when the token is invalid', () => {
        req.headers.authorization = 'Bearer invalid-token';
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            const error = new Error('invalid token');
            error.name = 'JsonWebTokenError';
            throw error;
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when the token has expired', () => {
        req.headers.authorization = 'Bearer expired-token';
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            const error = new Error('jwt expired');
            error.name = 'TokenExpiredError';
            throw error;
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next and attach req.user when the token is valid', () => {
        req.headers.authorization = 'Bearer valid-token';
        const decodedPayload = { id: 'user123', role: 'farmer' };
        jest.spyOn(jwt, 'verify').mockReturnValue(decodedPayload);

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(decodedPayload);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
