const facultyMiddleware = async (req, res, next) => {
    try {
        // check isTeacher
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. User not found." });
        }
        const { isTeacher, isHod, isTnp } = req.user;

        if (!isTeacher && !isHod && !isTnp) {
            return res.status(403).json({ message: "Access denied. User does not have the required role." });
        }
        // if user is an admin, proceed to the next middleware.
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = facultyMiddleware;