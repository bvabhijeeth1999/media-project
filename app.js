const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://abhijeeth:test1234@cluster0-8qxkw.mongodb.net/mediaRank",{useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.connect("mongodb://localhost:27017/mediaRank",{useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// media Schema .
const mediaSchema = new mongoose.Schema({
  name: String,
  alexaRank: String,
  pageRank: String,
  politicalBias: String,
  factCheck: String
});


// media model
const Media = mongoose.model("Media",mediaSchema);

app.get("/",function(req,res){
  res.render("additem");
});

app.post("/",function(req,res){
  mediaName = req.body.mediaName;
  alexaRank = req.body.alexaRank;
  pageRank = req.body.pageRank;
  politicalBias = req.body.politicalBias;
  factCheck = req.body.factCheck;
  const media = new Media({
    name: mediaName,
    alexaRank: alexaRank,
    pageRank: pageRank,
    politicalBias: politicalBias,
    factCheck: factCheck
  });
  media.save();
  res.redirect("/");
});

app.listen(process.env.PORT || 3000,function(){
  console.log("Server is running on port 3000");
});
