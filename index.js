const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9c3fo4b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-uo7wroz-shard-00-00.hhdlhdj.mongodb.net:27017,ac-uo7wroz-shard-00-01.hhdlhdj.mongodb.net:27017,ac-uo7wroz-shard-00-02.hhdlhdj.mongodb.net:27017/?ssl=true&replicaSet=atlas-76jre8-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeesCollection = client.db('coffeesDB').collection('coffees');
        const userCollection = client.db("coffeesDB").collection("users");

        // coffees curd oparetion start here
        app.get('/coffees', async (req, res) => {
            // const cursor = coffeesCollection.find();
            // const result = await cursor.toArray();
            const result = await  coffeesCollection.find().toArray();
            res.send(result);
        });
        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeesCollection.findOne(query);
            res.send(result);
        })
        app.post('/coffees', async (req, res) => {
            const newCoffee = req.body;
            const result = await coffeesCollection.insertOne(newCoffee);
            res.send(result);
        })
        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCoffee = req.body;
            const updatedDoc = {
                $set: updatedCoffee
            }
            // const updatedDoc = {
            //     $set: {
            //         name: updatedCoffee.name, 
            //         supplier: updatedCoffee.supplier
            //     }
            // }
            const result = await coffeesCollection.updateOne(filter, updatedDoc, options);

            res.send(result);
        })
        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeesCollection.deleteOne(query);
            res.send(result);
        })
        // coffees curd oparetion end here

        // user CURD Oparation start here
        app.post("/users" , async(req , res)=>{
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser)
            res.send(result)
        })
        app.get("/users" , async(req , res)=>{
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        app.delete("/users/:id", async(req , res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)}
            const result = await userCollection.deleteOne(query)
            res.send(result)
        } )
        app.patch("/users" , async(req , res)=>{
            const {email , lastSignInTime} = req.body;
            const filter = {email:email}
            const updatedDoc={
                $set:{
                    lastSignInTime,
                }
            }
            const result = await userCollection.updateOne(filter , updatedDoc)
            res.send(result)
            console.log(updatedDoc)
        })
        // user CURD Oparation End here


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter.')
});

app.listen(port, () => {
    console.log( `Coffee server is running on port ${port}`)
})