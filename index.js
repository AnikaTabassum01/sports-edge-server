require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.00cx3qd.mongodb.net/?retryWrites=true&w=majority`;

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

    const usersCollection = client.db("sportsEdgeDb").collection("users");
    const instructorCollection = client.db("sportsEdgeDb").collection("instructors");
    const classCollection = client.db("sportsEdgeDb").collection("allClasses");
    const selectedClassCollection = client.db("sportsEdgeDb").collection("selectedClass");
    const reviewCollection = client.db("sportsEdgeDb").collection("reviews");

    // users related apis
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);
       if (existingUser) {
         return res.send({})
       }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);

    })


    app.get('/allUsers', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
  })

    app.get('/instructor', async(req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    })

    app.get('/allClasses', async(req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    })

    app.get('/reviews', async(req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })

    // selected class api
    app.get('/selectedClass', async(req, res) => {
      const email = req.query.email;
      if(!email){
        res.send([]);
      }
      const query = { email: email };
      const result = await selectedClassCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/selectedClass', async(req, res) => {
      const selectedClass = req.body;
      console.log(selectedClass);
      const result = await selectedClassCollection.insertOne(selectedClass);
      res.send(result);
    })

    app.delete('/selectedClass/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(query);
      res.send(result)
  })


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
    res.send('sports details is coming')
  })
  
  app.listen(port, () => {
    console.log(`Details coming on port ${port}`);
  })