const jwt = require('jsonwebtoken');
const jwt_secret = 'treasurehunt'

function getToken(userId) {
    return jwt.sign({ userId: userId }, jwt_secret);
}

function main() {
    console.log(getToken('admin'));
}

main();