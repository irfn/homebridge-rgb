var color = require("rgb")

var Service, Characteristic;
const execSync = require('child_process').execSync;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-rgb", "RgbRfSwitchAccessory", RgbRfSwitchAccessory);
};

function powerOn(deviceId, codeSendBinary, callback) {
    var deviseOff = (deviceId * 10);
    var deviseOn = deviseOff + 1;
    execSync('sudo '+ codeSendBinary + ' ' + deviseOn);
    callback();
}

function powerOff(deviceId, codeSendBinary, callback) {
    var deviseOff = (deviceId * 10);
    execSync('sudo '+ codeSendBinary + ' ' + deviseOff);
    callback();
}

function encode433(deviceId, color){
    var deviseOff =  (deviceId * 10);

    var deviseOn =  deviseOff + 1;

    var redStateLow = deviseOn * 1000;
    var redStateHigh = redStateLow + 255;
    var greenStateLow = redStateHigh + 1;
    var greenStateHigh = greenStateLow + 255;
    var blueStateLow = greenStateHigh + 1;


    var redState = redStateLow + color.red;
    var greenState = greenStateLow + color.green;
    var blueState = blueStateLow + color.blue;


    return {r: redState, g: greenState, b: blueState};
}

function send(encodedData, codeSendBinary, callback){
    console.log('sudo '+ codeSendBinary + ' ' + encodedData.r);
    execSync('sudo '+ codeSendBinary + ' ' + encodedData.r);
    execSync('sudo '+ codeSendBinary + ' ' + encodedData.g);
    execSync('sudo '+ codeSendBinary + ' ' + encodedData.b);
    callback();
}

function hslToRgb(hsl) {
    //its magic. fix this!!
    var split = color("hsl(" + hsl.h + ", " + hsl.s + ", " + hsl.l + ")").split("(")[1].split(")")[0].split(",");
    return {red: parseInt(split[0]), green: parseInt(split[1]), blue: parseInt(split[2])};
}

function RgbRfSwitchAccessory(log, config) {
    this.log = log;
    this.name = config.name;
    this.deviceId = config.RgbRfSwitchAccessory.deviceId;
    this.codeSendBinary = config.RgbRfSwitchAccessory.codeSendBinary;
    this.hsl = {h: 0, s: 0, l: 100};
}


RgbRfSwitchAccessory.prototype = {
    setPowerState: function (state, callback) {
        console.log("setPowerState to ", state);

        var deviceId = this.deviceId;
        var codeSendBinary = this.codeSendBinary;
        if(state == "1") {
            powerOn(deviceId, codeSendBinary, callback);
        } else {
            send(encode433(deviceId, {red: 0, green: 0, blue: 0}, function() {
                powerOff(deviceId, codeSendBinary, callback);
            }));
        }
    },
    setHue: function (level, callback) {
        console.log("setHue");

        this.log("Setting Hue to %s", level);

        this.hsl.h = Math.round(level);

        send(encode433(this.deviceId, hslToRgb(this.hsl)), callback);
    },
    setSaturation: function (level, callback) {
        console.log("setSaturation");
        this.hsl.s = Math.round(level);

        this.log("Setting saturation to %s", level);

        send(encode433(this.deviceId, hslToRgb(this.hsl)), callback);
    },
    setBrightness: function (level, callback) {
        console.log("setBrightness");

        this.hsl.l = Math.round(level);
        send(encode433(this.deviceId, hslToRgb(this.hsl)), callback);
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback();
    },

    getServices: function () {
        var informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, "RGB Led Strip with RF")
            .setCharacteristic(Characteristic.Model, "RGB Led")
            .setCharacteristic(Characteristic.SerialNumber, "GSU3493H");

            var lightbulbService = new Service.Lightbulb(this.name);

            lightbulbService
                .addCharacteristic(Characteristic.Hue)
                .on('set', this.setHue.bind(this));

            lightbulbService
                .getCharacteristic(Characteristic.On)
                .on('set', this.setPowerState.bind(this));

            lightbulbService
                .addCharacteristic(Characteristic.Saturation)
                .on('set', this.setSaturation.bind(this));

            lightbulbService
                .addCharacteristic(new Characteristic.Brightness())
                .on('set', this.setBrightness.bind(this));

            return [informationService, lightbulbService];
    }
};
