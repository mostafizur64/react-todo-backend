const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bnfwhg6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const infoCollections = client.db("react-crud").collection("info");

    // data post to the database
    app.post("/addInfo", async (req, res) => {
      const data = req.body;
      const query = { email: data.email };
      const existingUser = await infoCollections.findOne(query);
      console.log("existing user", existingUser);
      if (existingUser) {
        return res.send({ message: "Already user Exist!" });
      }
      const result = await infoCollections.insertOne(data);
      res.send(result);
    });

    app.get("/allInfo", async (req, res) => {
      const result = await infoCollections.find().toArray();
      res.send(result);
    });

    app.put("/editInfo/:id", async (req, res) => {
      const { id } = req.params;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const data = req.body;
      console.log(data);
      const updateDoc = {
        $set: {
          name: data.name,
          email: data.email,
          location: data.location,
          message: data.message,
        },
      };
      const result = await infoCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // app.put("/editInfo/:id", async (req, res) => {
    //     const { id } = req.params;
    //     const options = { upsert: true };
    //     const data = req.body;
    //     const filter = { _id: new ObjectId(id) };
    //     const updateDoc = { $set: data }; // Use $set to update specific fields
    //     try {
    //       const result = await infoCollections.updateOne(filter, updateDoc);
    //       res.send(result);
    //     } catch (error) {
    //       console.error("Error updating data:", error);
    //       res.status(500).send("Internal server error");
    //     }
    //   });

    app.delete("/infoDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await infoCollections.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
