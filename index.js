const Sequelize = require('sequelize');
const express = require('express');

const sequelize = new Sequelize('homework', 'homework', 'homework', {
  dialect: 'mysql',
  host: 'db',
});
const User = sequelize.define('user', {
  facebook_id: Sequelize.BIGINT,
  name: Sequelize.STRING,
}, {
  timestamps: false,
});
const Friend = sequelize.define('friend', {
  user_id: Sequelize.INTEGER,
  friend_id: Sequelize.INTEGER,
}, {
  timestamps: false,
});
User.belongsToMany(User, {
  as: 'Friends',
  through: Friend,
  foreignKey: 'user_id',
  otherKey: 'friend_id',
});


const app = express();

app.listen(5555);
