var express = require("express");
const fs = require('fs');
var app = express();
const request = require('request');
const http = require('http');

var lastestVersion = "1.0.8";
app.set('trust proxy', true)

app.listen(88, () => {
    console.log("Listening on port 88.");
});

app.get("/version", async (req, res, next) => {
    res.send(lastestVersion)
});

app.get("/devices/version", async (req, res, next) => {
    //var conn = await request(`http://holovistic.com:88/version`)
    //var conn = request(`http://4463824e8414.ngrok.io/devices/version`)
    //var content = await request(`http://4463824e8414.ngrok.io/devices/version`)
    //var conn = http.get(`http://4463824e8414.ngrok.io/devices/version`)
    http.get(`http://holovistic.com:88/version`, (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
    data += chunk;
    });
    // The whole response has been received. Print out the result.
        resp.on('end', () => {
        console.log(JSON.parse(data).explanation);
    });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    res.send('OK')
});

app.get("/checksum", async (req, res, next) => {
    res.send('ilnkj4geriltnjrh4j3rt;g4jkghm')
});
app.get("/bin/*", async (req, res, next) => {
    var url = req.url.substr(1, req.url.length).split("?")[0].split('/');
    var par = url[url.length-1];
    var data = await fs.readFileSync(`firmware/${lastestVersion}.bin`);
    res.send(data);
    //var conn = await request(`http://4463824e8414.ngrok.io/devices/version?version=${lastestVersion}&deviceID=${par}`)
});