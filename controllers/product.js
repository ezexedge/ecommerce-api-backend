const  _ = require('lodash')
const formidable = require('formidable')
const fs = require('fs')
const Product = require('../models/product')
const errorHandler = require('../helpers/dbErrorHelpers')
const { has } = require('lodash')


exports.create = (req,res) => {

    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req,(err,fields,files) => {
        if(err){
            return res.status(400).json({
                error : "la imagen no ah sido cargada"
            })
        }

        let product = new Product(fields)

        //validar que los campos no esten vacios
        const { name , description , price , category , quantity , shipping } = fields

        if( !name || !description || !price || !category || !quantity || !shipping ){

              return res.status(400).json({
                    error: "todos los campos son obligatorio"
                })

        }


        //1k = 1000
        //1mb = 1000000

        if(files.photo){
              console.log(files.photo)

              if(files.photo.size > 1000000){
                   return res.status(400).json({
                error : "la imagen no debe superar 1mb"
            })
              }

            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err,result)=> {
            if(err){
                return res.status(400).json({
                    error: "error al guardar el producto"
                })
            }

            res.json(result)
        })


    })

}

exports.productById = (req,res,next,id) => {
    Product.findById(id)
        .populate('category')
        .exec((err,product)=> {
        if(err || !product){

              return res.status(400).json({
                    error: "producto no encontrado"
                })

        }
        req.product = product
        next()
    })
}

exports.read = (req,res) => {

        req.product.photo = undefined
        return res.json(req.product)

}

exports.remove = (req,res) => {
    let product = req.product
    product.remove((err,deletedProduct)=> {
        if(err){
               return res.status(400).json({
                    error: errorHandler(err)
                })
        }
        res.json({
            deletedProduct , message: "producto eliminado"
        })
    })
}


exports.update = (req,res) => {

    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req,(err,fields,files) => {
        if(err){
            return res.status(400).json({
                error : "la imagen no ah sido cargada"
            })
        }

        let product = req.product
        product = _.extend(product,fields)

        //validar que los campos no esten vacios
        const { name , description , price , category , quantity , shipping } = fields

        if( !name || !description || !price || !category || !quantity || !shipping ){

              return res.status(400).json({
                    error: "todos los campos son obligatorio"
                })

        }


        //1k = 1000
        //1mb = 1000000

        if(files.photo){
              console.log(files.photo)

              if(files.photo.size > 1000000){
                   return res.status(400).json({
                error : "la imagen no debe superar 1mb"
            })
              }

            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err,result)=> {
            if(err){
                return res.status(400).json({
                    error: "error al guardar el producto"
                })
            }

            res.json(result)
        })


    })

}


//sel / arrival

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */


exports.list  = (req,res) => {
       let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;


    Product.find()
        .select("-photo")
        .populate("category")
        .sort([[sortBy,order]])
        .limit(limit)
        .exec((err,data)=>{
            if(err){
            return res.status(400).json({
                error : "producto no encontrado"
            })
                  
            }
            res.json(data)
          
        })
}


exports.listRelated = (req,res) => {

        let limit = req.query.limit ? parseInt(req.query.limit) : 2;

        Product.find({_id : {$ne: req.product}, category : req.product.category})
            .limit(limit)
            .populate('category', 'id name')
            .exec((err,productos)=>{
                  if(err){
            return res.status(400).json({
                error : "producto no encontrado"
            })
                  
            }
            res.json(productos)

            })

}

exports.listCategories = (req,res) => {
    Product.distinct("category", {},(err,categories)=>{

                if(err){
            return res.status(400).json({
                error : "categoria no encontrada"
            })
                  
            }

            res.json(categories)

    })
}

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
 
// route - make sure its post
 
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select('-photo')
        .populate('category')
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: 'Products not found'
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req,res,next) => {
    if(req.product.photo.data){
        res.set('Content-Type',req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}

exports.listSearch = (req,res) => {
    //creamos un objeto para cargar la categoria y el nombre de busqueda
    const query = {}
    if(req.query.search){
        //options i lo que hace es que no ve la diferencia en mayuscula y minuscula los busca igual
        query.name = {$regex: req.query.search,$options:'i'}
        if(req.query.category && req.query.category !== 'all'){
            query.category = req.query.category
        }
        //hacemos las busqueda con las propiedades del nombre y la categoroia
        Product.find(query,(err,products)=>{
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(products)
        }).select('-photo')
    }
    

}



exports.decreaseQuantity = (req, res, next) => {
    let bulkOps = req.body.order.products.map(item => {
        return {
            updateOne: {
                filter: { _id: item._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } }
            }
        };
    });

    Product.bulkWrite(bulkOps, {}, (error, products) => {
        if (error) {
            return res.status(400).json({
                error: 'Could not update product'
            });
        }
        next();
    });
};