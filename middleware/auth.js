const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
    console.log(req.cookies);

    const { token } = req.cookies;
    if (!token) {
        res.status(400).send(`Token Is Missing`)
    }
    //Verify
    try {
        const decode = jwt.verify(token, 'shhhhh')
        console.log(decode);
        req.user = decode;

    } catch (error) {
        console.log(error);
        res.status(405).send(`Token is invalid`)
    }
    return next();
}


module.exports = auth;
