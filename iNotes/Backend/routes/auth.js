
const express = require('express')
const router = express.Router()
const Users = require('../models/Users')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const fetchuser = require('../middleware/fetchuser')

const { body, validationResult } = require('express-validator');

const JWT_SECRET = "hastaLaVista";   // SECRET key 




// ROUTE 1 : This api is to create user -> POST : /api/auth/createuser
router.post('/createuser', [

    // username must be an email
    body('email', 'Enter a valid email').isEmail(),
    // password must be at least 5 chars long
    body('password', 'Password length is too short').isLength({ min: 4 }),
    body('name', 'Enter a valid name').isLength({ min: 3 }),
],

    async (req, resp) => {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(400).json({ errors: errors.array() });
        }

        // We can save using this way also

        // const user = Users(req.body);
        // user.save()
        // .then(user=>resp.json(user))
        // .catch(err=>{
        //     resp.json({"error":"Email already exits", "msg": err})
        // })


        // Best way to save using express 
        try {
            // User creation snippet from https://express-validator.github.io/docs/
            const salt = await bcrypt.genSalt(10);
            const securedPassword = await bcrypt.hash(req.body.password, salt)


            await Users.create({
                email: req.body.email,
                name: req.body.name,
                // password: req.body.password,   // Password is now hashed above
                password: securedPassword
            }).then(user => {

                const data = {
                    user: {
                        id: user.id
                    }
                }
                const authToken = jwt.sign(data, JWT_SECRET);
                // resp.json(user)

                resp.json({ authToken })
            }
            )
                .catch(err => {
                    resp.status(400).json({ "error": "Email already exists", "msg": err.message });
                })
        }
        catch (error) {
            // console.error(error.message);
            resp.status(500).send("Some error occured in internal server...")
        }



        // resp.send("Sending Hello...")
        // resp.send(req.body);

    })






// ROUTE 2 : This api is to create user -> POST : /api/auth/login
router.post('/login',

    // username must be an email
    body('email', 'Enter a valid email').isEmail(),
    // password must be at least 5 chars long
    body('password', 'Password cannot be blank').exists(),

    async (req, resp) => {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(400).json({ error: errors.array() });
        }

        const { email, password } = req.body;
        try {
            let user = await Users.findOne({ email });
            if (!user) {
                return resp.status(400).json({ error: "Sorry this email doesn't exist.. First create account and then login !" });
            }
            else {
                const passwordCompare = await bcrypt.compare(password, user.password);
                if (!passwordCompare) {
                    return resp.status(400).json({ error: "Password is incorrect !!!" });
                }
                else {
                    const data = {
                        user: {
                            id: user.id
                        }
                    }

                    // Signing with jwt token
                    const authToken = jwt.sign(data, JWT_SECRET);
                    // resp.json(user)

                    // For authentication sending it back
                    resp.json({ authToken });

                }
            }

        } catch (error) {
            // console.error(error.message);
            resp.status(500).send("Some error occured in internal server...")
        }

    }
)





// ROUTE 3 : This api is to create user -> POST : /api/auth/getuser
router.post('/getuser', fetchuser,

    async (req, resp) => {

        try {
            const userId = req.user.id;
            let userData = await Users.findById(userId).select("-password");
            resp.status(200).send(userData);

        } catch (error) {
            console.error(error.message);
            resp.status(500).send("Some error occured in internal server... Fetching failed :(")
        }

    }
)


module.exports = router
