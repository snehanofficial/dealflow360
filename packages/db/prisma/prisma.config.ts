import 'dotenv/config';

export default {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dealflow360?schema=public',
  },
};
