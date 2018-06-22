const Sequelize = require('sequelize');
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

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

const asyncWrapper = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
const app = express();

app.get('/', asyncWrapper(async (req, res) => {
  res.send(JSON.stringify(await User.findAll()));
}));
app.get('/p/', (req, res, next) => {
  User.findAll().then(users => res.send(JSON.stringify(users))).catch(next);
});

// Parse the Facebook user and write to database.
app.get('/parse', asyncWrapper(async (req, res) => {
  const { url } = req.query;
  const r = await fetch(url);
  const $ = cheerio.load(await r.text());
  const profileId = $('meta[property="al:android:url"]').attr('content').match(/[0-9]+/)[0];
  const name = $('meta[property="og:title"]').attr('content');
  await User.create({ name, facebook_id: profileId });
  res.send('ok');
}));
app.get('/p/parse', (req, res, next) => {
  const { url } = req.query;
  fetch(url).then(r => (r.text())).then((text) => {
    const $ = cheerio.load(text);
    const profileId = $('meta[property="al:android:url"]').attr('content').match(/[0-9]+/)[0];
    const name = $('meta[property="og:title"]').attr('content');
    return User.create({ name, facebook_id: profileId });
  }).then(() => {
    res.send('ok');
  })
    .catch(next);
});
app.listen(5555);
