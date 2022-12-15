const express = require('express')
const path = require("node:path")
const mongoose = require("mongoose")
const moment = require("moment")
const { Console } = require('node:console')
const router = express.Router()
const app = express()
const port = 3000
// Try to decode it >< plz
const password = Buffer.from("cGhwYmVzdGxhbmd1YWdlCg==",'base64')
var model
const schema = new mongoose.Schema({
    user: String,
    content: String,
    time: String
})

var history = []

function DBInitialize(){
    mongoose.set('strictQuery', false);
    mongoose.connect(`mongodb+srv://admin:${password}@webcoursehw.axgu47c.mongodb.net/db?retryWrites=true&w=majority`)
    model = mongoose.model("records", schema)
}

async function loadFromAltas(){
    let data = []
    let arr = await model.find({})
    for(let item of arr){
        data.push({
            user: item.user,
            say: item.content,
            time: item.time
        })
    }
    history = data
    return history
}

async function saveToAltas(){
    let data = []
    for(let item of history){
        data.push({
            user: item.user,
            content: item.say,
            time: item.time
        })
    }
    await model.deleteMany({})
    await model.insertMany(data)
}

function submitHistory(user, say){
    if(user!="" && say!="") {
        let data = {
            user: user,
            say: say,
            time: moment().format("YYYY/MM/DD h:mm:ss A")
        }
        history.push(data)
    }
    return history
}

function clearHistory(){
    history = []
}

function start(){
    DBInitialize()
    loadFromAltas()
    app.listen(port, ()=>{
        console.log(`Starting server on port ${port}`)
    })
}

router.use(express.static("index.html"))

router.get("/", async (req, res) => {
    if(history.length == 0){
        let re = await loadFromAltas()
    }
    res.sendFile(path.resolve("index.html"))
})

router.get("/chat", (req, res) => {
    let re = submitHistory(req.query.user, req.query.say)
    res.json(re)
})

router.get("/chat/clear", (req, res) => {
    clearHistory()
    res.sendStatus(200)
})

router.get("/chat/save", (req, res) => {
    saveToAltas()
    res.send("Save successed!")
})

router.get("/chat/reload", async (req, res) => {
    let re = await loadFromAltas()
    res.json(re)
})

router.get("*", (req, res) => {
    res.status(404).send('what???');
})

app.use('/', router)

start()

