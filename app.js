require('dotenv').config()
require("./config/database").connect()
const express = require("express")
const jwt = require("jsonwebtoken")
const brcypt = require("bcryptjs")
const cookie = require("cookie-parser")

//Import User from model
const User = require("./model/user")

//Import Middleware
const auth = require("./middleware/auth")


const app = express()
app.set("view engine", "ejs")
app.use(express.json()) // discuss this later
app.use(express.urlencoded({ extended: true }))
app.use(cookie());


app.get("/", (req, res) => {
    res.send("Hello I Am Practicing The Auth system")
});

app.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!(firstname && lastname && email && password)) {
            res.status(405).send("All Fields are mandatory, please fill all the information")
        }
        const exisitngUser = await User.findOne({ email })

        if (exisitngUser) {
            res.status(405).send("User alredy Registed | Please try Login")
        }

        const encryPass = await brcypt.hash(password, 10)

        const user = await User.create({
            firstname,
            lastname,
            email,
            password: encryPass,
        })

        const token = jwt.sign({ id: user._id, email }, 'shhhhhh', { expiresIn: '2h' })
        user.token = token;
        user.password = undefined;
        
        res.status(201).json(user);


    } catch (error) {
        console.log(error);
        console.log(`Error in Response Route`);
    }
})

app.post("/login", async(req,res)=>{
    try {
        const {email, password} = req.body;

        if(!(email && password)){
            res.status(405).send("All Fields are mandatory, please fill all the information")
        }

        const user = await User.findOne({email})

        if(user && (await brcypt.compare(password, user.password))){
            const token = jwt.sign({id:user._id, email},'shhhhhh',{expiresIn: '2h'})
            user.password = undefined;
            user.token = token;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly:true,
            }

            res.status(405).cookie("token", token,options).json({
                success:true,
                token,
                user
            })

            res.sendStatus(405).send(`Invalid Credentils`)
            

        }


    } catch (error) {
        console.log(error);
    }
})


app.get("/dashboard",auth,(req,res)=>{
    res.send(`Welcome to Dashboard`);
})

///Get Route
app.get("/myget", (req,res)=>{
    console.log(req.body);
    res.send(req.query)
})

// Rendering of Get
app.get("/getform", (req,res)=>{
    res.render("getform");
})


//My Post Route
app.post("/mypost", (req,res)=>{
    console.log(req.body);
    console.log(req.files)
})

// Rending of POST
app.get("/post", (req,res)=>{
    res.render("postform");
})



module.exports = app;