// utils/cookieUtils.js
export const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "DEPLOYMENT" ? true : false, // ⚠ important for localhost
    // secure: false, // ⚠ important for localhost

    sameSite: "none", // 'lax' or 'strict' for local dev, 'none' for production
    // sameSite: "lax", // 'lax' or 'strict' for local dev, 'none' for production

    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
