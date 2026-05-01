const { Sequelize } = require('sequelize');

// Replace the string below with your "Public Connection String" from Railway
const sequelize = new Sequelize('mysql://root:VjTPXEaWyoIjdXUxarhKHyENyPWXRyHL@switchyard.proxy.rlwy.net:17775/krishi_db');

module.exports = sequelize;