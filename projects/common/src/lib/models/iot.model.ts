import { FormArray } from "@angular/forms";
import { Gateway } from "@TIBCOSoftware/labs-air-graph-client";

export class ResourceProperty {
  assertion: string;
  base: string;
  defaultValue: string;
  mask: string;
  maximum: string;
  mediaType: string;
  minimum: string;
  offset: string;
  readWrite: string;
  scale: string;
  shift: string;
  units: string;
  valueType: string;
}

export class ResourceAttribute {
  Interface: string;
  Pin_Num: string;
  Type: string;
  Visualization?: string
}

export class Resource {
  description: string;
  name: string;
  isHidden: boolean;
  tag: string;
  properties: ResourceProperty;
  attributes: ResourceAttribute;
}

export class CommandResponse {
  code: string;
  description: string;
  expectedValues: string[];
}

export class ResourceOperation {
  deviceResource: string;
  defaultValue: string;
  mappings: string[][];
}

export class DeviceCommand {
  id: string;
  name: string;
  isHidden: boolean;
  readWrite: string;
  resourceOperations: ResourceOperation[];
}

export class Profile {
  created: number;
  modified: number;
  name: string;
  description: string;
  id: string;
  manufacturer: string;
  model: string;
  labels: string[];
  deviceResources: Resource[];
  deviceCommands: DeviceCommand[];
}

export class Service {
  created: string;
  description: string;
  name: string;
}


export class Device {
  created: string;
  modified: string;
  origin: string;
  description: string;
  id: string;
  name: string;
  adminState: string;
  operatingState: string;
  location: string;
  labels: string[];
  profile: Profile;
  service: Service;
}

export class Subscription {
  uid: number;
  origin: number;
  created: number;
  modified: number;
  name: string;
  consumer: string;
  publisher: string;
  destination: string;
  protocol: string;
  method: string;
  address: string;
  port: number;
  path: string;
  format: string;
  enabled: boolean;
  user: string;
  password: string;
  topic: string;
  encryptionAlgorithm: string;
  encryptionKey: string;
  initializingVector: string;
  compression: string;
  deviceIdentifierFilter: string;
  valueDescriptorFilter: string;
}

export class Publisher {
  uid: number;
  created: number;
  modified: number;
  name: string;
  protocol: string;
  hostname: string;
  port: string;
  topic: string;
}


export class NVPair {
  name: string;
  value: string;
}

export class ObjectProperties {
  properties: NVPair[];
}

export class Addressable {
  created: number;
  modified: number;
  origin: number;
  id: string;
  name: string;
  protocol: string;
  method: string;
  address: string;
  port: number;
  path: string;
  baseURL: string;
  url: string;
  user: string;
  password: string;
}


export class GetCommandResponse {
  device: string;
  origin: number;
  readings: Reading[];
}

export class Reading {
  origin: number;
  device: string;
  name: string;
  value: string;
}

export class Rule {
  uid: number;
  created: number;
  modified: number;
  uuid: string;
  name: string;
  description: string;
  useInferredValue: boolean;
  condDevice: string;
  condResource: string;
  condCompareNewMetricToValue: boolean;
  condCompareNewMetricToValueOp: string;
  condCompareNewMetricValue: string;
  condCompareNewMetricToLastMetric: boolean;
  condCompareNewMetricToLastMetricOp: string;
  condCompareLastMetricToValue: boolean;
  condCompareLastMetricToValueOp: string;
  condCompareLastMetricValue: string;
  actionSendNotification: boolean;
  actionNotification: string;
  actionSendCommand: boolean;
  actionDevice: string;
  actionResource: string;
  actionValue: string;
}

class Model {
  uid: number;
  created: number;
  modified: number;
  uuid: string;
  name: string;
  description: string;
  inputType: string;
  url: string;
  scope: string;
  inputTemplate: string;
  headers: string;
  method: string;
}

export class ModelConfig {
  uid: number;
  created: number;
  modified: number;
  uuid: string;
  name: string;
  description: string;
  device: string;
  resource: string;
  model: string;
}

export class Filter {
  device: string;
  resource: string;
}

export class FiltersConfig {
  filters: Filter[];
}

export class TSCombinedReading {
  value: string;
  inferredValue: string;
  created: number;
}

export class ChartTSData {
  x: string;
  y: number;

  constructor(x: string, y: number) {
      this.x = x;
      this.y = y;
  }

}

export class DataStoreMetadata {
  gateway: Gateway;
  devices: Device[];
}

export class ScatterChartDataset {
  label: string;
  type: string;
  pointRadius: number;
  fill: boolean;
  lineTension: number;
  borderWidth: number;
  data: {}[];

  constructor(label: string, type: string, pointRadius: number, fill: boolean, lineTension: number, borderWidth: number, data: []) {
      this.label = label;
      this.type = type;
      this.pointRadius = pointRadius;
      this.fill = fill;
      this.lineTension = lineTension;
      this.borderWidth = borderWidth;
      this.data = data;
  }

}

export class RestBroadcast {
  logLevel: string;
  restTimeout: number;
  restURLs: FormArray;
  restMethods: FormArray;
  restBodies: FormArray;
}
