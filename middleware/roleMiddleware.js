
function roleMiddleware(...roles) {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!userRole) {
            return res.status(401).json({message : "Unauthorized"});
        }
        const isExsist = roles.includes(userRole);
        if (!isExsist) {
            return res.status(403).json({message : "Forbidden Access"});
            
        }
        next();
    }
      
}
module.exports = {roleMiddleware};