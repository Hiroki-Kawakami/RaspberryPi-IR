var currentState;
var　socket = io.connect();
socket.on("mbac_update", function(state) {
    console.log(state);
    var allColorClass = ["cool", "dry", "heat", "wind", "stop", "gray", "white"]
    var buttons = {
        cool: document.getElementById("coolButton"),
        dry: document.getElementById("dryButton"),
        heat: document.getElementById("heatButton"),
        wind: document.getElementById("windButton"),
        stop: document.getElementById("stopButton"),
        left: document.getElementById("leftButton"),
        center: document.getElementById("centerButton"),
        right: document.getElementById("rightButton")
    }
    Array.from(document.getElementById("mbacButtons").children).forEach(function(element) {
        allColorClass.forEach(function(classItem) {
            element.classList.remove(classItem);
        })
    });
    if (!state.power) {
        buttons.cool.classList.add("cool");
        buttons.dry.classList.add("dry");
        buttons.heat.classList.add("heat");
        buttons.wind.classList.add("wind");
        buttons.stop.classList.add("white");
        buttons.left.classList.add("white");
        buttons.left.innerText = "";
        buttons.center.classList.add("white");
        buttons.center.innerText = "";
        buttons.right.classList.add("white");
        buttons.right.innerText = "";
    } else if (state.mode == "cool") {
        buttons.cool.classList.add("cool");
        buttons.dry.classList.add("gray");
        buttons.heat.classList.add("gray");
        buttons.wind.classList.add("gray");
        buttons.stop.classList.add("stop");
        buttons.left.classList.add("cool");
        buttons.left.innerText = "▼";
        buttons.center.classList.add("cool");
        buttons.center.innerText = state.coolTemperature + "℃";
        buttons.right.classList.add("cool");
        buttons.right.innerText = "▲";
    } else if (state.mode == "dry") {
        buttons.cool.classList.add("gray");
        buttons.dry.classList.add("dry");
        buttons.heat.classList.add("gray");
        buttons.wind.classList.add("gray");
        buttons.stop.classList.add("stop");
        if (state.dryIntensity == "low") {
            buttons.left.classList.add("dry");
            buttons.center.classList.add("gray");
            buttons.right.classList.add("gray");
        } else if (state.dryIntensity == "high") {
            buttons.left.classList.add("gray");
            buttons.center.classList.add("gray");
            buttons.right.classList.add("dry");
        } else {
            buttons.left.classList.add("gray");
            buttons.center.classList.add("dry");
            buttons.right.classList.add("gray");
        }
        buttons.left.innerText = "弱";
        buttons.center.innerText = "標準";
        buttons.right.innerText = "強";
    } else if (state.mode == "heat") {
        buttons.cool.classList.add("gray");
        buttons.dry.classList.add("gray");
        buttons.heat.classList.add("heat");
        buttons.wind.classList.add("gray");
        buttons.stop.classList.add("stop");
        buttons.left.classList.add("heat");
        buttons.left.innerText = "▼";
        buttons.center.classList.add("heat");
        buttons.center.innerText = state.heatTemperature + "℃";
        buttons.right.classList.add("heat");
        buttons.right.innerText = "▲";
    } else if (state.mode == "wind") {
        buttons.cool.classList.add("gray");
        buttons.dry.classList.add("gray");
        buttons.heat.classList.add("gray");
        buttons.wind.classList.add("wind");
        buttons.stop.classList.add("stop");
        buttons.left.classList.add("white");
        buttons.left.innerText = "";
        buttons.center.classList.add("white");
        buttons.center.innerText = "";
        buttons.right.classList.add("white");
        buttons.right.innerText = "";
    }
    currentState = state;
});
socket.on("connect", function() {});

function coolAction() {
    currentState.power = true;
    currentState.mode = "cool";
    socket.emit("mbac_update", currentState);
}

function dryAction() {
    currentState.power = true;
    currentState.mode = "dry";
    socket.emit("mbac_update", currentState);
}

function heatAction() {
    currentState.power = true;
    currentState.mode = "heat";
    socket.emit("mbac_update", currentState);
}

function windAction() {
    currentState.power = true;
    currentState.mode = "wind";
    socket.emit("mbac_update", currentState);
}

function stopAction() {
    currentState.power = false;
    socket.emit("mbac_update", currentState);
}

function leftAction() {
    if (!currentState.power) {
        return;
    } else if (currentState.mode == "cool") {
        currentState.coolTemperature = Math.max(currentState.coolTemperature - 1, 16);
        socket.emit("mbac_update", currentState);
    } else if (currentState.mode == "dry") {
        currentState.dryIntensity = "low";
        socket.emit("mbac_update", currentState);
    } else if (currentState.mode == "heat") {
        currentState.heatTemperature = Math.max(currentState.heatTemperature - 1, 16);
        socket.emit("mbac_update", currentState);
    }
}

function centerAction() {
    if (!currentState.power) {
        return;
    } else if (currentState.mode == "dry") {
        currentState.dryIntensity = "middle";
        socket.emit("mbac_update", currentState);
    }
}

function rightAction() {
    if (!currentState.power) {
        return;
    } else if (currentState.mode == "cool") {
        currentState.coolTemperature = Math.min(currentState.coolTemperature + 1, 31);
        socket.emit("mbac_update", currentState);
    } else if (currentState.mode == "dry") {
        currentState.dryIntensity = "high";
        socket.emit("mbac_update", currentState);
    } else if (currentState.mode == "heat") {
        currentState.heatTemperature = Math.min(currentState.heatTemperature + 1, 31);
        socket.emit("mbac_update", currentState);
    }
}