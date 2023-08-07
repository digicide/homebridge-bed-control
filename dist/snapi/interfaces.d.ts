import { HeaterCooler, Lightbulb, OccupancySensor, Outlet, Switch } from 'homebridge/node_modules/hap-nodejs/dist/lib/definitions';
export interface LoginData {
    userId: string;
    key: string;
    registrationState: number;
    edpLoginStatus: number;
    edpLoginMessage: string;
}
export interface RegistrationData {
    accountId: string;
    registrationState: string;
}
export interface BedSideState {
    isInBed: boolean;
    alertDetailedMessage: string;
    sleepNumber: number;
    alertId: number;
    lastLink: string;
    pressure: number;
}
export interface BedState {
    status: number;
    bedId: string;
    leftSide: BedSideState;
    rightSide: BedSideState;
}
export interface FamilyStatusData {
    beds: BedState[];
}
export interface Sleeper {
    firstName: string;
    active: boolean;
    emailValidated: boolean;
    isChild: boolean;
    bedId: string;
    birthYear: string;
    zipCode: string;
    timezone: string;
    isMale: boolean;
    weight: number;
    duration: any;
    sleeperId: string;
    height: number;
    licenseVersion: number;
    username: string;
    birthMonth: number;
    sleepGoal: number;
    isAccountOwner: boolean;
    accountId: string;
    email: string;
    avatar: string;
    lastLogin: string;
    side: number;
}
export interface SleeperData {
    sleepers: Sleeper[];
}
export interface BedStats {
    registrationDate: string;
    sleeperRightId: string;
    base: any;
    returnRequestStatus: number;
    size: string;
    name: string;
    serial: string;
    isKidsBed: boolean;
    dualSleep: boolean;
    bedId: string;
    status: number;
    sleeperLeftId: string;
    version: string;
    accountId: string;
    timezone: string;
    generation: string;
    model: string;
    purchaseDate: string;
    macAddress: string;
    sku: string;
    zipcode: string;
    reference: string;
}
export interface BedData {
    beds: BedStats[];
}
export interface BedSideStatus {
    isInBed: boolean;
    alertDetailedMessage: string;
    sleepNumber: number;
    alertId: number;
    lastLink: string;
    pressure: number;
}
export interface BedStatusData {
    status: number;
    leftSide: BedSideStatus;
    rightSide: BedSideStatus;
}
export declare enum PauseMode_e {
    Off = "off",
    On = "on"
}
export interface BedPauseModeData {
    accountId: string;
    bedId: string;
    pauseMode: PauseMode_e;
}
export declare enum BedSide_e {
    leftSide = "L",
    rightSide = "R"
}
export declare enum BedSideKey_e {
    LeftSide = "leftSide",
    RightSide = "rightSide"
}
export interface SleepNumberData {
}
export interface ResponsiveAirStatusData {
    adjustmentThreshold: number;
    inBedTimeout: number;
    leftSideEnabled: boolean;
    outOfBedTimeout: number;
    pollFrequency: number;
    prefSyncState: string;
    rightSideEnabled: boolean;
}
export interface ResponsiveAirData {
}
export interface UnderbedLightStatusData {
    enabledAuto: boolean;
    prefSyncState: string;
}
export interface UnderbedLightData {
}
export declare enum Footwarming_e {
    Off = 0,
    Low = 31,
    Med = 57,
    High = 72
}
export interface FootwarmingStatusData {
    footWarmingStatusLeft: number;
    footWarmingStatusRight: number;
    footWarmingTimerLeft: number;
    footWarmingTimerRight: number;
}
export interface FootwarmingData {
}
export interface ForceIdleData {
}
export interface PumpStatusData {
    activeTask: number;
    chamberType: number;
    leftSideSleepNumber: number;
    rightSideSleepNumber: number;
}
export declare enum Preset_e {
    Flat = 1,
    Zero_G = 2,
    Snore = 3,
    Partner_Snore = 4,
    Watch_TV = 5,
    Read = 6,
    Favorite = 128
}
export interface PresetData {
}
export declare enum Actuator_e {
    Head = "H",
    Foot = "F"
}
export interface AdjustData {
}
export interface FoundationStatusData {
    fsCurrentPositionPresetRight: string;
    fsNeedsHoming: boolean;
    fsRightFootPosition: string;
    fsLeftPositionTimerLSB: string;
    fsTimerPositionPresetLeft: string;
    fsCurrentPositionPresetLeft: string;
    fsLeftPositionTimerMSB: string;
    fsRightFootActuatorMotorStatus: string;
    fsCurrentPositionPreset: string;
    fsTimerPositionPresetRight: string;
    fsType: string;
    fsOutletsOn: boolean;
    fsLeftHeadPosition: string;
    fsIsMoving: boolean;
    fsRightHeadActuatorMotorStatus: string;
    fsStatusSummary: string;
    fsTimerPositionPreset: string;
    fsLeftFootPosition: string;
    fsRightPositionTimerLSB: string;
    fsTimedOutletsOn: boolean;
    fsRightHeadPosition: string;
    fsConfigured: boolean;
    fsRightPositionTimerMSB: string;
    fsLeftHeadActuatorMotorStatus: string;
    fsLeftFootActuatorMotorStatus: string;
}
export declare enum Outlets_e {
    LeftPlug = 1,
    RightPlug = 2,
    LeftLight = 3,
    RightLight = 4
}
export declare enum Outlet_Setting_e {
    Off = 0,
    On = 1
}
export interface OutletStatusData {
    bedId: string;
    outlet: Outlets_e;
    setting: Outlet_Setting_e;
    timer: any;
}
export declare enum Motion_e {
    Off = 0,
    On = 1
}
export interface MotionData {
}
export declare enum Adjustment_e {
    Off = 0,
    On = 1
}
export interface AdjustmentData {
}
export interface Sessions {
    startDate: string;
    longest: boolean;
    sleepIQCalculating: boolean;
    originalStartDate: string;
    restful: number;
    originalEndDate: string;
    sleepNumber: number;
    totalSleepSessionTime: number;
    avgHeartRate: number;
    restless: number;
    avgRespirationRate: number;
    isFinalized: boolean;
    sleepQuotient: number;
    endDate: string;
    outOfBed: number;
    inBed: number;
}
export interface SleepData {
    tip: string;
    message: string;
    data: string;
    sessions: Sessions[];
    goalEntry: any;
    tags: any[];
}
export interface SleepDataData {
    sleeperId: string;
    message: string;
    tip: string;
    avgHeartRate: number;
    avgRespirationRate: number;
    totalSleepSessionTime: number;
    inBed: number;
    outOfBed: number;
    restful: number;
    restless: number;
    avgSleepIQ: number;
    sleepData: SleepData[];
}
export interface SliceList {
    outOfBedTime: number;
    restfulTime: number;
    restlessTime: number;
    type: number;
}
export interface DaySliceData {
    date: string;
    sliceList: SliceList[];
}
export interface SleeperSliceData {
    days: DaySliceData[];
    sleeperId: string;
    sliceSize: number;
}
export interface SleepSliceDataData {
    sleepers: SleeperSliceData[];
}
export interface SideFeatures {
    occupancySensor: boolean;
    numberControl: boolean;
    responsiveAir: boolean;
    headControl: boolean;
    footControl: boolean;
    outlet: boolean;
    light: boolean;
    footwarming: boolean;
}
export interface BedFeatures {
    privacy: boolean;
    foundation: boolean;
    leftSide: SideFeatures;
    rightSide: SideFeatures;
    anySide: SideFeatures;
    Manufacturer: string;
    Model: string;
    SerialNumber: string;
}
export interface SideServices {
    occupancySensor?: OccupancySensor;
    numberControl?: Lightbulb;
    responsiveAir?: Switch;
    headControl?: Lightbulb;
    footControl?: Lightbulb;
    outlet?: Outlet;
    light?: Outlet;
    footwarmingControl?: HeaterCooler;
}
export interface Services {
    privacySwitch?: Switch;
    leftSide?: SideServices;
    rightSide?: SideServices;
    anySide?: SideServices;
}
//# sourceMappingURL=interfaces.d.ts.map