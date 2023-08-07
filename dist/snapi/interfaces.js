"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adjustment_e = exports.Motion_e = exports.Outlet_Setting_e = exports.Outlets_e = exports.Actuator_e = exports.Preset_e = exports.Footwarming_e = exports.BedSideKey_e = exports.BedSide_e = exports.PauseMode_e = void 0;
// bed pause mode types
var PauseMode_e;
(function (PauseMode_e) {
    PauseMode_e["Off"] = "off";
    PauseMode_e["On"] = "on";
})(PauseMode_e = exports.PauseMode_e || (exports.PauseMode_e = {}));
// sleep number types
var BedSide_e;
(function (BedSide_e) {
    BedSide_e["leftSide"] = "L";
    BedSide_e["rightSide"] = "R";
})(BedSide_e = exports.BedSide_e || (exports.BedSide_e = {}));
var BedSideKey_e;
(function (BedSideKey_e) {
    BedSideKey_e["LeftSide"] = "leftSide";
    BedSideKey_e["RightSide"] = "rightSide";
})(BedSideKey_e = exports.BedSideKey_e || (exports.BedSideKey_e = {}));
// foot warming types
var Footwarming_e;
(function (Footwarming_e) {
    Footwarming_e[Footwarming_e["Off"] = 0] = "Off";
    Footwarming_e[Footwarming_e["Low"] = 31] = "Low";
    Footwarming_e[Footwarming_e["Med"] = 57] = "Med";
    Footwarming_e[Footwarming_e["High"] = 72] = "High";
})(Footwarming_e = exports.Footwarming_e || (exports.Footwarming_e = {}));
// preset types
var Preset_e;
(function (Preset_e) {
    Preset_e[Preset_e["Flat"] = 1] = "Flat";
    Preset_e[Preset_e["Zero_G"] = 2] = "Zero_G";
    Preset_e[Preset_e["Snore"] = 3] = "Snore";
    Preset_e[Preset_e["Partner_Snore"] = 4] = "Partner_Snore";
    Preset_e[Preset_e["Watch_TV"] = 5] = "Watch_TV";
    Preset_e[Preset_e["Read"] = 6] = "Read";
    Preset_e[Preset_e["Favorite"] = 128] = "Favorite";
})(Preset_e = exports.Preset_e || (exports.Preset_e = {}));
// adjust types
var Actuator_e;
(function (Actuator_e) {
    Actuator_e["Head"] = "H";
    Actuator_e["Foot"] = "F";
})(Actuator_e = exports.Actuator_e || (exports.Actuator_e = {}));
// outlet status types
var Outlets_e;
(function (Outlets_e) {
    Outlets_e[Outlets_e["LeftPlug"] = 1] = "LeftPlug";
    Outlets_e[Outlets_e["RightPlug"] = 2] = "RightPlug";
    Outlets_e[Outlets_e["LeftLight"] = 3] = "LeftLight";
    Outlets_e[Outlets_e["RightLight"] = 4] = "RightLight";
})(Outlets_e = exports.Outlets_e || (exports.Outlets_e = {}));
var Outlet_Setting_e;
(function (Outlet_Setting_e) {
    Outlet_Setting_e[Outlet_Setting_e["Off"] = 0] = "Off";
    Outlet_Setting_e[Outlet_Setting_e["On"] = 1] = "On";
})(Outlet_Setting_e = exports.Outlet_Setting_e || (exports.Outlet_Setting_e = {}));
// motion types
var Motion_e;
(function (Motion_e) {
    Motion_e[Motion_e["Off"] = 0] = "Off";
    Motion_e[Motion_e["On"] = 1] = "On";
})(Motion_e = exports.Motion_e || (exports.Motion_e = {}));
// adjustment types
var Adjustment_e;
(function (Adjustment_e) {
    Adjustment_e[Adjustment_e["Off"] = 0] = "Off";
    Adjustment_e[Adjustment_e["On"] = 1] = "On";
})(Adjustment_e = exports.Adjustment_e || (exports.Adjustment_e = {}));
//# sourceMappingURL=interfaces.js.map