export const CONFIG = {
  // The log level used for Winston logger (error, info, debug)
  WINSTON_LOG_LEVEL: process.env.WINSTON_LOG_LEVEL || "debug",

  HTTP_HOST: process.env.HTTP_HOST || "http://localhost",

  HTTP_PORT: process.env.HTTP_PORT || 3003
};
