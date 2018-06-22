Due to the (political) difficulties to fetch friend list from Facebook, this exercise did not implement that.

Instead, it provides an API to add custom friend list for users in the table.

### Run everything

MySQL 5.x and Node 6.x from Docker is used. You can check `Dockerfile` and `docker-compose.yml`. :)

    docker-compose build
    docker-compose up

Go to `http://localhost:5555/`.


### Run everything without Docker

* SQL schema available in `init.sql`.

* Since Node 6.x did not have async/await support, you need to transform using Babel.

For example:

    yarn
    yarn babel index.js --out-file app.js
    node app.js


### API

All paths listed are the `async/await` variant. Paths with `/p/` are the promise variant.

#### `/`, `/p/`

List all of users.

#### `/parse`, `/p/parse/`

Parse a Facebook URL to Facebook ID and name, inserting into the database.

URL should be passed as `GET` parameter.

Example: `http://localhost:5555/parse?url=https://www.facebook.com/littlebtc`

#### `/addf/1/2`, `/p/addf/1/2`

Make user with ID 1 and user with ID 2 friends.

#### `/mutual/1/2`, `/p/mutual/1/2`

List mutual friends between user with ID 1 and with ID 2.
