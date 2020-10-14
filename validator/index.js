exports.userSignupValidator = (req,res,next) => {
    req.check('name', 'el nombre es obligatorio').notEmpty()

    req.check('email','el email debe tener de 3 a 32 caractenres')
        .matches(/.+\@.+\..+/)
        .withMessage('Email debe contener @')
        .isLength({
            min: 4, max: 32
        })
    req.check('password', 'el password es obligatorio').notEmpty()
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('el password debe tener como minimo 6 caracteres')
        .matches(/\d/)
        .withMessage('el password debe contener un numero')
        const errors = req.validationErrors()
        if(errors){
            const firtsError = errors.map(error => error.msg)[0]
            return res.status(400).json({
                error: firtsError
            })
        }
        next()


}