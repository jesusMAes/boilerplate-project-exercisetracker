require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

//database
const db_uri = process.env['MONGO_URI']

//connect
const connection = mongoose.connect(db_uri,{useNewUrlParser: true, useUnifiedTopology:true, dbName:'exercise-tracker'})

//Schemas
const UserSchema = new mongoose.Schema({
  username: String ,
  log: [{}]
})

// const ExerciseSchema = new mongoose.Schema({
//   id:Number,
//   duration:Number,
//   date: String,
  
// })

//Models
let User = mongoose.model('Users', UserSchema)


//TestUser
// let manolo = new User({
//   username: 'Manolo'
// })
// manolo.save((err,user) => {
//   if(err)console.log("error")
//   console.log("save")
// })

//parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//ROUTES
app.post('/api/users', (req,res) => {
  //get info
  let username = req.body.username
  let postUser = new User({
    username: username
  })
  postUser.save((err,user) => {
    res.json({username:user.username,"_id":user._id})
  })
})

app.get('/api/users', (req,res) => {
  //get users from db, the -options prevents to retrieve exercises
  User.find({},'-log',(err, allUsers) => {
    res.json(allUsers)
  })
  
});

app.post('/api/users/:id/exercises', (req,res) => {
  //get data from body
  let id = req.params.id;
  let description = req.body.description;
  let duration = parseInt(req.body.duration);
  let date;
   if(req.body.date ==""|| req.body.date==undefined){
     date = new Date()
   }else{
     date = new Date(req.body.date);
   }

 let stringDate = date.toDateString()
 let addExercise = {
   description:description,
   duration:duration,
   date:stringDate
 }


  //get user from db
  User.findById(id, (err, user) => {
    
    if(user == null){
      return res.json({error:'no user with that id'})
    }
    user.log.push(addExercise);
    user.save((err, updated) => {
      let returnobject = {
        username:user.username,
        description: description,
        duration: duration,
        date:stringDate,
        _id:id
      }
    res.json(returnobject)
    })
  })
});


//logs
app.get('/api/users/:id/logs', (req,res) =>{
  //get queryParams
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit
  //get the user
  let id = req.params.id
  User.findById(id, (err,user) => {
    let exercises = user.log
    let count = exercises.length
    //filter dates
    if(from){
      let fromDate = new Date(from);
      exercises = exercises.filter(exe => new Date(exe.date) >fromDate);
    }
    if(to){
      let toDate = new Date(to);
      exercises = exercises.filter(exe => new Date(exe.date) <toDate)
    }
    if(limit){
      exercises = exercises.slice(0,limit)
    }
    let returnObject = {
      username: user.username,
      _id:user._id,
      log:exercises,
      count:count
    }
    res.json(returnObject)
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


//TODO THINGS
//Okay this exercise has three parts, a form with a post method that create a user in the database and a form with a post method that create an exercise, this can be made with two different schemas, the third part is handle the get, the get request, the api/users get retrieves all the user and show its as a json. 
//if we add an id with a query we show just that user
//if we add log we show that user and its exercises, for this first retrieve the user and use its id to search all the exercises with that id, put it in an array and add it 