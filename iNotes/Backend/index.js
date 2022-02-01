
// !!!!!!!!!!!!!!!!!!!!! VVVVVI !!!!!!!!!!!!!!!!!!!*****************

// To start the nodemon server Just execute -> npm run nodemon 

const express = require("express");

//Making the port listen
const app = express()
const port = 5000

const connectToMongo = require("./db")

connectToMongo();

console.log("Below connectToMongo method")

// Custom Api syntax to directly use
// app.get('/', (req,resp)=>{
//     resp.send("Homepage loaded successfully !!!")
// })


// This is to send and receive req as json
app.use(express.json())


// Available routes
app.use('/api/auth', require("./routes/auth"))
app.use('/api/notes', require("./routes/notes"))


// Making the port listen
app.listen(port,()=>{
    // console.log(`Listening bro at port ${port}`)
})