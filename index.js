var mysql = require("mysql");
var multer = require("multer");
var express = require("express");
var pdf = require("pdf-creator-node");
var fs = require("fs");
var zlib = require("zlib");
const sharp = require("sharp"),
  routes = express.Router(),
  http = require("http"),
  path = require("path"),
  app = express(),
  bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, function () {
  console.log("Node.js server is running on port " + PORT);
});
const DIR = "./uploads";
var con = mysql.createConnection({
  host: "localhost",
  user: "sqluser",
  password: "password",
  database: "nadeem",
});
const upload = multer({
  limit: {
    fileSize: 1000000,
  },
  fileFilter(req, file, callback) {
    callback(undefined, true);
  },
});
var sql = "show databases";

con.query(sql, function (err, result) {
  if (err) throw err;
  console.log("Result: " + result[0].Database);
});

app.get("/pdf", (req, res) => {
  var stream = fs.createReadStream("E:/backend/Mysql/some.pdf");
  var filename = "What.pdf";
  filename = encodeURIComponent(filename);
  // Ideally this should strip them

  res.setHeader("Content-disposition", 'inline; filename="' + filename + '"');
  res.setHeader("Content-type", "application/pdf");

  stream.pipe(res);
});

app.post(
  "/api/v1/upload",
  upload.single("resume"),
  async (req, res) => {
    const buffer = await req.file.buffer;
    const zip = JSON.stringify(buffer).toString("base64");
    var sql =
      "INSERT INTO file (name,dob,resumebuffer,resumename,resumesize ) VALUES ('" +
      req.body.name +
      "','" +
      req.body.dob +
      "', '" +
      zip +
      "','" +
      req.file.filename +
      "', '" +
      req.file.size +
      "')";
 

    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      res.send("success");
    });
       // res.contentType("application/pdf");
    // res.send(buffer)

    // var obj = JSON.parse(zip);
    // var buf = Buffer.from(obj, 'base64');

    // fs.writeFileSync('some.pdf',buffer)
    // res.contentType("application/pdf");
    //res.attachment('pdfname.pdf');

    // res.set('Content-Type','image/png')
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

app.get("/get-info",(req,res)=>{
    con.query("SELECT * FROM file", function (err, result, fields) {
        if (err) throw err;
        res.send(result)
        // const originalObj = JSON.parse(result[0].name);
        // var buf = Buffer.from(originalObj, "base64");
        // res.set("Content-Type", "image/png");
        // res.send(buf);
      });
})
app.get("/api/getimage", (req, res) => {
  con.query("SELECT * FROM file", function (err, result, fields) {
    if (err) throw err;
    //console.log(result[0].name);
    const originalObj = JSON.parse(result[0].name);
    var buf = Buffer.from(originalObj, "base64");
    res.set("Content-Type", "image/png");
    res.send(buf);
  });
});
