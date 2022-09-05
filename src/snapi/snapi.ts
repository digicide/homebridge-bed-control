/*
 * The following is my documentation of the available API requests that have 
 * been discovered. I pulled these from 
 *  - https://github.com/technicalpickles/sleepyq, 
 *  - https://github.com/erichelgeson/sleepiq, and 
 *  - https://github.com/natecj/sleepiq-php, 
 * removing the request links that no longer work. 
 * 
 * As of December 2018, I have discovered the additional API requests 
 * needed to control the pressure of the bed
 * 
 * If anybody discovers other features of the API, let me know!
 * 
 * To use, launch node in the same directory as this file, then create an
 * object with
 *| > snapi = require('./snapi.js') 
 *| > api = new snapi('username','password')
 * 
 * List of class methods:
 * - api.login()           : required first
 * - api.genURL()          : allows for passing any url extension in
 * - api.registration()    : 
 * - api.familyStatus()    : where the useful homekit information is
 * - api.sleeper()         : 
 * - api.bed()             : 
 * 
 * The next five require familyStatus() or bed() to be called first to get a bedID
 * - api.bedStatus()       : 
 * - api.bedPauseMode()    : Reads the privacy mode setting of the bed
 * - api.setBedPauseMode() : Sets the privacy mode setting of the bed
 * - api.sleepNumber()     : Used to set the sleep number for a side
 * - api.forceIdle()       : Stops the pump
 * - api.pumpStatus()      : 
 *
 * The last two provide bulk sleep data. Could be fun to import into a spreadsheet
 * - api.sleeperData()     : 
 * - api.sleepSliceData()  : 
 */

 import { Logger } from 'homebridge';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import './string.extensions';
import {
  loginURL,
  registrationURL,
  familyStatusURL,
  sleeperURL,
  bedURL,
  bedStatusURL,
  bedPauseModeURL,
  sleepNumberURL,
  responsiveAirURL,
  forceIdleURL,
  pumpStatusURL,
  presetURL,
  adjustURL,
  foundationStatusURL,
  outletStatusURL,
  motionURL,
  underbedLightURL,
  footwarmingURL,
  adjustmentURL,
  sleepDataURL,
  sleepSliceDataURL
} from './constants';
import {
  LoginData,
  RegistrationData,
  BedSideState,
  BedState,
  FamilyStatusData,
  Sleeper,
  SleeperData,
  BedStats,
  BedData,
  BedSideStatus,
  BedStatusData,
  PauseMode_e,
  BedPauseModeData,
  BedSide_e,
  SleepNumberData,
  ResponsiveAirStatusData,
  ResponsiveAirData,
  UnderbedLightStatusData,
  UnderbedLightData,
  Footwarming_e,
  FootwarmingStatusData,
  FootwarmingData,
  ForceIdleData,
  PumpStatusData,
  Preset_e,
  PresetData,
  Actuator_e,
  AdjustData,
  FoundationStatusData,
  Outlets_e,
  Outlet_Setting_e,
  OutletStatusData,
  Motion_e,
  MotionData,
  Adjustment_e,
  AdjustmentData,
  Sessions,
  SleepData,
  SleepDataData,
  SliceList,
  DaySliceData,
  SleeperSliceData,
  SleepSliceDataData
} from './interfaces';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));


class snapi {

  protected userId: string = '';
  protected bedID: string[] = [];
  protected key: string = '';

  public beds: BedState[] = [];
  public bedsStats: BedStats[] = [];
  public foundationData?: FoundationStatusData;
  public outletData?: OutletStatusData;
  public pauseMode?: BedPauseModeData;
  public bedStatusData?: {
    bedStatusData: BedStatusData,
    bedId: string
  }
  public footwarmingData?: FootwarmingStatusData;

  constructor(
    private readonly username: string,
    private readonly password: string,
    public readonly log?: Logger,
  ) {

    this.login(this.username, this.password);

  }


