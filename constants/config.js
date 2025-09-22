const corsOptions = {
  origin: ["https://skillswap-frontend-ten.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-CSRF-Token"],
};

export { corsOptions };
