const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')


app.use(express.static('public'))

// this is the version of the data
let globalVersion = 0
// the data
const companies = {
  "aaa" : {"subs" : 0}, 
  "bbb" : {"subs" : 0}, 
  "ccc" : {"subs" : 0}, 
  "ddd" : {"subs" : 0}, 
};

// route to serve the home page
app.get('/' , (req , res) => {
  const page = fs.readFileSync(path.join(__dirname , "index.html") , "utf-8")
  res.status(200).send(page)
})

// route to handle the post request
app.post('/subscribe/:str' , (req , res) => {
  companies[req.params.str].subs++;
  globalVersion++
  res.status(200).json({message : `subscribed to the ${req.params.str} companie ` , companie :  companies[req.params.str]})

})

// the event stream
app.get('/sse' , (req , res) => {
  res.set('Content-Type', "text/event-stream")
  res.set('Connection', "keep-alive")
  res.set("Access-Control-Allow-Origin", "*")
  res.set("Cache-Control", "no-cache")
  console.log('the client is connected !')
  // define the status of the client sent event regarding the global version of the database
  let localVersion = 0;
  setInterval(() => {
    // with the local and global version , we can now dsend the event only when the database is updated instead of sending the stream repeatedly
    if(localVersion < globalVersion) {
      res.status(200)
      res.write(`id: ${new Date().toLocaleTimeString()}\ndata: ${JSON.stringify(companies)}\n\n`)
      localVersion = globalVersion
    }
    // send the event after 100 of the action of changing the database
  },100);
})

app.listen(80 , () => console.log('the server is listening !'))
// when restarting the server, the database is reset