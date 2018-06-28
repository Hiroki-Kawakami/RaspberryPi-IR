var bytes = [0x23, 0xcb, 0x26, 0x01, 0x00, 0x00, 0x58, 12, 0x32, 0x40, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0];

var aeha = function(T, bytes, repeats, interval) {
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

var UpdateCheckByte = function() {
    var sum = 0;
    for (var i = 0; i < bytes.length - 1; i++) {
        sum += bytes[i];
    }
    bytes[bytes.length - 1] = sum & 0xff;
}

var SetPower = function(power) {
    if (power.toLowerCase !== undefined) {
        power = power.toLowerCase()
    }
    if (!power || power == "off" || power == "false") {
        bytes[5] = 0x00;
        savedState.power = false;
    } else {
        bytes[5] = 0x20;
        savedState.power = true;
    }
}

var SetMode = function(mode) { // モードをセット（cool: 冷房, heat: 暖房, dry: 除湿, wind: 送風）
    mode = mode.toLowerCase();
    var byte = {"cool": 0x58, "heat": 0x48, "dry": 0x50, "wind": 0x38}[mode];
    if (byte === undefined) {
        console.log("Mode %s is not defined!", mode);
        return false;
    }
    SetPower(true);
    bytes[6] = byte;
    savedState.mode = mode;
    if (mode == "cool") {
        SetTemperature(savedState.coolTemperature);
        bytes[8] = (bytes[8] & 0xf0) | 0x6;
    } else if (mode == "heat") {
        SetTemperature(savedState.heatTemperature);
    } else if (mode == "dry") {
        SetDryIntensity(savedState.dryIntensity);
    }
    return true;
}

var SetTemperature = function(temperature) { // 設定温度をセット（16~31）
    if (temperature < 16 || temperature > 31) {
        console.log("Temperature %d is out of range (16 ~ 31).", temperature);
        return false;
    }
    bytes[7] = temperature - 16;
    if (savedState.mode == "cool") {
        savedState.coolTemperature = temperature;
    } else if (savedState.mode == "heat") {
        savedState.heatTemperature = temperature;
    }
    return true;
}

var SetDryIntensity = function(intensity) { // 除湿強度（high: 強, normal: 標準, low: 弱）
    intensity = intensity.toLowerCase();
    var byte = {"high": 0x0, "normal": 0x2, "low": 0x4}[intensity];
    if (byte === undefined) {
        console.log("Dry intensity %s is not defined!", intensity);
        return false;
    }
    bytes[8] = (bytes[8] & 0xf0) | byte;
    savedState.dryIntensity = intensity;
    return true;
}

var SetWindHorizontal = function(horizontal) { // 風向左右（1: 最左 ~ 3: 中央 ~ 5: 最右, 6: 回転）
    if (horizontal <= 0 || horizontal > 6) {
        console.log("Horizontal wind direction %d is out of range (1 ~ 6).", horizontal);
        return false;
    }
    if (horizontal == 6) {
        horizontal = 0xc;
    }
    bytes[8] = (bytes[8] & 0xf) | (horizontal << 4);
    savedState.horizontal = horizontal;
    return true;
}

var SetWindVertical = function(vertical) { // 風向上下（0: 自動, 1: 最上 ~ 5: 最下, 6: 回転）
    if (vertical < 0 || vertical > 6) {
        console.log("Vertical wind direction %d is out of range (0 ~ 6).", vertical);
        return false;
    }
    if (vertical == 6) {
        vertical = 7;
    }
    bytes[9] = (bytes[8] & 0b11000111) | (vertical << 3);
    savedState.vertical = vertical;
    return true;
}

var SetWindSpeed = function(speed) { // 風速（0: 自動, 1: 弱, 2: 中, 3: 強, 4: パワフル）
    if (speed < 0 || speed > 4) {
        console.log("Wind speed %d is out of range (0 ~ 4).", speed);
        return false;
    }
    var powerful = 0x00;
    if (speed == 4) {
        speed = 3;
        powerful = 0x10;
    }
    bytes[9] = (bytes[9] & 0b11111000) | speed;
    bytes[15] = powerful;
    savedState.speed = speed;
    return true;
}

var SetWindArea = function(area) { // 風エリア（none: 風左右の値を利用, whole: 全体, left: 左半分, right: 右半分）
    var byte = {"none": 0x00, "whole": 0x8, "left": 0x40, "right": 0xc0}[area.toLowerCase()];
    if (byte === undefined) {
        console.log("Wind area %s is not defined!", area);
        return false;
    }
    bytes[13] = byte;
    savedState.area = area;
    return true;
}

var fs = require("fs");
var savedState = {
    "power": false, 
    "mode": "cool", 
    "coolTemperature": 28, 
    "heatTemperature": 20, 
    "dryIntensity": "normal", 
    "horizontal": 5, 
    "vertical": 0,
    "speed": 0,
    "area": "none"
};
try {
    savedState = JSON.parse(fs.readFileSync("mbac.sav", "utf8"));
} catch(error) {}

try {
    if (savedState.mode !== undefined) {
        SetMode(savedState.mode);
    }
    if (savedState.power !== undefined) {
        SetPower(savedState.power);
    }
    if (savedState.horizontal !== undefined) {
        SetWindHorizontal(savedState.horizontal);
    }
    if (savedState.vertical !== undefined) {
        SetWindVertical(savedState.vertical);
    }
    if (savedState.speed !== undefined) {
        SetWindSpeed(savedState.speed);
    }
    if (savedState.area !== undefined) {
        SetWindArea(savedState.area);
    }
} catch(error) {console.error(error)}

var SaveState = function() {
    fs.writeFile('mbac.sav', JSON.stringify(savedState));
}

if (require.main === module) {
    var i = 2;
    while (i < process.argv.length) {
        var key = process.argv[i];
        if (key == "-p" || key == "--power") {
            SetPower(process.argv[i + 1]);
            i += 2;
        } else if (key == "-m" || key == "--mode") {
            if (!SetMode(process.argv[i + 1])) {
                console.log("Invalid value of mode option \"%s\"", process.argv[i + 1]);
                return;
            }
            i += 2;
        } else if (key == "-t" || key == "--temperature") {
            if (!SetTemperature(process.argv[i + 1])) {
                console.log("Invalid value of temperature option \"%s\"", process.argv[i + 1]);
                return;
            }
            i += 2;
        } else if (key == "-d" || key == "--dry_intensity") {
            if (!SetDryIntensity(process.argv[i + 1])) {
                console.log("Invalid value of dry intensity option \"%s\"", process.argv[i + 1]);
                return;
            }
            i += 2;
        } else if (key == "-h" || key == "--horizontal") {
            if (!SetWindHorizontal(process.argv[i + 1])) {
                console.log("Invalid value of wind horizontal option \"%s\"", process.argv[i + 1]);
                return;
            }
            i += 2;
        } else if (key == "-v" || key == "--vertical") {
            if (!SetWindVertical(process.argv[i + 1])) {
                console.log("Invalid value of wind vertical option \"%s\"", process.argv[i + 1]);
                return;
            }
            i += 2;
        } else if (key == "-s" || key == "--speed") {
            if (!SetWindSpeed(process.argv[i + 1])) {
                console.log("Invalid value of wind speed option \"%s\"", process.argv[i + 1]);
                return;
            }
            i += 2;
        } else if (key == "-a" || key == "--area") {
            if (!SetWindArea(process.argv[i + 1])) {
                console.log("Invalid value of wind area option \"%s\"", process.argv[i + 1]);
                return;
            }
            i += 2;
        } else {
            console.log("Invalid option key \"%s\"", key);
            return;
        }
    }
    UpdateCheckByte();
    SaveState();
    var signal = aeha(430, bytes, 2, 13300);
    console.log(signal);
}