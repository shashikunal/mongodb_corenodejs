const fs = require("fs");
const { createServer } = require("http");
const { connect } = require("mongodb").MongoClient;
const { parse } = require("querystring");

//database urls
let mongodb_cloud_url =
  "";
let mongodb_local_url = "mongodb://localhost:27017/";

function connectDatabase(request, callback) {
  let body = "";
  request.on("data", chunk => {
    body += chunk.toString();
  });
  request.on("end", _ => {
    callback(parse(body));
  });
}

const server = createServer((req, res) => {
  if (req.method === "POST") {
    connectDatabase(req, result => {
      console.log(result);
      connect(
        mongodb_local_url,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, db) => {
          if (err) throw err;
          //create collection
          let database = db.db("Employees"); //dbName
          database.collection("employee", (err, empInfo) => {
            if (err) throw err;
            empInfo.insertMany([result], (err, info) => {
              if (err) throw err;
              console.log("successfully employee data created", info);
            });
          });
        }
      );
    });
    res.end("successfully db created");
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(__dirname + "/index.html", "utf8").pipe(res);
  }
});

server.listen(5000, err => {
  if (err) throw err;
  console.log("server is running on port number 5000");
});
