"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustURL = exports.adjustmentURL = exports.footwarmingURL = exports.statusURL = exports.systemURL = exports.pinchURL = exports.underbedLightURL = exports.motionURL = exports.outletStatusURL = exports.foundationStatusURL = exports.presetURL = exports.pumpStatusURL = exports.forceIdleURL = exports.responsiveAirURL = exports.sleepNumberURL = exports.bedPauseModeURL = exports.bedStatusURL = exports.familyStatusURL = exports.sleepSliceDataURL = exports.sleepDataURL = exports.bedURL = exports.sleeperURL = exports.registrationURL = exports.loginURL = void 0;
const rootURL = 'https://api.sleepiq.sleepnumber.com/rest/';
exports.loginURL = `${rootURL}login`;
exports.registrationURL = `${rootURL}registration`;
exports.sleeperURL = `${rootURL}sleeper`;
exports.bedURL = `${rootURL}bed`;
exports.sleepDataURL = `${rootURL}sleepData`;
exports.sleepSliceDataURL = `${rootURL}sleepSliceData`;
exports.familyStatusURL = `${exports.bedURL}/familyStatus`;
const bedIdURL = `${exports.bedURL}/{0}/`;
exports.bedStatusURL = `${bedIdURL}status`;
exports.bedPauseModeURL = `${bedIdURL}pauseMode`;
exports.sleepNumberURL = `${bedIdURL}sleepNumber`;
exports.responsiveAirURL = `${bedIdURL}responsiveAir`;
const pumpURL = `${bedIdURL}pump/`;
exports.forceIdleURL = `${pumpURL}forceIdle`;
exports.pumpStatusURL = `${pumpURL}status`;
const foundationURL = `${bedIdURL}foundation/`;
exports.presetURL = `${foundationURL}preset`;
exports.foundationStatusURL = `${foundationURL}status`;
exports.outletStatusURL = `${foundationURL}outlet`;
exports.motionURL = `${foundationURL}motion`;
exports.underbedLightURL = `${foundationURL}underbedLight`;
exports.pinchURL = `${foundationURL}pinch`;
exports.systemURL = `${foundationURL}system`;
exports.statusURL = `${foundationURL}status`;
exports.footwarmingURL = `${foundationURL}footwarming`;
exports.adjustmentURL = `${foundationURL}adjustment`;
exports.adjustURL = `${exports.adjustmentURL}/micro`;
//# sourceMappingURL=constants.js.map