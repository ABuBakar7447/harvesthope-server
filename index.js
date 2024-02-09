const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   // console.log(authorization)

//   if (!authorization) {
//     return res.status(401).send({ error: true, message: 'unauthorized access' });
//   }

//   const token = authorization.split(' ')[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ error: true, message: 'unauthorized access' })
//     }

//     req.decoded = decoded;
//     next();
//   })
// }


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ekuronr.mongodb.net/?retryWrites=true&w=majority`;

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

        const donationCollection = client.db("hopeharvest").collection("donationCollection");
        const usersCollection = client.db("hopeharvest").collection("usersCollection");
        const userDonationCollection = client.db("hopeharvest").collection("userDonationCollection");



        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })

        app.get('/donationCollection', async (req, res) => {
            const result = await donationCollection.find().toArray();
            res.send(result);
        })

        app.get('/alluser', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })



        app.get('/donationCollection/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)

            const query = { _id: new ObjectId(id) };
            const result = await donationCollection.findOne(query);
            res.send(result);
        });



        //user data storing api
        app.post('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'the user is already exist in the database' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })



        app.put('/donationdataupdate/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const userEdit = req.body;
            const option = { upsert: true }
            // console.log(userEdit, id)
            const updateEdit = {
                $set: {
                    id: userEdit.donataionnew.id,
                    categoryName: userEdit.donataionnew.categoryName,
                    categoryHeading: userEdit.donataionnew.categoryHeading,
                    details: userEdit.donataionnew.details,
                    img: userEdit.donataionnew.img,
                    price: userEdit.donataionnew.price
                }
            }
            console.log(updateEdit);
            const result = await donationCollection.updateOne(filter, updateEdit, option);
            res.send(result);
        })


        app.post('/donationDataAdd', async (req, res) => {
            const query = req.body;
            console.log(query);
            const result = await donationCollection.insertOne(query);
            res.send(result);
        })


        app.post('/userDonationDataAdd', async (req, res) => {
            const query = req.body;
            console.log(query);
            const result = await userDonationCollection.insertOne(query);
            res.send(result);
        })



        app.get('/userdonationCollection', async (req, res) => {
            const email = req.query.email;
            console.log('email:', email)

            if (!email) {
                res.send([])
            }

            // const decodedEmail = req.decoded.email;
            // // console.log('decodedemail:', decodedEmail);

            // if (email !== decodedEmail) {
            //   return res.status(403).send({ error: true, message: 'forbidden access' })
            // }


            const query = { email: email };
            const result = await userDonationCollection.find(query).toArray();
            res.send(result);
        });



        app.delete('/donationdelete/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)

            const query = { _id: new ObjectId(id) };
            const result = await donationCollection.deleteOne(query);
            res.send(result);
        });



        //set a role for user
        app.patch('/makeadmin/:id', async (req, res) => {
            const id = req.params.id;
            console.log('makeadminid',id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        


        // "headers":{"Access-Control-Allow-Origin":"*"}

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
    res.send("HopeHarvest is running");
})

app.listen(port, () => {
    console.log(`HopeHarvest is running on port ${port}`)
})























// const express = require('express');
// const app = express();
// const cors = require('cors');
// require('dotenv').config()
// const port = process.env.PORT || 5000;


// app.use(cors());
// app.use(express.json());

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ekuronr.mongodb.net/?retryWrites=true&w=majority`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });


// client.connect().then(() => {
//     const usersCollection = client.db("gadgetFLow").collection("gadgetCollection");

//     // Routes that require database interaction
//     app.get('/user', async (req, res) => {
//         const result = await usersCollection.find().toArray();
//         res.send(result);
//     });

//     // Other routes can be defined here

//     // Ping MongoDB to confirm a successful connection
//     client.db("admin").command({ ping: 1 }).then(() => {
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");

//         // Start the Express server after the database connection is established
//         app.listen(port, () => {
//             console.log(`GadgetFlow is running on port ${port}`);
//         });
//     }).catch(err => {
//         console.error("Error pinging MongoDB:", err);
//     });
// }).catch(err => {
//     console.error("Error connecting to MongoDB:", err);
// });





// async function run() {
//     try {


//         // Connect the client to the server	(optional starting in v4.7)
//         client.connect();

//         const usersCollection = client.db("gadgetFLow").collection("gadgetCollection");

//             // Routes that require database interaction
//             app.get('/user', async (req, res) => {
//                 const result = await usersCollection.find().toArray();
//                 res.send(result);
//             });

//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         //await client.close();
//     }
// }
// run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send("FoodVillage Server Is Running")
// });

// app.listen(port, () => {
//     console.log(`FoodVillage Server Is running on ${port}`);
// })



