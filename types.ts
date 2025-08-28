
export enum AppState {
  INPUT,
  SCANNING,
  RESULTS,
}

export interface TruckInfo {
  date: string;
  truckNumber: string;
}

export interface ScannedRecord {
  date: string;
  truckNumber: string;
  tagId: string;
}
