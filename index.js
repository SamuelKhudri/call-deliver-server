const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
// require id for delete
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gqter.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);
async function run() {
    try {
        await client.connect();
        // console.log('database connected successfully')
        const database = client.db('food_delivery');
        const productCollection = database.collection('services');
        const orderCollection = database.collection('orders');

        // get services from product api
        app.get('/services', async (req, res) => {
            const cursor = productCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // post order info to orders collection
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            console.log('post succ', result)
            res.json(result);
        })

        // get customers order in the my review page
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        })

        // dleted user for my order review page btn

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log('deleted id', result);
            res.json(result);
        })

        // add single srvice post to show it on the services
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await productCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // user update from server to show
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.send(result);
            // ai part er pore data ta /5000/users/id te pabo
        })
        // show updated data after update by put
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    address: updatedUser.address
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })



    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('call travels connected server')
});

app.listen(port, () => {
    console.log('server running at the port', port);
})