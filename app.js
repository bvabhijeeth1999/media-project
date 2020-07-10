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

app.get("/additem",function(req,res){
  res.render("additem");
});

app.post("/additem",function(req,res){
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

app.get("/",function(req,res){
  res.render("home");
});

app.get("/updateitem",function(req,res){
  res.render("updateitem");
});

app.post("/updateitem",function(req,res){
  mediaName = req.body.mediaName;
  alexaRank = req.body.alexaRank;
  pageRank = req.body.pageRank;
  politicalBias = req.body.politicalBias;
  factCheck = req.body.factCheck;
  Media.findOneAndUpdate({name: mediaName},{alexaRank: alexaRank,pageRank: pageRank,politicalBias: politicalBias,factCheck: factCheck},function(err,result){
    if(!(err)){
      console.log("successfully updated.");
    }
  });
  res.redirect("/");
});

app.get("/:name/:rank",function(req,res){
  let findname = req.params.name;
  let findrank = req.params.rank;
  Media.findOne({name: findname},function(err,result){
    if(!(err)){
      res.render('results',{name: result.name,rank: findrank,bias: result.politicalBias,factCheck: result.factCheck});
    }
  });
});

app.get("/medialist",function(req,res){
  Media.find({},function(err,results){
    if(!(err)){
      res.render('medialist',{resultArray: results});
    }
  });
});

app.get("/notfound",function(req,res){
  res.render("notfound");
});

app.post("/",function(req,res){
  var findname = req.body.mediaName;
  var normalised = [];
  var pagerankmin = 10000000;
  var pagerankmax = 0;
  var pagerankmean = 0;
  var pageranksum = 0;
  var alexarankmin = 10000000;
  var alexarankmax = 0;
  var alexarankmean = 0;
  var alexaranksum = 0;
  var totalnum = 0;
  var rank = 1;
  var findrank = 0;
  Media.find({},function(err,results){
    if(!err){
      //now the results is an array.
      results.forEach(function(element){
        if(pagerankmin > Number(element.pageRank)){
          pagerankmin = Number(element.pageRank)
        }
        if(pagerankmax < Number(element.pageRank)){
          pagerankmax = Number(element.pageRank)
        }
        if(alexarankmin > Number(element.alexaRank)){
          alexarankmin = Number(element.alexaRank)
        }
        if(alexarankmax < Number(element.alexaRank)){
          alexarankmax = Number(element.alexaRank)
        }
        alexaranksum += Number(element.alexaRank);
        pageranksum += Number(element.pageRank);
        totalnum += 1;
      });
      alexarankmean = alexaranksum/totalnum;
      pagerankmean = pageranksum/totalnum;
      console.log("alexarankmin " + alexarankmin);
      console.log("alexarankmax " + alexarankmax);
      console.log("alexaranksum " + alexaranksum);
      console.log("alexarankmean " + alexarankmean);
      console.log("pagerankmin " + pagerankmin);
      console.log("pagerankmax " + pagerankmax);
      console.log("pageranksum " + pageranksum);
      console.log("pagerankmean " + pagerankmean);

      results.forEach(function(element){
        var al = (Number(element.alexaRank)-alexarankmin)/(alexarankmax-alexarankmin);
        console.log("Printing alexa");
        console.log(al);
        var pg = (Number(element.pageRank)-pagerankmin)/(pagerankmax-pagerankmin);
        console.log("page normalised");
        console.log(pg);
        var score = ((1.65*pg)+(0.35*al))/(1.65+0.35);
        console.log(score);
        normalised.push(
          {
            name: element.name,
            score: score
          }
        );
      });
      //now all the normalised scores are pushed.
      //now need to sort and find out the rank.
      normalised.sort(function (a,b){
        // I'm assuming all values are numbers
        return b.score-a.score;
      });

      //now the normalised array is sorted.
      normalised.forEach(function(element){
        if(element.name === findname){
          findrank = rank;
        }
        else{
          rank++;
        }
      });
      //now the variable find rank contains the final rank.
      //so here with the name we need to search and then send all the data along with rank to render an ejs file.
      //nows lets try to print the sorted array
      console.log("printing sorted array");
      normalised.forEach(function(element){
        console.log(element);
      });
      if(findrank != 0){
        console.log("Rank of " + findname + " is " + findrank);
        res.redirect("/"+findname+"/"+findrank.toString());
      }
      else{
        console.log("The media you requested doesnot exist in our website's database , to view all the available media, click on the top-right media-list option");
        res.redirect("/notfound");
      }
    }
  });

});

app.listen(process.env.PORT || 3000,function(){
  console.log("Server is running on port 3000");
});
