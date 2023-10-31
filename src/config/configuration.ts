export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  hashSalt: parseInt(process.env.HASH_SALT) || 13,
  HTTP_BASIC_USER: process.env.HTTP_BASIC_USER,
  HTTP_BASIC_PASS: process.env.HTTP_BASIC_PASS,
  jwtSecret: process.env.JWT_SECRET || '666',
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME || '320s',
  jwtRefreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME || '600s',
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10),
  throttleTtl: parseInt(process.env.THROTTLE_TTL, 10),
  database: {
    MONGOOSE_URI: process.env.MONGOOSE_URI,
  },
  smtp: {
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  cookieSecret: process.env.COOKIE_SECRET || 'secret',
});
