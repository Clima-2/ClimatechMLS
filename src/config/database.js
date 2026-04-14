const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// SSL config requerido por Railway MySQL
const sslConfig = isProduction
  ? { require: true, rejectUnauthorized: false }
  : false;

const poolConfig = {
  max: 5,
  min: 0,
  acquire: 60000,  // 60s — Railway puede tardar en levantar MySQL
  idle: 10000
};

let sequelize;

if (process.env.DATABASE_URL) {
  // Railway provee DATABASE_URL — parseamos manualmente para mayor control
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: sslConfig,
      connectTimeout: 60000
    },
    pool: poolConfig
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'climatech_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: isProduction ? false : console.log,
      dialectOptions: {
        ssl: sslConfig,
        connectTimeout: 60000
      },
      pool: poolConfig
    }
  );
}

module.exports = sequelize;
