import fetch from 'node-fetch';
import { createRequire } from 'module';
const require = createRequire(
    import.meta.url);



var express = require("express");
const fs = require('fs');
var app = express();
const request = require('request');
const http = require('http');

var lastestVersion = "1.0.8";
app.set('trust proxy', true)

let jwt_token = ''

app.listen(26888, () => {
    console.log("Listening on port 26888.");
});

app.get("/version", async(req, res, next) => {
    res.send(lastestVersion)
});

app.get("/devices/version", async(req, res, next) => {
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

app.get("/checksum", async(req, res, next) => {
    res.send('ilnkj4geriltnjrh4j3rt;g4jkghm')
});
app.get("/bin/*", async(req, res, next) => {
    var url = req.url.substr(1, req.url.length).split("?")[0].split('/');
    var par = url[url.length - 1];
    var data = await fs.readFileSync(`firmware/${lastestVersion}.bin`);
    res.send(data);
    //var conn = await request(`http://4463824e8414.ngrok.io/devices/version?version=${lastestVersion}&deviceID=${par}`)
});


// ------------------- chirpstack downlink -----------------

async function chirpstack_login(email, password) {
    try {
        const res = await fetch(`https://loraserver.gwin.emsd.gov.hk/api/internal/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const json = await res.json();
        // jwt_token = json.token
        return json.jwt
    } catch (e) {
        console.log(e)
    }
}

async function chirpstack_postDownlink(jwt_token, device_eui, body) {
    try {
        const res = await fetch(`https://loraserver.gwin.emsd.gov.hk/api/devices/${device_eui}/queue`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        const json = await res.json();
        return json
    } catch (e) {
        console.log(e)
    }
}

async function chirpstack_flushDownlink(jwt_token, device_eui) {
    try {
        const res = await fetch(`https://loraserver.gwin.emse.gov.hk/api/devices/${device_eui}/queue`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwt_token}`
            }
        })
    } catch (e) {
        console.log(e)
    }
}



let post_downlink_body = {}
post_downlink_body = {
    "deviceQueueItem": {
        "confirmed": true,
        "devEUI": "8cf9572000074a80",
        "fPort": 9,
        "jsonObject": "{\"version_num1\":1,\"version_num2\":0,\"version_num3\":2,\"ip_num1\":218,\"ip_num2\":253, \"ip_num3\":145,\"ip_num4\":198,\"port_num1\":80, \"port_num2\":80}"
    }
}

// let eui_list = ["8cf9572000074a80", "8cf9572000074adc", "8cf9572000074aac", "8cf9572000074ae4", "8cf9572000074ae7", "8cf9572000074aea", "8cf9572000074aba", "8cf9572000074b6f", "8cf9572000074ad2"]

let device_eui_list = {
    HbAs_101: '8cf9572000074a80',
    HbAs_102: '8cf9572000074adc',
    HbAs_103: '8cf9572000074aac',
    HbAs_104: '8cf9572000074ae4',
    HbAs_105: '8cf9572000074ae7',
    HbAs_107: '8cf9572000074aea',
    HbAs_108: '8cf9572000074aba',
    HbAs_109: '8cf9572000074b6f',
    HbAs_110: '8cf9572000074ad2'
}

async function chirpstack_downlink_eui(device_eui) {
    let downlink = await chirpstack_postDownlink(jwt_token, device_eui, post_downlink_body)
    if (JSON.stringify(downlink).includes('jwt parse error')) {
        jwt_token = await chirpstack_login("handbrake@muselabs-eng.com", "q2dgbahR")
        downlink = await chirpstack_postDownlink(jwt_token, device_eui, post_downlink_body)
    }
    console.log(downlink)
}

async function chirpstack_downlink_all_eui() {
    // eui_list.map(eui => {
    //     chirpstack_downlink_eui(chirpstack_downlink_eui(eui))
    // })
    for (const HbAs_no in device_eui_list) {
        console.log(HbAs_no + ":")
        await chirpstack_downlink_eui(device_eui_list[HbAs_no])
    }
    console.log("ended all device downlink")
}

jwt_token = await chirpstack_login("handbrake@muselabs-eng.com", "q2dgbahR")

setInterval(chirpstack_downlink_all_eui, 20000);

// while (true) {
//     chirpstack_downlink_all_eui(eui_list);
// }