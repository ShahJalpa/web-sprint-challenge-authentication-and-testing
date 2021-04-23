const Users = require('../auth/user-model');

function validUser (req, res, next) {
    const user = req.body;

    if (user.username && user.password) {
        next();
    } else {
        res.status(401).json({ message: 'username and password required'});
    }
}

async function isAvailableUser (req, res, next) {
    Users.getBy({username: req.body.username})
        .then(result => {
            if(result.length === 0){
                next()
            } else {
                res.status(500).json({message: 'username taken'})
            }
        })
}

module.exports = {
    validUser,
    isAvailableUser
}