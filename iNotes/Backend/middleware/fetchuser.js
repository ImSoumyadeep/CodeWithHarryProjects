
const jwt = require('jsonwebtoken');


const JWT_SECRET = "hastaLaVista";   // SECRET key 

const fetchuser = (req, resp, next) => {

    // Get the user from jwt token and add id to request body

    const token = req.header('auth-token')
    if (!token) {
        resp.status(401).send({ error: "You don't have a valid authentication token" })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user;
        next();
        
    } catch (error) {
        resp.status(401).send({ error: "You don't have a valid authentication token" })
    }

}

module.exports = fetchuser