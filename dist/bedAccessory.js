"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedAccessory = void 0;
const definitions_1 = require("homebridge/node_modules/hap-nodejs/dist/lib/definitions");
const interfaces_1 = require("./snapi/interfaces");
class BedAccessory {
    constructor(platform, accessory, snapi) {
        this.platform = platform;
        this.accessory = accessory;
        this.snapi = snapi;
        // used in batchRequests
        this.batched_requests = {};
        this.setSleepNumber = {};
        this.adjustActuator = {
            [interfaces_1.BedSideKey_e.LeftSide]: {},
            [interfaces_1.BedSideKey_e.RightSide]: {},
        };
        this.services = {};
        this.bedId = accessory.context.bedStats.bedId;
        this.bedName = accessory.context.bedStats.name;
        this.setSleepNumber[interfaces_1.BedSideKey_e.LeftSide] = this.debounce(this.snapi.sleepNumber, this.accessory.context.sendDelay);
        this.setSleepNumber[interfaces_1.BedSideKey_e.RightSide] = this.debounce(this.snapi.sleepNumber, this.accessory.context.sendDelay);
        this.adjustActuator[interfaces_1.BedSideKey_e.LeftSide][interfaces_1.Actuator_e.Head] = this.debounce(this.snapi.adjust, this.accessory.context.sendDelay);
        this.adjustActuator[interfaces_1.BedSideKey_e.LeftSide][interfaces_1.Actuator_e.Foot] = this.debounce(this.snapi.adjust, this.accessory.context.sendDelay);
        this.adjustActuator[interfaces_1.BedSideKey_e.RightSide][interfaces_1.Actuator_e.Head] = this.debounce(this.snapi.adjust, this.accessory.context.sendDelay);
        this.adjustActuator[interfaces_1.BedSideKey_e.RightSide][interfaces_1.Actuator_e.Foot] = this.debounce(this.snapi.adjust, this.accessory.context.sendDelay);
        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, this.accessory.context.bedFeatures.Manufacturer)
            .setCharacteristic(this.platform.Characteristic.Model, this.accessory.context.bedFeatures.Model)
            .setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context.bedFeatures.SerialNumber);
        // Set up each bed side
        [interfaces_1.BedSideKey_e.LeftSide, interfaces_1.BedSideKey_e.RightSide].forEach((side) => {
            this.services[side] = {};
            // Set up number control
            if (this.accessory.context.bedFeatures[side].numberControl) {
                this.services[side].numberControl = this.accessory.getService(`${side} Number Control`) ||
                    this.accessory.addService(this.platform.Service.Lightbulb, `${side} Number Control`, this.bedId + `${side}NumberControl`);
                this.services[side].numberControl.getCharacteristic(this.platform.Characteristic.On)
                    .onSet(async () => null)
                    .onGet(async () => true);
                this.services[side].numberControl.getCharacteristic(this.platform.Characteristic.Brightness)
                    .onSet((async (value) => this.setNumber(side, value)).bind(this))
                    .onGet((async () => this.getNumber(side)).bind(this))
                    .setProps({ minStep: 5, minValue: 0, maxValue: 100 });
            }
            // Set up occupancy sensor
            if (this.accessory.context.bedFeatures[side].occupancySensor) {
                this.services[side].occupancySensor = this.accessory.getService(`${side} Occupancy Sensor`) ||
                    this.accessory.addService(this.platform.Service.OccupancySensor, `${side} Occupancy Sensor`, this.bedId + `${side}OccupancySensor`);
                this.services[side].occupancySensor.getCharacteristic(this.platform.Characteristic.OccupancyDetected)
                    .onGet((async () => this.getOccupancy(side)).bind(this));
            }
            // Set up foundation
            if (this.accessory.context.bedFeatures.foundation) {
                // Set up head and foot control
                [interfaces_1.Actuator_e.Head, interfaces_1.Actuator_e.Foot].forEach((actuator) => {
                    const actuatorName = actuator === interfaces_1.Actuator_e.Head ? 'headControl' : 'footControl';
                    const actuatorNameCaps = actuator === interfaces_1.Actuator_e.Head ? 'HeadControl' : 'FootControl';
                    if (this.accessory.context.bedFeatures[side][actuatorName]) {
                        this.services[side][actuatorName] = this.accessory.getService(`${side} ${actuatorName}`) ||
                            this.accessory.addService(this.platform.Service.Lightbulb, `${side} ${actuatorName}`, this.bedId + side + actuatorNameCaps);
                        this.services[side][actuatorName].getCharacteristic(this.platform.Characteristic.On)
                            .onSet(async () => null)
                            .onGet(async () => true);
                        this.services[side][actuatorName].getCharacteristic(this.platform.Characteristic.Brightness)
                            .onSet((async (value) => this.setActuatorPosition(side, actuator, value)).bind(this))
                            .onGet((async () => this.getActuatorPosition(side, actuator)).bind(this));
                    }
                });
                // Set up outlets and lights
                const outlets = (side === interfaces_1.BedSideKey_e.LeftSide) ? {
                    outlet: interfaces_1.Outlets_e.LeftPlug,
                    light: interfaces_1.Outlets_e.LeftLight,
                } : {
                    outlet: interfaces_1.Outlets_e.RightPlug,
                    light: interfaces_1.Outlets_e.RightLight,
                };
                const outletNames = {
                    outlet: 'Outlet',
                    light: 'Light',
                };
                Object.entries(outlets).forEach(([outletKey, outlet]) => {
                    if (this.accessory.context.bedFeatures[side][outletKey]) {
                        // If foundation includes selected outlet
                        this.services[side][outletKey] =
                            this.accessory.getService(`${side} ${outletNames[outletKey]} Control`) ||
                                this.accessory.addService(this.platform.Service.Outlet, `${side} ${outletNames[outletKey]} Control`, this.bedId + `${side}${outletNames[outletKey]}Control`);
                        this.services[side][outletKey].getCharacteristic(this.platform.Characteristic.On)
                            .onSet((async (value) => this.setOutlet(outlet, value)).bind(this))
                            .onGet((async () => this.getOutlet(outlet)).bind(this));
                    }
                });
                // Set up foot warming
                if (this.accessory.context.bedFeatures[side].footwarming) {
                    this.services[side].footwarmingControl = this.accessory.getService(`${side} Foot Warming`) ||
                        this.accessory.addService(this.platform.Service.Thermostat, `${side} Foot Warming`, this.bedId + `${side}FootwarmingControl`);
                    this.services[side].footwarmingControl.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
                        .onGet((async () => this.getFootwarmingValue(side)).bind(this));
                    this.services[side].footwarmingControl.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
                        .onSet((async (value) => this.setFootwarmingValue(side, value)).bind(this))
                        .onGet((async () => this.getFootwarmingValue(side)).bind(this));
                    this.services[side].footwarmingControl.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
                        .onGet((async () => this.getFootwarmingTimeRemaining(side)).bind(this));
                    this.services[side].footwarmingControl.getCharacteristic(this.platform.Characteristic.TargetTemperature)
                        .onSet((async (value) => this.setFootwarmingTimeRemaining(side, value)).bind(this))
                        .onGet(async () => 37.8);
                    this.services[side].footwarmingControl.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
                        .onSet(async () => null)
                        .onGet(async () => definitions_1.TemperatureDisplayUnits.FAHRENHEIT);
                }
            }
            // Set up responsive air
            if (this.accessory.context.bedFeatures[side].responsiveAir) {
                this.services[side].responsiveAir = this.accessory.getService(`${side} Responsive Air`) ||
                    this.accessory.addService(this.platform.Service.Switch, `${side} Responsive Air`, this.bedId + `${side}ResponsiveAir`);
                this.services[side].responsiveAir.getCharacteristic(this.platform.Characteristic.On)
                    .onSet((async (value) => this.setResponsiveAir(side, value)).bind(this))
                    .onGet((async () => this.getResponsiveAir(side)).bind(this));
            }
        });
        // Set up privacy switch
        if (this.accessory.context.bedFeatures.privacy) {
            this.services.privacySwitch = this.accessory.getService('Privacy Switch') ||
                this.accessory.addService(this.platform.Service.Switch, 'Privacy Switch', this.bedId + 'privacySwitch');
            this.services.privacySwitch.getCharacteristic(this.platform.Characteristic.On)
                .onSet(this.setPrivacy.bind(this))
                .onGet(this.getPrivacy.bind(this));
        }
        // Set up "any side" sensors
        this.services.anySide = {};
        // Set up occupancy sensor
        if (this.accessory.context.bedFeatures.anySide.occupancySensor) {
            this.services.anySide.occupancySensor = this.accessory.getService('anySide Occupancy Sensor') ||
                this.accessory.addService(this.platform.Service.OccupancySensor, 'anySide Occupancy Sensor', this.bedId + 'anySideOccupancySensor');
            this.services.anySide.occupancySensor.getCharacteristic(this.platform.Characteristic.OccupancyDetected)
                .onGet(this.getAnyOccupancy.bind(this));
        }
        // Set up outlets and lights
        const outlets = {
            outlet: 'Outlet',
            light: 'Light',
        };
        Object.entries(outlets).forEach(([outletKey, outlet]) => {
            if (this.accessory.context.bedFeatures.anySide[outletKey]) {
                // If foundation includes selected outlet
                this.services.anySide[outletKey] =
                    this.accessory.getService(`anySide ${outlet} Control`) ||
                        this.accessory.addService(this.platform.Service.Outlet, `anySide ${outlet} Control`, this.bedId + `anySide${outlet}Control`);
                this.services.anySide[outletKey].getCharacteristic(this.platform.Characteristic.On)
                    .onSet((async (value) => this.setAnyOutlet(outletKey, value)).bind(this))
                    .onGet((async () => this.getAnyOutlet(outletKey)).bind(this));
            }
        });
    }
    async setPrivacy(value) {
        this.platform.log.debug(`[${this.bedName}] Set Privacy Mode -> ${value}`);
        this.snapi.setBedPauseMode(this.bedId, value ? interfaces_1.PauseMode_e.On : interfaces_1.PauseMode_e.Off);
        this.platform.privacyModeEnabled[this.bedId] = value;
    }
    async getPrivacy() {
        const pauseMode = await this.snapi.bedPauseMode(this.bedId);
        if (pauseMode !== undefined) {
            const isOn = (pauseMode === interfaces_1.PauseMode_e.On);
            this.platform.privacyModeEnabled[this.bedId] = isOn;
            this.platform.log.debug(`[${this.bedName}] Get Privacy Mode -> ${isOn}`);
            return isOn;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async setNumber(side, value) {
        this.platform.log.debug(`[${this.bedName}][${side}] Set Number -> ${value}`);
        this.setSleepNumber[side](this.bedId, interfaces_1.BedSide_e[side], value);
    }
    async getNumber(side) {
        const data = await this.getPumpStatus();
        if (data !== undefined) {
            const number = side === interfaces_1.BedSideKey_e.LeftSide ? data.leftSideSleepNumber : data.rightSideSleepNumber;
            this.platform.log.debug(`[${this.bedName}][${side}] Get Number -> ${number}`);
            return number;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async getOccupancy(side) {
        if (!this.platform.privacyModeEnabled[this.bedId]) {
            const data = await this.getBedStatus();
            if (data !== undefined) {
                const isInBed = data[side].isInBed ? 1 : 0;
                this.platform.log.debug(`[${this.bedName}][${side}] Get Occupancy -> ${isInBed}`);
                return isInBed;
            }
            else {
                throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
            }
        }
        else {
            this.platform.log.debug(`[${this.bedName}][getOccupancy] Privacy mode enabled, skipping occupancy check`);
            throw -70412 /* NOT_ALLOWED_IN_CURRENT_STATE */;
        }
    }
    async getAnyOccupancy() {
        if (!this.platform.privacyModeEnabled[this.bedId]) {
            const data = await this.getBedStatus();
            if (data !== undefined) {
                const isInBed = (data.leftSide.isInBed || data.rightSide.isInBed) ? 1 : 0;
                this.platform.log.debug(`[${this.bedName}][anySide] Get Occupancy -> ${isInBed}`);
                return isInBed;
            }
            else {
                throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
            }
        }
        else {
            this.platform.log.debug(`[${this.bedName}][getOccupancy] Privacy mode enabled, skipping occupancy check`);
            throw -70412 /* NOT_ALLOWED_IN_CURRENT_STATE */;
        }
    }
    async setResponsiveAir(side, value) {
        this.platform.log.debug(`[${this.bedName}][${side}] Set Responsive Air -> ${value}`);
        this.snapi.responsiveAir(this.bedId, side === interfaces_1.BedSideKey_e.LeftSide ? value : undefined, side === interfaces_1.BedSideKey_e.RightSide ? value : undefined);
    }
    async getResponsiveAir(side) {
        const data = await this.getResponsiveAirStatus();
        if (data !== undefined) {
            const responsiveAirStatus = (side === interfaces_1.BedSideKey_e.LeftSide) ? data.leftSideEnabled : data.rightSideEnabled;
            this.platform.log.debug(`[${this.bedName}][${side}] Get Responsive Air -> ${responsiveAirStatus}`);
            return responsiveAirStatus;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async setActuatorPosition(side, actuator, value) {
        this.platform.log.debug(`[${this.bedName}][${side}][${actuator}] Set Position -> ${value}`);
        this.adjustActuator[side][actuator](this.bedId, interfaces_1.BedSide_e[side], value, actuator);
    }
    async getActuatorPosition(side, actuator) {
        const data = await this.getFoundationStatus();
        if (data !== undefined) {
            let actuatorPosition;
            switch (`${side}${actuator}`) {
                case `${interfaces_1.BedSideKey_e.LeftSide}${interfaces_1.Actuator_e.Head}`:
                    actuatorPosition = parseInt(data.fsLeftHeadPosition, 16);
                    break;
                case `${interfaces_1.BedSideKey_e.RightSide}${interfaces_1.Actuator_e.Head}`:
                    actuatorPosition = parseInt(data.fsRightHeadPosition, 16);
                    break;
                case `${interfaces_1.BedSideKey_e.LeftSide}${interfaces_1.Actuator_e.Foot}`:
                    actuatorPosition = parseInt(data.fsLeftFootPosition, 16);
                    break;
                case `${interfaces_1.BedSideKey_e.RightSide}${interfaces_1.Actuator_e.Foot}`:
                    actuatorPosition = parseInt(data.fsRightFootPosition, 16);
                    break;
            }
            this.platform.log.debug(`[${this.bedName}][${side}][${actuator}] Get Position -> ${actuatorPosition}`);
            return actuatorPosition;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async setOutlet(outlet, value) {
        this.platform.log.debug(`[${this.bedName}][${interfaces_1.Outlets_e[outlet]}] Set Outlet State -> ${value}`);
        this.snapi.outlet(this.bedId, outlet, value ? interfaces_1.Outlet_Setting_e.On : interfaces_1.Outlet_Setting_e.Off);
    }
    async getOutlet(outlet) {
        const data = await this.snapi.outletStatus(this.bedId, outlet);
        if (data !== undefined) {
            const outletStatus = data.setting;
            this.platform.log.debug(`[${this.bedName}][${interfaces_1.Outlets_e[outlet]}] Get Outlet State -> ${outletStatus}`);
            return outletStatus;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async setAnyOutlet(outletKey, value) {
        const outlets = {
            leftSide: {
                outlet: interfaces_1.Outlets_e.LeftPlug,
                light: interfaces_1.Outlets_e.LeftLight,
            },
            rightSide: {
                outlet: interfaces_1.Outlets_e.RightPlug,
                light: interfaces_1.Outlets_e.RightLight,
            },
        };
        this.platform.log.debug(`[${this.bedName}][anySide] Set Outlet State -> ${value}`);
        [interfaces_1.BedSideKey_e.LeftSide, interfaces_1.BedSideKey_e.RightSide].forEach(side => {
            if (this.accessory.context.bedFeatures[side][outletKey]) {
                this.snapi.outlet(this.bedId, outlets[side][outletKey], value ? interfaces_1.Outlet_Setting_e.On : interfaces_1.Outlet_Setting_e.Off);
            }
        });
    }
    async getAnyOutlet(outletKey) {
        const outlets = {
            leftSide: {
                outlet: interfaces_1.Outlets_e.LeftPlug,
                light: interfaces_1.Outlets_e.LeftLight,
            },
            rightSide: {
                outlet: interfaces_1.Outlets_e.RightPlug,
                light: interfaces_1.Outlets_e.RightLight,
            },
        };
        let outletStatus;
        if (this.accessory.context.bedFeatures.leftSide[outletKey]) {
            const data = await this.snapi.outletStatus(this.bedId, outlets.leftSide[outletKey]);
            if (data !== undefined) {
                outletStatus = data.setting;
            }
        }
        if (this.accessory.context.bedFeatures.rightSide[outletKey]) {
            const data = await this.snapi.outletStatus(this.bedId, outlets.rightSide[outletKey]);
            if (data !== undefined) {
                if (outletStatus !== undefined) {
                    outletStatus = outletStatus | data.setting;
                }
                else {
                    outletStatus = data.setting;
                }
            }
        }
        if (outletStatus !== undefined) {
            this.platform.log.debug(`[${this.bedName}][anySide] Get Outlet State -> ${outletStatus}`);
            return outletStatus;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async getFootwarmingTimeRemaining(side) {
        const data = await this.getFootwarmingStatus();
        if (data !== undefined) {
            const footwarmingTimeRemaining = side === interfaces_1.BedSideKey_e.LeftSide ? data.footWarmingTimerLeft : data.footWarmingTimerRight;
            this.platform.log.debug(`[${this.bedName}][${side}] Get Footwarming Timer Remaining -> ${footwarmingTimeRemaining}`);
            return +(((footwarmingTimeRemaining - 32) * 5 / 9).toPrecision(1));
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async setFootwarmingTimeRemaining(side, value) {
        const data = await this.getFootwarmingStatus();
        if (data !== undefined) {
            const temp = side === interfaces_1.BedSideKey_e.LeftSide ? data.footWarmingStatusLeft : data.footWarmingStatusRight;
            value = +(((value * 9 / 5) + 32).toFixed(0));
            this.platform.log.debug(`[${this.bedName}][${side}] Set Footwarming Timer -> ${value} minutes`);
            if (side === interfaces_1.BedSideKey_e.LeftSide) {
                this.snapi.footwarming(this.bedId, temp, undefined, value, undefined);
            }
            else {
                this.snapi.footwarming(this.bedId, undefined, temp, undefined, value);
            }
        }
    }
    async setFootwarmingValue(side, value) {
        let temp = interfaces_1.Footwarming_e.Off;
        switch (value) {
            case 1:
                temp = interfaces_1.Footwarming_e.High;
                break;
            case 2:
                temp = interfaces_1.Footwarming_e.Med;
                break;
            case 3:
                temp = interfaces_1.Footwarming_e.Low;
                break;
            default:
                temp = interfaces_1.Footwarming_e.Off;
                break;
        }
        return this.setFootwarming(side, temp);
    }
    async getFootwarmingValue(side) {
        const footwarmingStatus = await this.getFootwarming(side);
        if (footwarmingStatus !== undefined && footwarmingStatus !== null) {
            let value = 0;
            switch (footwarmingStatus) {
                case interfaces_1.Footwarming_e.Low:
                    value = 2;
                    break;
                case interfaces_1.Footwarming_e.Med:
                    value = 2;
                    break;
                case interfaces_1.Footwarming_e.High:
                    value = 1;
                    break;
                default:
                    value = 0;
                    break;
            }
            return value;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    async setFootwarming(side, value) {
        this.platform.log.debug(`[${this.bedName}][${side}] Set Footwarming -> ${interfaces_1.Footwarming_e[value]}`);
        if (side === interfaces_1.BedSideKey_e.LeftSide) {
            this.snapi.footwarming(this.bedId, value, undefined, 100, undefined);
        }
        else {
            this.snapi.footwarming(this.bedId, undefined, value, undefined, 100);
        }
    }
    async getFootwarming(side) {
        const data = await this.getFootwarmingStatus();
        if (data !== undefined) {
            const footwarmingStatus = side === interfaces_1.BedSideKey_e.LeftSide ? data.footWarmingStatusLeft : data.footWarmingStatusRight;
            this.platform.log.debug(`[${this.bedName}][${side}] Get Footwarming State -> ${interfaces_1.Footwarming_e[footwarmingStatus]}`);
            return footwarmingStatus;
        }
        else {
            throw -70402 /* SERVICE_COMMUNICATION_FAILURE */;
        }
    }
    getBedStatus() {
        return this.batchRequests('_bed', () => this.snapi.bedStatus(this.bedId));
    }
    getPumpStatus() {
        return this.batchRequests('_pump', () => this.snapi.pumpStatus(this.bedId));
    }
    getResponsiveAirStatus() {
        return this.batchRequests('_responsiveAir', () => this.snapi.responsiveAirStatus(this.bedId));
    }
    getFoundationStatus() {
        return this.batchRequests('_foundation', () => this.snapi.foundationStatus(this.bedId));
    }
    getFootwarmingStatus() {
        return this.batchRequests('_footwarming', () => this.snapi.footwarmingStatus(this.bedId));
    }
    batchRequests(_p, func) {
        if (this.batched_requests[_p] !== undefined) {
            return this.batched_requests[_p];
        }
        this.batched_requests[_p] = func();
        this.batched_requests[_p].then(() => {
            this.batched_requests[_p] = undefined;
        }, () => {
            this.batched_requests[_p] = undefined;
        });
        return this.batched_requests[_p];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounce(func, timeout = 300) {
        let timer;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this.snapi, args);
            }, timeout);
        };
    }
}
exports.BedAccessory = BedAccessory;
//# sourceMappingURL=bedAccessory.js.map