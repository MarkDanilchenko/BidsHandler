import dotenv from "dotenv";
dotenv.config({ path: "../.env.development" });

const {
  EXPRESS_SERVER_HOST,
  EXPRESS_SERVER_PORT,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_PORT,
  COOKIE_SECRET,
  JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = process.env;

const expressOptions = {
  host: EXPRESS_SERVER_HOST,
  port: EXPRESS_SERVER_PORT || 3000,
  cookieSecret: COOKIE_SECRET,
  jwtSecret: JWT_SECRET,
  jwtAccessExpiresIn: JWT_ACCESS_EXPIRES_IN,
  jwtRefreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
};

const postgreSQLOptions = {
  databaseName: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  host: DATABASE_HOST,
  port: DATABASE_PORT || 5432,
};

export { expressOptions, postgreSQLOptions };
