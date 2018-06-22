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

// User A adds a new friend B.
app.get('/addf/:userId/:friendId', asyncWrapper(async (req, res) => {
  const { userId, friendId } = req.params;
  const [user, friend] = await Promise.all([User.findById(userId), User.findById(friendId)]);
  await Promise.all([user.addFriend(friend), friend.addFriend(user)]);
  res.send('ok');
}));
app.get('/p/addf/:userId/:friendId', (req, res, next) => {
  const { userId, friendId } = req.params;
  Promise.all([User.findById(userId), User.findById(friendId)]).then((result) => {
    const [user, friend] = result;
    return Promise.all([user.addFriend(friend), friend.addFriend(user)]);
  }).then(() => {
    res.send('ok');
  })
    .catch(next);
});

function intersection(friendsA, friendsB) {
  const result = [];
  // Add friends of A to a set.
  const friendsASet = new Set();
  for (let i = 0; i < friendsA.length; i += 1) {
    const friend = friendsA[i];
    friendsASet.add(friend.id, friend);
  }
  // Iterate friends of B, finding if it is in the set.
  for (let i = 0; i < friendsB.length; i += 1) {
    const friend = friendsB[i];
    if (friendsASet.has(friend.id)) {
      result.push({
        id: friend.id,
        facebook_id: friend.facebook_id,
        name: friend.name,
      });
    }
  }
  return result;
}

// Get mutual friends of two users.
// Use raw query may be faster, but I use sequelize here...
app.get('/mutual/:userAId/:userBId', asyncWrapper(async (req, res) => {
  const { userAId, userBId } = req.params;
  const [userA, userB] = await Promise.all([User.findById(userAId), User.findById(userBId)]);
  const [friendsA, friendsB] = await Promise.all([userA.getFriends(), userB.getFriends()]);
  res.send(intersection(friendsA, friendsB));
}));
app.get('/p/mutual/:userAId/:userBId', (req, res, next) => {
  const { userAId, userBId } = req.params;
  Promise.all([User.findById(userAId), User.findById(userBId)]).then((result) => {
    const [userA, userB] = result;
    return Promise.all([userA.getFriends(), userB.getFriends()]);
  }).then((result) => {
    const [friendsA, friendsB] = result;
    res.send(intersection(friendsA, friendsB));
  }).catch(next);
});
app.listen(5555);
