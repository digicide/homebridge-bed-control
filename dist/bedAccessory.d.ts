import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { BedControlPlatform } from './platform';
import { Actuator_e, BedSideKey_e, BedStatusData, FootwarmingStatusData, Footwarming_e, FoundationStatusData, Outlets_e, ResponsiveAirStatusData, Services, PumpStatusData } from './snapi/interfaces';
import Snapi from './snapi/snapi';
export declare class BedAccessory {
    private readonly platform;
    private readonly accessory;
    private readonly snapi;
    protected bedId: string;
    protected bedName: string;
    private batched_requests;
    private setSleepNumber;
    private adjustActuator;
    services: Services;
    constructor(platform: BedControlPlatform, accessory: PlatformAccessory, snapi: Snapi);
    setPrivacy(value: CharacteristicValue): Promise<void>;
    getPrivacy(): Promise<CharacteristicValue>;
    setNumber(side: BedSideKey_e, value: number): Promise<void>;
    getNumber(side: BedSideKey_e): Promise<CharacteristicValue>;
    getOccupancy(side: BedSideKey_e): Promise<CharacteristicValue>;
    getAnyOccupancy(): Promise<CharacteristicValue>;
    setResponsiveAir(side: BedSideKey_e, value: boolean): Promise<void>;
    getResponsiveAir(side: BedSideKey_e): Promise<CharacteristicValue>;
    setActuatorPosition(side: BedSideKey_e, actuator: Actuator_e, value: number): Promise<void>;
    getActuatorPosition(side: BedSideKey_e, actuator: Actuator_e): Promise<CharacteristicValue>;
    setOutlet(outlet: Outlets_e, value: boolean): Promise<void>;
    getOutlet(outlet: Outlets_e): Promise<CharacteristicValue>;
    setAnyOutlet(outletKey: string, value: boolean): Promise<void>;
    getAnyOutlet(outletKey: string): Promise<CharacteristicValue>;
    getFootwarmingTimeRemaining(side: BedSideKey_e): Promise<CharacteristicValue>;
    setFootwarmingTimeRemaining(side: BedSideKey_e, value: number): Promise<void>;
    setFootwarmingValue(side: BedSideKey_e, value: number): Promise<void>;
    getFootwarmingValue(side: BedSideKey_e): Promise<CharacteristicValue>;
    setFootwarming(side: BedSideKey_e, value: Footwarming_e): Promise<void>;
    getFootwarming(side: BedSideKey_e): Promise<CharacteristicValue>;
    getBedStatus(): Promise<BedStatusData | undefined>;
    getPumpStatus(): Promise<PumpStatusData | undefined>;
    getResponsiveAirStatus(): Promise<ResponsiveAirStatusData | undefined>;
    getFoundationStatus(): Promise<FoundationStatusData | undefined>;
    getFootwarmingStatus(): Promise<FootwarmingStatusData | undefined>;
    batchRequests<T>(_p: string, func: () => Promise<T>): Promise<T>;
    debounce(func: (...args: any[]) => any, timeout?: number): (...args: any[]) => void;
}
//# sourceMappingURL=bedAccessory.d.ts.map