  login(
    username: string = this.username,
    password: string = this.password,
  ) {
    client.put<LoginData>(loginURL, {
      'login': username,
      'password': password
    })
    .then(res => {
      const { data } = res;
      this.userId = data.userId;
      this.key = data.key;

      if (this.log) this.log.debug('[snapi][login]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][login]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][login]', err);
      else console.error('[snapi][login]', err);
    })
  }


  registration() {
    client.get<RegistrationData>(registrationURL, {
      params: {
        _k: this.key
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.info('[snapi][registration]', JSON.stringify(data, null, 2));
      else console.info('[snapi][registration]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][registration]', err);
      else console.error('[snapi][registration]', err);
    })
  }


  getFamilyStatus() {
    return client.get<FamilyStatusData>(familyStatusURL, {
      params: {
        _k: this.key
      }
    })
  }


  familyStatus() {
    this.getFamilyStatus()
    .then(res => {
      const { data } = res;
      this.beds = data.beds;

      if (this.log) this.log.debug('[snapi][familyStatus', JSON.stringify(data, null, 2));
      else console.debug('[snapi][familyStatus', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][familyStatus', err);
      else console.error('[snapi][familyStatus', err);
    })
  }


  sleeper() {
    client.get<SleeperData>(sleeperURL, {
      params: {
        _k: this.key
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.info('[snapi][sleeper]', JSON.stringify(data, null, 2));
      else console.info('[snapi][sleeper]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][sleeper]', err);
      else console.error('[snapi][sleeper]', err);
    })
  }


  bed() {
    client.get<BedData>(bedURL, {
      params: {
        _k: this.key
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.info('[snapi][bed]', JSON.stringify(data, null, 2));
      else console.info('[snapi][bed]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][bed]', err);
      else console.error('[snapi][bed]', err);
    })
  }


  getBedStatus(bedId: string) {
    return client.get<BedStatusData>(bedStatusURL.format(bedId), {
      params: {
        _k: this.key
      }
    })
  }


  bedStatus(bedId: string) {
    this.getBedStatus(bedId)
    .then(res => {
      const { data } = res;
      this.bedStatusData = {
        bedStatusData: data,
        bedId: bedId
      }

      if (this.log) this.log.info('[snapi][bedStatus]', JSON.stringify(data, null, 2));
      else console.info('[snapi][bedStatus]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      this.bedStatusData = undefined;
      if (this.log) this.log.error('[snapi][bedStatus]', err);
      else console.error('[snapi][bedStatus]', err);
    })
  }


  getBedPauseMode(bedId: string) {
    return client.get<BedPauseModeData>(bedPauseModeURL.format(bedId), {
      params: {
        _k: this.key
      }
    })
  }


  bedPauseMode(bedId: string) {
    this.getBedPauseMode(bedId)
    .then(res => {
      const { data } = res;
      this.pauseMode = data;

      if (this.log) this.log.info('[snapi][bedPauseMode]', JSON.stringify(data, null, 2));
      else console.info('[snapi][bedPauseMode]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      this.pauseMode = undefined;
      if (this.log) this.log.error('[snapi][bedPauseMode]', err);
      else console.error('[snapi][bedPauseMode]', err);
    })
  }


  setBedPauseMode(bedId: string, mode: PauseMode_e) {
    client.put<BedPauseModeData>(bedPauseModeURL.format(bedId), {
      params: {
        _k: this.key,
        mode: mode
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.info('[snapi][setBedPauseMode]', JSON.stringify(data, null, 2));
      else console.info('[snapi][setBedPauseMode]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][setBedPauseMode]', err);
      else console.error('[snapi][setBedPauseMode]', err);
    })
  }


  sleepNumber(bedId: string, side: BedSide_e, num: number) {
    num = Math.round(num);
    if (num < 0) num = 0;
    if (num > 100) num = 100;

    client.put<SleepNumberData>(sleepNumberURL.format(bedId), {
      params: {
        _k: this.key,
      },
      side: side,
      sleepNumber: num
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][sleepNumber]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][sleepNumber]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][sleepNumber]', err);
      else console.error('[snapi][sleepNumber]', err);
    })
  }


  getResponsiveAirStatus(bedId: string) {
    return client.get<ResponsiveAirStatusData>(responsiveAirURL.format(bedId), {
      params: {
        _k: this.key,
      }
    })
  }

  responsiveAirStatus(bedId: string) {
    this.getResponsiveAirStatus(bedId)
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][responsiveAirStatus]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][responsiveAirStatus]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][responsiveAirStatus]', err);
      else console.error('[snapi][responsiveAirStatus]', err);
    })
  }


  responsiveAir(bedId: string, left?: boolean, right?: boolean) {
    client.put<ResponsiveAirData>(responsiveAirURL.format(bedId), {
      params: {
        _k: this.key,
      },
      leftSideEnabled: left,
      rightSideEnabled: right
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][responsiveAir]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][responsiveAir]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][responsiveAir]', err);
      else console.error('[snapi][responsiveAir]', err);
    })
  }


  // Forces the pump to stop if it is in the middle of an action
  forceIdle(bedId: string) {
    client.put<ForceIdleData>(forceIdleURL.format(bedId), {
      params: {
        _k: this.key,
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][forceIdle]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][forceIdle]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][forceIdle]', err);
      else console.error('[snapi][forceIdle]', err);
    })
  }


  pumpStatus(bedId: string) {
    client.get<PumpStatusData>(pumpStatusURL.format(bedId), {
      params: {
        _k: this.key,
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][pumpStatus]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][pumpStatus]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][pumpStatus]', err);
      else console.error('[snapi][pumpStatus]', err);
    })
  }


  preset(bedId: string, side: BedSide_e, preset: Preset_e) {
    client.put<PresetData>(presetURL.format(bedId), {
      params: {
        _k: this.key,
      },
      speed: 0, // TODO: check this value
      side: side,
      preset: preset
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][preset]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][preset]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][preset]', err);
      else console.error('[snapi][preset]', err);
    })
  }


  adjust(bedId: string, side: BedSide_e, position: number, actuator: Actuator_e) {
    position = Math.round(position);
    if (position < 0) position = 0;
    if (position > 100) position = 100;

    client.put<AdjustData>(adjustURL.format(bedId), {
      params: {
        _k: this.key,
      },
      speed: 0, // TODO: check this value
      side: side,
      position: position,
      actuator: actuator
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][adjust]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][adjust]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][adjust]', err);
      else console.error('[snapi][adjust]', err);
    })
  }


  getFoundationStatus(bedId: string) {
    return client.get<FoundationStatusData>(foundationStatusURL.format(bedId), {
      params: {
        _k: this.key,
      }
    })
  }


  foundationStatus(bedId: string) {
    this.getFoundationStatus(bedId)
    .then(res => {
      const { data } = res;
      this.foundationData = data;

      if (this.log) this.log.debug('[snapi][foundationStatus]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][foundationStatus]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      this.foundationData = undefined;
      if (this.log) this.log.error('[snapi][foundationStatus]', err);
      else console.error('[snapi][foundationStatus]', err);
    })
  }


  getOutletStatus(bedId: string, outletId: Outlets_e) {
    return client.get<OutletStatusData>(outletStatusURL.format(bedId), {
      params: {
        _k: this.key,
        outletId: outletId
      }
    })
  }


  outletStatus(bedId: string, outletId: Outlets_e) {
    this.getOutletStatus(bedId, outletId)
    .then(res => {
      const { data } = res;
      this.outletData = data;

      if (this.log) this.log.debug('[snapi][outletStatus]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][outletStatus]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      this.outletData = undefined;
      if (this.log) this.log.error('[snapi][outletStatus]', err);
      else console.error('[snapi][outletStatus]', err);
    })
  }


  outlet(bedId: string, outletId: Outlets_e, setting: Outlet_Setting_e) {
    client.put<OutletStatusData>(outletStatusURL.format(bedId), {
      params: {
        _k: this.key,
        outletId: outletId,
        setting: setting
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][outlet]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][outlet]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][outlet]', err);
      else console.error('[snapi][outlet]', err);
    })
  }


  motion(bedId: string, side: BedSide_e, head: Motion_e, massage: Motion_e, foot: Motion_e) {
    client.put<MotionData>(motionURL.format(bedId), {
      params: {
        _k: this.key,
      },
      side: side,
      headMotion: head,
      massageMotion: massage,
      footMotion: foot
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][motion]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][motion]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][motion]', err);
      else console.error('[snapi][motion]', err);
    })
  }


  underbedLightStatus(bedId: string) {
    client.get<UnderbedLightStatusData>(underbedLightURL.format(bedId), {
      params: {
        _k: this.key,
      },
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][underbedLightStatus]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][underbedLightStatus]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][underbedLightStatus]', err);
      else console.error('[snapi][underbedLightStatus]', err);
    })
  }


  underbedLight(bedId: string, enableAuto: boolean) {
    client.put<UnderbedLightData>(underbedLightURL.format(bedId), {
      params: {
        _k: this.key,
      },
      enableAuto: enableAuto
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][underbedLight]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][underbedLight]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][underbedLight]', err);
      else console.error('[snapi][underbedLight]', err);
    })
  }


  getFootwarmingStatus(bedId: string) {
    return client.get<FootwarmingStatusData>(footwarmingURL.format(bedId), {
      params: {
        _k: this.key,
      }
    })
  }


  footwarmingStatus(bedId: string) {
    this.getFootwarmingStatus(bedId)
    .then(res => {
      const { data } = res;
      this.footwarmingData = data;

      if (this.log) this.log.debug('[snapi][footwarmingStatus]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][footwarmingStatus]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      this.footwarmingData = undefined;
      if (this.log) this.log.error('[snapi][footwarmingStatus]', err);
      else console.error('[snapi][footwarmingStatus]', err);
    })
  }


  footWarming(bedId: string, left?: number, right?: number, timerLeft?: number, timerRight?: number) {
    client.put<FootwarmingData>(footwarmingURL.format(bedId), {
      params: {
        _k: this.key
      },
      footWarmingStatusLeft: left,
      footWarmingStatusRight: right,
      footWarmingTimerLeft: timerLeft,
      footWarmingTimerRight: timerRight
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][footWarming]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][footWarming]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][footWarming]', err);
      else console.error('[snapi][footWarming]', err);
    })
  }


  adjustment(bedId: string, side: BedSide_e, head: Adjustment_e, waveMode: Adjustment_e, foot: Adjustment_e, timer: number = 15) {
    client.put<AdjustmentData>(adjustmentURL.format(bedId), {
      params: {
        _k: this.key,
      },
      side: side,
      headMassageMotor: head,
      massageWaveMode: waveMode,
      footMassageMotor: foot,
      massageTimer: timer
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][adjustment]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][adjustment]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][adjustment]', err);
      else console.error('[snapi][adjustment]', err);
    })
  }


  sleepData(data_date: string, interval: string, sleeper: string = this.userId) {
    // data_date format: 'YYYY-MM-DD'
    // interval format: 'D1' (1 day), 'M1' (1 month), etc.
    client.get<SleepDataData>(sleepDataURL, {
      params: {
        _k: this.key,
        date: data_date,
        interval: interval,
        sleeper: sleeper
      }
    })
    .then(res => {
      const { data } = res;

      if (this.log) this.log.debug('[snapi][sleepData]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][sleepData]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][sleepData]', err);
      else console.error('[snapi][sleepData]', err);
    })
  }


  sleepSliceData(data_date: string, sleeper: string = this.userId, format?: string) {
    // data_date format: 'YYYY-MM-DD'
    // can optionally add a format:'csv' argument to get back a csv version of the data
    client.get<SleepSliceDataData>(sleepSliceDataURL, {
      params: {
        _k: this.key,
        date: data_date,
        sleeper: sleeper,
        format: format
      }
    })
    .then(res => {
      const { data } = res;
      
      if (this.log) this.log.debug('[snapi][sleepSliceData]', JSON.stringify(data, null, 2));
      else console.debug('[snapi][sleepSliceData]', JSON.stringify(data, null, 2));
    })
    .catch(err => {
      if (this.log) this.log.error('[snapi][sleepSliceData]', err);
      else console.error('[snapi][sleepSliceData]', err);
    })
  }

}


export default snapi;