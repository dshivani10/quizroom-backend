import express from "express";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors()) ;
const uri = "mongodb+srv://nisumdbuser:nisum2022@cluster0.9fvhmaa.mongodb.net/?retryWrites=true&w=majority";

app.get('/api/quizzes/:id', async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();
    const db = client.db('test-myself-db');

    const id = req.params.id;
    const quiz = await db.collection('quizData').findOne({ "_id": new ObjectId(id) });
    if(quiz){
        res.json(quiz);
    }
    else{
        res.sendStatus(404).send('Quiz data not found !');
    }
});

app.get('/api/all-quizzes', async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();
    const db = client.db('test-myself-db');

    const cursor = db.collection('quizData').find().project({subtopic:1,topic:1,imageurl:1,hoverimageurl:1});
    if ((await cursor.count()) !== 0) {
        let quiz = [];
        await cursor.forEach((e)=>{
            quiz.push(e);
        });
        res.json(quiz);
    }
    else{
        res.sendStatus(404).send('Quiz data not found !');
    }
});

app.post('/api/quizzes/:id/question', async (req, res) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    await client.connect();

    const db = client.db('test-myself-db');

    const id = req.params.id;
    const questionData = req.body;
    await db.collection('quizData').updateOne({"_id": new ObjectId(id)}, {
        $push: {questions: {id: new ObjectId(), ...questionData }}
    });
    const quiz = await db.collection('quizData').findOne({ "_id": new ObjectId(id) });

    if(quiz) {
        res.send(quiz);
    }
    else{
        res.sendStatus(404).send('Failed to add a question !');
    }
});


app.get('/', async (req, res) => {
    res.send('Quiz Room APIs are running!');
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});