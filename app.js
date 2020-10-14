const express = require('express')
const  morgan = require('morgan')
const cors = require('cors')
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const expressValidator = require('express-validator')

require("dotenv").config()


const authRouters = require('./routes/auth')
const  userRouters = require('./routes/user')
const  categoryRouters = require('./routes/category')
const  productRouters = require('./routes/product')
const braintreeRouters = require('./routes/braintree')
const orderRouters = require('./routes/order')

const app = express()


mongoose
	.connect(process.env.DATABASE,{
		useNewUrlParser: true,
		useCreateIndex : true
	})
	.then(()=> console.log('db conectado'))

	//middlewares

	app.use(morgan('dev'))
	app.use(bodyParser.json())
	app.use(cookieParser())
	app.use(expressValidator())
	app.use(cors())

app.use("/api", authRouters)
app.use("/api", userRouters)
app.use("/api", categoryRouters)
app.use("/api", productRouters)
app.use("/api", braintreeRouters)
app.use("/api", orderRouters)


const port = process.env.PORT || 8000

app.listen(port , ()=>{
	console.log('corriendo')
})