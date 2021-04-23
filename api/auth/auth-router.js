const router = require('express').Router();

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../../config/secret');
const { validUser, isAvailableUser } = require('../middleware/user-mdlwr');

const Users = require('./user-model');

// <----------- REGISTER USER ---------->
router.post('/register', validUser, isAvailableUser, (req, res, next) => {
  const credentials = req.body;

  var salt = bcryptjs.genSaltSync(8);
  var hash = bcryptjs.hashSync(credentials.password, salt)

  credentials.password = hash;
  credentials.username = credentials.username.trim();

  Users.insert(credentials)
      .then(user => {
        res.status(200).json(user)
      })
      .catch(next)
  
});


// <---------------- LOGIN ------------->
router.post('/login', validUser, (req, res, next) => {
  const { username, password } = req. body;

  Users.getBy({ username: username})
       .then(([user]) => {
         if (user && bcryptjs.compareSync(password, user.password)) {
           const token = buildToken(user)
           res.status(200).json({message: `welcome, ${user.username}`,
           token
            })
         } else {
           res.status(500).json({message: 'invalid credentials'});
         }
       })
       .catch(next)
});

router.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
    stack: err.stack,
    custom: 'There is some error in auth-router',
  })
})

function buildToken(user) {
  const payload = {
    username: user.username,
    password: user.password
  };
  const config = {
    expiresIn: '1h',
  };
  return jwt.sign(
    payload, jwtSecret, config
  )
}

module.exports = router;


/*  ------------------REGISTER------------
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */

    /*   ----------------LOGIN -------------------
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */