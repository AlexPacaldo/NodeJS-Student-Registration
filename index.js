const express = require('express');
const app = express();
const port = 5000;
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config({path:'./.env'});

app.set("view engine", "hbs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//Define Routes
app.use("/", require("./routes/register_routes"));
app.use("/auth", require("./routes/auth"))
app.use(cookieParser());



app.listen(port,()=>{
    console.log(  `Server started at ${port}`);
  })