var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-rgb", "RgbRfSwitchAccessory", RgbRfSwitchAccessory);
};

function RgbRfSwitchAccessory(log, config) {
    this.log = log;

    this.service = config["service"];
    this.name = config["name"];
}

RgbRfSwitchAccessory.prototype = {
    setPowerState: function (state, callback) {
        console.log("setPowerState to ", state);
        callback();
    },
    setHue: function (level, callback) {
        console.log("setHue");

        this.log("Setting Hue to %s", level);

        callback();
    },
    setSaturation: function (level, callback) {
        console.log("setSaturation");

        this.log("Setting saturation to %s", level);

        callback();
    },
    setBrightness: function (level, callback) {
        console.log("setBrightness");
        callback();
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

        if (this.service == "Light") {
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
    }
};
