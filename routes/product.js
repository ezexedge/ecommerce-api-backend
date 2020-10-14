const express = require('express')
const router = express.Router()



const { create , productById , read , remove , update,list , listRelated , listCategories , listBySearch,listSearch,photo} = require('../controllers/product')
const {isAuth,isAdmin,requireSignin} = require('../controllers/auth')
const {
    userById
} = require('../controllers/user')


router.get('/product/:productId', read )

router.delete('/product/:productId/:userId',requireSignin,isAuth,isAdmin,remove)

router.put('/product/:productId/:userId',requireSignin,isAuth,isAdmin,update)


router.post('/product/create/:userId',requireSignin,isAuth,isAdmin,create)


router.get('/products/categories',listCategories)

router.get('/products',list)

router.get('/products/related/:productId',listRelated)

router.post("/products/by/search", listBySearch);

router.get("/products/search", listSearch);


router.get("/product/photo/:productId",photo)
	
router.param("userId",userById)

router.param("productId",productById)


module.exports = router
