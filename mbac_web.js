var fs = require("fs");
var exec = require('child_process').exec;

function aeha(T, bytes, repeats, interval) {
    var result = "";
    var i = 0;
    var length = bytes.length;
    while (true) {
        result += T * 8 + " " + T * 4 + "\n"; // Leader
        for (var j = 0; j < length; j++) {
            for (var k = 0; k < 8; k++) {
                if ((bytes[j] & (1 << k)) != 0) { // 1
                    result += T + " " + T * 3 + "\n";
                } else { // 0
                    result += T + " " + T + "\n";
                }
            }
        }
        if (++i >= repeats) {
            result += T;
            break;
        } else {
            result += T + " " + interval + "\n"; // Trailer
        }
    }
    return result;
}

function bytesFromState(state) {
    var bytes = [0x23, 0xcb, 0x26, 0x01, 0x00, 0x00, 0x58, 12, 0x02, 0x40, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0];
    bytes[5] = (state.power) ? 0x20 : 0; // power
    bytes[6] = {"cool": 0x58, "heat": 0x48, "dry": 0x50, "wind": 0x38}[state.mode]; // mode

    // temperature, intensity
    if (state.mode == "cool") {
        bytes[7] = state.coolTemperature - 16;
        bytes[8] = 0x6;
    } else if (state.mode == "heat") {
        bytes[7] = state.heatTemperature - 16;
    } else if (state.mode == "dry") {
        bytes[8] = {"high": 0x0, "normal": 0x2, "low": 0x4}[state.dryIntensity];
    }

    // wind horizontal
    if (state.horizontal >= 6) {
        bytes[8] += 0xc0;
    } else {
        bytes[8] += state.horizontal << 4;
    }

    // wind vertical
    if (state.vertical >= 6) {
        bytes[9] += 0x38;
    } else {
        bytes[9] += state.vertical << 3;
    }

    // wind speed
    if (state.speed >= 4) {
        bytes[9] += 3;
        bytes[15] = 0x10;
    } else {
        bytes[9] += state.speed;
    }
    
    // wind area
    bytes[13] = {"none": 0x00, "whole": 0x8, "left": 0x40, "right": 0xc0}[state.area];

    // update check byte
    var sum = 0;
    for (var i = 0; i < 17; i++) {
        sum += bytes[i];
    }
    bytes[17] = sum & 0xff;

    return bytes;
}

var currentState = {
    "power": false, 
    "mode": "cool", // 運転モード（cool: 冷房, heat: 暖房, dry: 除湿, wind: 送風）
    "coolTemperature": 28, // 冷房時の設定温度（16~31）
    "heatTemperature": 20, // 暖房時の設定温度（16~31）
    "dryIntensity": "normal", // 除湿強度（high: 強, normal: 標準, low: 弱）
    "horizontal": 5, // 風向左右（1: 最左 ~ 3: 中央 ~ 5: 最右, 6: 回転）
    "vertical": 0, // 風向上下（0: 自動, 1: 最上 ~ 5: 最下, 6: 回転）
    "speed": 0, // 風速（0: 自動, 1: 弱, 2: 中, 3: 強, 4: パワフル）
    "area": "none" // 風エリア（none: 風左右の値を利用, whole: 全体, left: 左半分, right: 右半分）
};

try {
    currentState = JSON.parse(fs.readFileSync("mbac.sav", "utf8"));
} catch(error) {}

function saveCurrentState() {
    fs.writeFileSync('mbac.sav', JSON.stringify(currentState));
}

// Setup Server
var server = require("http").createServer(function(req, res) {
    var url = req.url;
    if (url == "/") {
        url = "/index.html";
    }
    var textTypes = {"html": "text/html", "js": "text/javascript", "css": "text/css", "svg": "image/svg+xml"};
    var binaryTypes = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "gif": "image/gif", "ico": "image/x-icon"};
    var dotIndex = url.lastIndexOf(".");
    var fileExt = url.slice(dotIndex - url.length + 1);
    try {
        if (binaryTypes[fileExt]) {
            var output = fs.readFileSync("static" + url, "binary");
            res.writeHead(200, {"Content-Type": binaryTypes[fileExt]});
            res.write(output, "binary");
        } else if (textTypes[fileExt]) {
            var output = fs.readFileSync("static" + url, "utf-8");
            res.writeHead(200, {"Content-Type": textTypes[fileExt]});
            res.write(output);
        }
        res.end();
    } catch(e) {
        //console.log(e);
    }
}).listen(8080);
var io = require('socket.io').listen(server);

io.sockets.on("connection", function(socket) {

    io.to(socket.id).emit("mbac_update", currentState);

    socket.on("mbac_update", function(state) {
        if (state) {
            currentState = state;
            var bytes = bytesFromState(state);
            var signal = aeha(430, bytes, 2, 13300);
            exec("echo \"" + signal.replace(/\n/g, "\\n") + "\" | sudo ./send 18", function() {});
            io.sockets.emit("mbac_update", currentState);
            saveCurrentState();
            console.log(state);
        } else {
            io.to(socket.id).emit("mbac_update", currentState);
        }
    });
});