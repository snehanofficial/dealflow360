export const config = {
  port: process.env.PORT || 3000,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
