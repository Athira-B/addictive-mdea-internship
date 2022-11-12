var mysql = require('mysql');
var multer = require('multer');
var express = require('express')
var zlib=require("zlib")
const sharp=require("sharp")
  , routes = express.Router()
  , http = require('http')
  , path = require('path')
  , app = express()
  , bodyParser=require("body-parser");
const PORT = process.env.PORT || 8000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, function () {
  console.log('Node.js server is running on port ' + PORT);
});
const DIR = './uploads';
var con = mysql.createConnection({
  host: "localhost",
  user: "sqluser",
  password: "password",
  database:"nadeem"
});
const upload=multer({
    limit:{
       fileSize:1000000
     },
     fileFilter(req,file,callback){
      if(!file.originalname.match(/\.(jpg|jpeg|png|heic)$/))
       return callback(new Error("File must be an Image"))
        callback(undefined,true)
     }
   })
var sql = "show databases";

con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result[0].Database);
  });

  app.post('/api/v1/upload',upload.single('profile'), async (req, res)=> {
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
   
     const zip = JSON.stringify(buffer).toString('base64');
    var sql = "INSERT INTO file (name,type,size ) VALUES ('" +  zip + "', '"+req.file.mimetype+"', '"+req.file.size+"')";
    
    var obj = JSON.parse(zip); 
    var buf = Buffer.from(obj, 'base64'); 
    // res.set('Content-Type','image/png')
    res.send("suc")
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
    },(error,req,res,next)=>{
      res.status(400).send({error:error.message})
  });

  app.get("/api/getimage",(req,res)=>{
    con.query("SELECT * FROM file", function (err, result, fields) {
        if (err) throw err;
        //console.log(result[0].name);
        const originalObj = JSON.parse(result[0].name)
        var buf = Buffer.from(originalObj, 'base64'); 
        res.set('Content-Type','image/png')
        res.send(buf)
        
      });
    
  })