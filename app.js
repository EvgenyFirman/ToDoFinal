//jshint esversion:6

const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-eugene:e121197ft868eb@cluster0-u47nu.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);

let itemOne = new Item ({
  name: "Do first task"
});

let itemTwo = new Item({
  name: "Do second task"
});

let itemThree = new Item({
  name: "Do third task"
});

const defaultItems = [itemOne,itemTwo,itemThree];

const listSchema = new mongoose.Schema({

  name: String,

  item:[itemsSchema]

});

const List = new mongoose.model("List", listSchema);





app.get("/",function(req,res){

  Item.find({}, function(err, foundItems){

      if(foundItems === 0){

        Item.insertMany(defaultItems, function(err){

          if(err){

            console.log("There is an error");

          } else {

            console.log("Successfully saved to db");

          } 

        });

        res.redirect("/")

      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

      });

  });



app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list;



  const item = new Item({

    name: itemName

  });

  if(listName === "Today"){

      item.save();

      res.redirect("/");

  } else {

    List.findOne({name: listName}, function(err, foundList){

      foundList.item.push(item);

      foundList.save();

      res.redirect("/" + listName);

    })
  }
});

app.post("/delete", function(req,res){

  const selectedItem = req.body.checkbox;

  const listName = req.body.listName;


  if(listName === "Today"){

      Item.deleteOne({_id: selectedItem}, function(err){

        res.redirect("/");

      });
      

  } else { 

    List.findOneAndDelete({name: listName},{$pull: {items: {_id: selectedItem}}},function(err, foundList){
        if(!err){

          res.redirect("/" + listName);

        }
    });
};
});

app.get("/:param", function(req,res){

 const parameter = _.capitalize(req.params.param);

 

 List.findOne({name: parameter}, function(err,foundList){

  if(!err){
      if (!foundList){

          const list = new List({

          name: parameter,

          item: defaultItems

      });
      
      list.save();

      res.redirect("/" + parameter);

      } else {
        
        res.render("list", {listTitle: req.params.param, newListItems: foundList.item});
      
      }

 }

});

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
