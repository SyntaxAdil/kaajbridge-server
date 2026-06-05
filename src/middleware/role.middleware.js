const checkRoleMiddleware = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (req.user.role !== role) {
    return res
      .status(403)
      .json({
        success: false,
        message: "Forbidden - Insufficient permissions",
      });
  }

  next();
};

export default checkRoleMiddleware;
