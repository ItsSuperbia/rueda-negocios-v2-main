exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "adminSistema") {
        next();
    } else {
        res.status(403).json({ message: "Acceso denegado: solo para administradores del sistema" });
    }
};

exports.adminOrEvent = (req, res, next) => {
    if (req.user && (req.user.role === "adminSistema" || req.user.role === "adminEvento")) {
        next();
    } else {
        res.status(403).json({ message: "Acceso denegado: solo para administradores" });
    }
};
