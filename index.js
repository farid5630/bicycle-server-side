const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000; 

// middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xdgiu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('bicycle_assignment12');
        const servicesCollection = database.collection('services');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');
        const orderCollection = database.collection('allOrder')

        // get service methhod
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

       // service Is get method
        app.get('/booknow/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        
        //services  post method
        app.post('/services', async (req, res) => {
            const services = req.body;
            const result = await servicesCollection.insertOne(services);
            // console.log(services)
            res.json(result);
        })


        // reviews get method
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            // console.log(reviews);
            res.send(reviews);
        });

        // Review Post method
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            // console.log(reviews)
            res.json(result);
        })

        // user save method
        app.post('/users', async(req, res) => {
            const  user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })


        // confirm Order 
        app.post("/confirmOrder", async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
        })

        // my confirm orders
        app.post("/myOrders/:email", async(req, res) => {
            const email = req.params.email;
            const result = orderCollection.find(email).toArray();
            res.send(result);
        })


        // delete Order
        app.delete("/cancel/:id", async(req, res) => {
            const id = req.params.id;
            const result = orderCollection.deleteOne({_id:ObjectId(id)});
            res.send(result);
        })


        // admin email check
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // user update
        app.put('users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = {email: user.email}
            const options = { upsert: true };
            const updateDoc = { $set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        // make Admin

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })
       
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running bycicle Server');
});

app.listen(port, () => {
    console.log('bycicle on port', port);
})