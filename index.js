const Sequelize = require('sequelize');
const express = require('express');

const sequelize = new Sequelize('homework', 'homework', 'homework', {
  dialect: 'mysql',
  host: 'db',
});
const User = sequelize.define('users', {
  facebook_id: Sequelize.BIGINT,
  name: Sequelize.STRING,
}, {
  timestamps: false,
});


const app = express();

app.listen(5555);
