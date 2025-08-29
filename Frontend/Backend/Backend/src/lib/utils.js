import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d"
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict", // ❌ error happens here if not inside object properly
        maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return token;
};
