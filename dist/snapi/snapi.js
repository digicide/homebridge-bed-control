"use strict";
/* eslint-disable no-console */
/*
 * To use, launch node in the same directory as this file, then create an
 * object with
 *| > snapi = require('./snapi.js')
 *| > api = new snapi('username','password')
 *
 * Each method includes a network request function and a convenience function
 * for extracting the relevant data. The network request functions include a
 * retry wrapper that will handle authenication when necessary.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_cookiejar_support_1 = require("axios-cookiejar-support");
const tough_cookie_1 = require("tough-cookie");
require("./string.extensions");
const constants_1 = require("./constants");
const jar = new tough_cookie_1.CookieJar();
const client = (0, axios_cookiejar_support_1.wrapper)(axios_1.default.create({ jar }));
class snapi {
    constructor(username, password, log) {
        this.username = username;
        this.password = password;
        this.log = log;
        this.userId = '';
        this.bedID = [];
        this.key = '';
        this.apiDisabled = false;
        // used in batchRequests
        this._login = undefined;
        if (log === undefined) {
            this.log = console;
        }
    }
    print_errors(e, caller) {
        var _a, _b;
        if (axios_1.default.isAxiosError(e)) {
            this.log.debug(`[snapi][${caller}][API Error]`, (_a = e.response) === null || _a === void 0 ? void 0 : _a.status, (_b = e.response) === null || _b === void 0 ? void 0 : _b.statusText);
        }
    }
    async retry(func, count = 0) {
        var _a, _b;
        if (this.apiDisabled || count === 2) {
            this.log.debug('[snapi][retry] Reattempt limit reached.');
            return undefined;
        }
        else {
            try {
                return await func();
            }
            catch (_e) {
                const e = _e;
                this.print_errors(e, 'retry');
                if (axios_1.default.isAxiosError(e)) {
                    if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.statusText) === 'Unauthorized') {
                        if (count === 0) {
                            this.log.debug('[snapi][retry] Login expired. Attempting re-authentication.');
                            await this.batchLogin();
                        }
                        this.log.debug('[snapi][retry] Reattempting failed request, attempt #:', count + 2);
                        return await this.retry(func, count + 1);
                    }
                    else if (((_b = e.response) === null || _b === void 0 ? void 0 : _b.statusText) === 'Not Found') {
                        this.log.debug('[snapi][retry] Function returned 404 from API.');
                        throw e;
                    }
                }
                else {
                    this.print_errors(e, 'retry');
                    this.log.error('[snapi][retry] Disabling API. No further requests will be attempted');
                    this.apiDisabled = true;
                }
            }
        }
    }
    async login(username = this.username, password = this.password) {
        try {
            const res = await client.put(constants_1.loginURL, {
                login: username,
                password: password,
            });
            const { data } = res;
            this.userId = data.userId;
            this.key = data.key;
            this.log.debug('[snapi][login]', JSON.stringify(data, null, 2));
            return data;
        }
        catch (_e) {
            const e = _e;
            this.print_errors(e, 'login');
            this.log.error('[snapi] Disabling API. No further requests will be attempted');
            this.apiDisabled = true;
        }
    }
    batchLogin() {
        return this.batchRequests('_login', () => this.login(this.username, this.password));
    }
    getRegistration() {
        return this.retry(() => {
            return client.get(constants_1.registrationURL, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async registration() {
        const res = await this.getRegistration();
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][registration]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getFamilyStatus() {
        return this.retry(() => {
            return client.get(constants_1.familyStatusURL, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async familyStatus() {
        const res = await this.getFamilyStatus();
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][familyStatus', JSON.stringify(data, null, 2));
            return data.beds;
        }
    }
    getSleeper() {
        return this.retry(() => {
            return client.get(constants_1.sleeperURL, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async sleeper() {
        const res = await this.getSleeper();
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][sleeper]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getBed() {
        return this.retry(() => {
            return client.get(constants_1.bedURL, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async bed() {
        const res = await this.getBed();
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][bed]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getBedStatus(bedId) {
        return this.retry(() => {
            return client.get(constants_1.bedStatusURL.format(bedId), {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async bedStatus(bedId) {
        const res = await this.getBedStatus(bedId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][bedStatus]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getBedPauseMode(bedId) {
        return this.retry(() => {
            return client.get(constants_1.bedPauseModeURL.format(bedId), {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async bedPauseMode(bedId) {
        const res = await this.getBedPauseMode(bedId);
        if (res !== undefined) {
            const { data } = res;
            const pauseMode = data.pauseMode;
            this.log.debug('[snapi][bedPauseMode]', JSON.stringify(data, null, 2));
            return pauseMode;
        }
    }
    putBedPauseMode(bedId, mode) {
        return this.retry(() => {
            return client.put(constants_1.bedPauseModeURL.format(bedId), null, {
                params: {
                    _k: this.key,
                    mode: mode,
                },
            });
        });
    }
    async setBedPauseMode(bedId, mode) {
        const res = await this.putBedPauseMode(bedId, mode);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][setBedPauseMode]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putSleepNumber(bedId, side, num) {
        return this.retry(() => {
            return client.put(constants_1.sleepNumberURL.format(bedId), {
                side: side,
                sleepNumber: num,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async sleepNumber(bedId, side, num) {
        num = Math.round(num);
        if (num < 5) {
            num = 5;
        }
        if (num > 100) {
            num = 100;
        }
        num = (num - (num % 5));
        const res = await this.putSleepNumber(bedId, side, num);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][sleepNumber]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getResponsiveAirStatus(bedId) {
        return this.retry(() => {
            return client.get(constants_1.responsiveAirURL.format(bedId), {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async responsiveAirStatus(bedId) {
        const res = await this.getResponsiveAirStatus(bedId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][responsiveAirStatus]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putResponsiveAir(bedId, left, right) {
        return this.retry(() => {
            return client.put(constants_1.responsiveAirURL.format(bedId), {
                leftSideEnabled: left,
                rightSideEnabled: right,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async responsiveAir(bedId, left, right) {
        const res = await this.putResponsiveAir(bedId, left, right);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][responsiveAir]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putForceIdle(bedId) {
        return this.retry(() => {
            return client.put(constants_1.forceIdleURL.format(bedId), null, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    // Forces the pump to stop if it is in the middle of an action
    async forceIdle(bedId) {
        const res = await this.putForceIdle(bedId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][forceIdle]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getPumpStatus(bedId) {
        return this.retry(() => {
            return client.get(constants_1.pumpStatusURL.format(bedId), {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async pumpStatus(bedId) {
        const res = await this.getPumpStatus(bedId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][pumpStatus]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putPreset(bedId, side, preset) {
        return this.retry(() => {
            return client.put(constants_1.presetURL.format(bedId), {
                speed: 0,
                side: side,
                preset: preset,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async preset(bedId, side, preset) {
        const res = await this.putPreset(bedId, side, preset);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][preset]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putAdjust(bedId, side, position, actuator) {
        return this.retry(() => {
            return client.put(constants_1.adjustURL.format(bedId), {
                speed: 0,
                side: side,
                position: position,
                actuator: actuator,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async adjust(bedId, side, position, actuator) {
        position = Math.round(position);
        if (position < 0) {
            position = 0;
        }
        if (position > 100) {
            position = 100;
        }
        const res = await this.putAdjust(bedId, side, position, actuator);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][adjust]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getFoundationStatus(bedId) {
        return this.retry(() => {
            return client.get(constants_1.foundationStatusURL.format(bedId), {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async foundationStatus(bedId) {
        const res = await this.getFoundationStatus(bedId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][foundationStatus]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getOutletStatus(bedId, outletId) {
        return this.retry(() => {
            return client.get(constants_1.outletStatusURL.format(bedId), {
                params: {
                    _k: this.key,
                    outletId: outletId,
                },
            });
        });
    }
    async outletStatus(bedId, outletId) {
        const res = await this.getOutletStatus(bedId, outletId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][outletStatus]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putOutlet(bedId, outletId, setting) {
        return this.retry(() => {
            return client.put(constants_1.outletStatusURL.format(bedId), null, {
                params: {
                    _k: this.key,
                    outletId: outletId,
                    setting: setting,
                },
            });
        });
    }
    async outlet(bedId, outletId, setting) {
        const res = await this.putOutlet(bedId, outletId, setting);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][outlet]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putMotion(bedId, side, head, massage, foot) {
        return this.retry(() => {
            return client.put(constants_1.motionURL.format(bedId), {
                side: side,
                headMotion: head,
                massageMotion: massage,
                footMotion: foot,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async motion(bedId, side, head, massage, foot) {
        const res = await this.putMotion(bedId, side, head, massage, foot);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][motion]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getUnderbedLightStatus(bedId) {
        return this.retry(() => {
            return client.get(constants_1.underbedLightURL.format(bedId), {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async underbedLightStatus(bedId) {
        const res = await this.getUnderbedLightStatus(bedId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][underbedLightStatus]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putUnderbedLight(bedId, enableAuto) {
        return this.retry(() => {
            return client.put(constants_1.underbedLightURL.format(bedId), {
                enableAuto: enableAuto,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async underbedLight(bedId, enableAuto) {
        const res = await this.putUnderbedLight(bedId, enableAuto);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][underbedLight]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getFootwarmingStatus(bedId) {
        return this.retry(() => {
            return client.get(constants_1.footwarmingURL.format(bedId), {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async footwarmingStatus(bedId) {
        const res = await this.getFootwarmingStatus(bedId);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][footwarmingStatus]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putFootwarming(bedId, left, right, timerLeft, timerRight) {
        return this.retry(() => {
            return client.put(constants_1.footwarmingURL.format(bedId), {
                footWarmingTempLeft: left,
                footWarmingTempRight: right,
                footWarmingTimerLeft: timerLeft,
                footWarmingTimerRight: timerRight,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async footwarming(bedId, left, right, timerLeft, timerRight) {
        const res = await this.putFootwarming(bedId, left, right, timerLeft, timerRight);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][footWarming]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    putAdjustment(bedId, side, head, waveMode, foot, timer = 15) {
        return this.retry(() => {
            return client.put(constants_1.adjustmentURL.format(bedId), {
                side: side,
                headMassageMotor: head,
                massageWaveMode: waveMode,
                footMassageMotor: foot,
                massageTimer: timer,
            }, {
                params: {
                    _k: this.key,
                },
            });
        });
    }
    async adjustment(bedId, side, head, waveMode, foot, timer = 15) {
        const res = await this.putAdjustment(bedId, side, head, waveMode, foot, timer);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][adjustment]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getSleepData(data_date, interval, sleeper = this.userId) {
        return this.retry(() => {
            return client.get(constants_1.sleepDataURL, {
                params: {
                    _k: this.key,
                    date: data_date,
                    interval: interval,
                    sleeper: sleeper,
                },
            });
        });
    }
    async sleepData(data_date, interval, sleeper = this.userId) {
        // data_date format: 'YYYY-MM-DD'
        // interval format: 'D1' (1 day), 'M1' (1 month), etc.
        const res = await this.getSleepData(data_date, interval, sleeper);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][sleepData]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    getSleepSliceData(data_date, sleeper = this.userId, format) {
        return this.retry(() => {
            return client.get(constants_1.sleepSliceDataURL, {
                params: {
                    _k: this.key,
                    date: data_date,
                    sleeper: sleeper,
                    format: format,
                },
            });
        });
    }
    async sleepSliceData(data_date, sleeper = this.userId, format) {
        // data_date format: 'YYYY-MM-DD'
        // can optionally add a format:'csv' argument to get back a csv version of the data
        const res = await this.getSleepSliceData(data_date, sleeper, format);
        if (res !== undefined) {
            const { data } = res;
            this.log.debug('[snapi][sleepSliceData]', JSON.stringify(data, null, 2));
            return data;
        }
    }
    batchRequests(_p, func) {
        if (this[_p] !== undefined) {
            return this[_p];
        }
        this[_p] = func();
        this[_p].then(() => {
            this[_p] = undefined;
        }, () => {
            this[_p] = undefined;
        });
        return this[_p];
    }
}
exports.default = snapi;
//# sourceMappingURL=snapi.js.map