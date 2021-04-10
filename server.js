require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser')
var mongo = require('mongodb')
var mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');

// SET-UP MONGOOSE
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

console.log('conn status:  '+mongoose.connection.readyState);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


// Your first API endpoint
// Final Solution
let urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  short_url: {type: Number}
  })
let urlModel = mongoose.model('URL', urlSchema)

// Gett the URL Input Parameter
let responseObject = {}

app.post('/api/shorturl/new', bodyParser.urlencoded({extended: false}), (req, res) => {
  let inputUrl = req.body.url
  console.log("Input URL: ", inputUrl)
//  console.log("re.body: ", req.body)
  
//  res.json(responseObject)
const something = dns.lookup(urlparser.parse(inputUrl).hostname, (err, address) => {
    if (!address) {
      res.json({error: "Invalid URL"})
    } else {
      responseObject['original_url'] = inputUrl
    }
})


// Stack Overflow solution for URL validations - not working
/*
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)  

  if(!inputUrl.match(urlRegex)) {
    //res.json({error: 'invalid url'}    )
    res.json({error: "Invalid URL"})

    return
  }
responseObject['original_url'] = inputUrl
*/  
  //  res.json(responseObject)

// Set short value of input URL
let inputShort = 1

urlModel.findOne({})
      .sort({short_url: 'desc'})
      .exec((error, result) => {
        if(!error && result != undefined){
          inputShort = result.short_url + 1
        }
        if(!error){
          urlModel.findOneAndUpdate(
            {original_url: inputUrl},
            {original_url: inputUrl, short_url: inputShort},
            {new: true, upsert: true },
            (error, savedUrl)=> {
              if(!error){
                responseObject['short_url'] = savedUrl.short_url
                res.json(responseObject)
              }
            }
          )
        }
})

})

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input
  
  urlModel.findOne({short_url: input}, (error, result) => {
    if(!error && result != undefined){
      res.redirect(result.original_url)
    }else{
      res.json('URL not Found')
    }
  })
})


/*

// Your first API endpoint
// Solution #2
let urlSchema = new mongoose.Schema({
  original: {type: String, required: true},
  short: {type: Number}
  })
let urlModel = mongoose.model('URL', urlSchema)

// Gett the URL Input Parameter
let responseObject = {}

app.post('/api/shorturl/new', bodyParser.urlencoded({extended: false}), (req, res) => {
  let inputUrl = req.body.url
  console.log("Input URL: ", inputUrl)
//  console.log("re.body: ", req.body)
  
//  res.json(responseObject)
const something = dns.lookup(urlparser.parse(inputUrl).hostname, (err, address) => {
    if (!address) {
      res.json({error: "Invalid URL"})
    } else {
      responseObject['original_url'] = inputUrl
    }
})


// Stack Overflow solution for URL validations - not working
/*
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)  

  if(!inputUrl.match(urlRegex)) {
    //res.json({error: 'invalid url'}    )
    res.json({error: "Invalid URL"})

    return
  }
responseObject['original_url'] = inputUrl
*/  
  //  res.json(responseObject)
/*
// Set short value of input URL
let inputShort = 1

urlModel.findOne({})
      .sort({short: 'desc'})
      .exec((error, result) => {
        if(!error && result != undefined){
          inputShort = result.short + 1
        }
        if(!error){
          urlModel.findOneAndUpdate(
            {original: inputUrl},
            {original: inputUrl, short: inputShort},
            {new: true, upsert: true },
            (error, savedUrl)=> {
              if(!error){
                responseObject['short_url'] = savedUrl.short
                res.json(responseObject)
              }
            }
          )
        }
})

})

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input
  
  urlModel.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      res.redirect(result.original)
    }else{
      res.json('URL not Found')
    }
  })
})

*/


/*
// Solution #1
//Create the URL Schema
let schema = new mongoose.Schema({
  url : 'string' })
//Create the URL Model
let Url = mongoose.model('Url', schema)

app.use(bodyParser.urlencoded({ extended: false }))

app.post('/api/shorturl/new',  (req, res) => {
  const bodyurl = req.body.url;

  const something = dns.lookup(urlparser.parse(bodyurl).hostname, (err, address) => {
    if (!address) {
      res.json({error: "Invalid URL"})
    } else {
      const url = new Url({url: bodyurl})
      url.save((err, data) => {
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      })
      
  }
  })
 
})

app.get('/api/shorturl/:id', (req,res) => {
  const id = req.params.id;
  url.findById(id,(err,data) => {
    if (!data) {
      res.json({error: "Invalid URL"})
    } else {
      res.redirect(data.url)
    }
  })

})
*/