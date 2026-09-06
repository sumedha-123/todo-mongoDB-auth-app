require("dotenv").config();

console.log("JWT exists:", !!process.env.JWT_SECRET);
console.log("Mongo exists:", !!process.env.MONGO_URI);

const express= require("express");
const {UserModel,TodoModel}= require("./db");
const jwt=require("jsonwebtoken");
const path = require("path");

const app=express();
app.use(express.json());

app.post("/signup",async function(req,res){
   const email= req.body.email;
   const password=req.body.password;
   const name=req.body.name;

    await UserModel.create({
      email:email,
      password:password,
      name:name
   })
    res.json({
      message:"you are singned up!"
    })
})

app.post("/signin",async function(req,res){
    const email= req.body.email;
   const password=req.body.password;

   const user= await UserModel.findOne({
      email:email,
      password:password
   })
   if(user){
     const token=jwt.sign({
      id:user._id.toString()
     },process.env.JWT_SECRET);
     res.json({
       token:token
     })
   }
})

app.put("/todos/:id", auth, async function(req, res) {

    const id = req.params.id;

    await TodoModel.findByIdAndUpdate(id, {
        description: req.body.description
    });

    res.json({
        message: "Todo updated"
    });
});

app.delete("/todos/:id", auth, async function(req, res) {

    const id = req.params.id;

    await TodoModel.findByIdAndDelete(id);

    res.json({
        message: "Todo deleted"
    });
});

function auth(req,res,next){
   const token=req.headers.token;
   if(!token){
      return res.status(401).json({
         messgae:"Token missing"
      });
   }
     const decoded=jwt.verify(token,process.env.JWT_SECRET);
    if(decoded.id){
      req.userId=decoded.id;
      next();
    }
    else{
      res.json({
         message:"you are not logged in"
      })
    }
}

app.post("/todos",auth,async function(req,res){
    const userId=req.userId;
    const description=req.body.description;
    const done=req.body.done;

    await TodoModel.create({
      description, done,userId
    })

    res.json({
      message:"Todo is created!"
    })
})

app.get("/todos",auth,async function(req,res){
     const userId=req.userId;
     const todos=await TodoModel.find({
      userId
     })

    res.json({
      todos
    })
})

app.get("/",function(req,res){
    res.sendFile(path.join(__dirname,"..","frontend","/index.html"));
})
app.get("/signup",function(req,res){
    res.sendFile(path.join(__dirname,"..","frontend","/signup.html"));
})
app.get("/signin",function(req,res){
    res.sendFile(path.join(__dirname,"..","frontend","/signin.html"));
})

app.listen(3004);