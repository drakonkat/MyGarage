const isMechanic = (req, res, next) => {
    if (req.user && req.user.role === 'mechanic') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Mechanic role required.' });
};

export { isMechanic };
