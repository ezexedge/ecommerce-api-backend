const User = require('../models/user')

const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const {errorHandler} = require('../helpers/dbErrorHelpers')
exports.signup = (req,res)=>{

//console.log(req.body)

	const user = new User(req.body)

	user.save((error,user)=> {
		if(error){
			return res.status(400).json({
				error : errorHandler(error)
			})
		}
		 user.salt = undefined
		 user.hashed_password = undefined
		res.json({
			user
		})
	})
}
exports.signin = (req,res) => {

	const { email ,password} = req.body
	User.findOne({email}, (error,user) => {
		if(error || !user){
			return res.status(400).json({
				error : 'este email no se encuentra registrado'
			})
		}

		if(!user.authenticate(password)){
			return res.status(400).json({
				error : "Email o password es incorrecto"
			})
		}

		const token = jwt.sign({_id: user._id},process.env.JWT_SECRET)
		res.cookie('t',token,{expire : new Date() + 9999})
		const {_id,name,email,role} = user
		return res.json({
			token,user: {_id,name,email,role}
		})

	})
	
}

exports.signout = (req,res) => {
	res.clearCookie('t')
	res.json({message : 'signout success'})
}

exports.requireSignin = expressJwt({
	secret : process.env.JWT_SECRET
})


exports.isAuth = (req,res,next) => {
	let user = req.user._id == req.profile._id

	if(!user){
		return res.status(403).json({
			error : 'acceso denegado no esta logeado'
		})
	}
	next()
}

exports.isAdmin = (req,res,next) => {
	if(req.profile.role === 0){
		return res.status(403).json({
			error: 'no eres administrador , acceso denegado'
		})
	}
	next()
}