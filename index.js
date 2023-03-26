const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('service'));
app.use(fileUpload());


app.get('/', (req, res) => {
    res.send('Hello World!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.phmej.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("cleanMaster").collection("serviceList");
    const bookingOrderCollection = client.db("cleanMaster").collection("bookingOrder");
    const adminCollection = client.db("cleanMaster").collection("adminList");
    const reviewCollection = client.db("cleanMaster").collection("reviewList");
    console.log('db connected')


    app.get('/service', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.get('/bookingInfo/:id',(req,res) =>{
        serviceCollection.find({_id: ObjectId(req.params.id)})
        .toArray((err,documents)=>{
          res.send(documents[0]);
        } )
      })


    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ name, description,price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addAdmin', (req, res) => {
        const file = req.files.file;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        adminCollection.insertOne({email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const surname = req.body.surname;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        reviewCollection.insertOne({name,description,surname, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/addReview', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/bookingOrderList', (req, res) => {
        const newProduct = req.body;
        console.log('add new ', newProduct)
        bookingOrderCollection.insertOne(newProduct)
            .then(result => {
                console.log('inserted')
                res.send(result.insertedCount > 0)
            })

    })

    app.get('/bookingOrderList',(req,res)=>{
        bookingOrderCollection.find({email: req.query.email})
        .toArray((err,productItems)=>{
           res.send(productItems)
           console.log(productItems)
        })
                       
    })

    app.get('/userBookingOrderList',(req,res)=>{
        bookingOrderCollection.find({customerName: req.query.email})
        .toArray((err,productItems)=>{
           res.send(productItems)
           console.log(productItems)
        })
                       
    })

    app.patch('/update/:id',(req,res) =>{
        bookingOrderCollection.updateOne({_id: ObjectId(req.params.id)},
        {
          $set:{status:req.body.status}
        }
        )
        .then(result => res.send(result.modifiedCount>0))
      })


    app.delete('/deleteService/:id',(req,res)=>{
        serviceCollection.findOneAndDelete({_id: ObjectId(req.params.id)})
        .then(documents => res.send(documents))

    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })


});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})