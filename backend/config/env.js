require('dotenv').config();

// ✅ Required ENV Variables
// NOTE: DB_PASSWORD optional rakha hai
const requiredEnv = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET'
];

// ✅ Validate ENV
requiredEnv.forEach((key) => {
  if (process.env[key] === undefined || process.env[key] === '') {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  PORT: process.env.PORT,

  DB_HOST: process.env.DB_HOST,

  DB_USER: process.env.DB_USER,

  // ✅ Empty password allowed
  DB_PASSWORD: process.env.DB_PASSWORD || '',

  DB_NAME: process.env.DB_NAME,

  JWT_SECRET: process.env.JWT_SECRET
};
