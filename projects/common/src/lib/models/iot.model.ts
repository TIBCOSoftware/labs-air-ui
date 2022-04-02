import { FormArray } from "@angular/forms";

export interface ResourceProperty {
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

export interface ResourceAttribute {
  Interface: string;
  Pin_Num: string;
  Type: string;
  Visualization?: string
}

export interface Resource {
  description: string;
  name: string;
  isHidden: boolean;
  tag: string;
  properties: ResourceProperty;
  attributes: ResourceAttribute;
}

export interface CommandResponse {
  code: string;
  description: string;
  expectedValues: string[];
}

export interface ResourceOperation {
  deviceResource: string;
  defaultValue: string;
  mappings: string[][];
}

export interface DeviceCommand {
  id: string;
  name: string;
  isHidden: boolean;
  readWrite: string;
  resourceOperations: ResourceOperation[];
}

export interface Profile {
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

export interface Service {
  created: string;
  description: string;
  name: string;
}


export interface Device {
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

export interface Subscription {
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

export interface Publisher {
  uid: number;
  created: number;
  modified: number;
  name: string;
  protocol: string;
  hostname: string;
  port: string;
  topic: string;
}

export interface Protocol{
  uid: number;
  uuid: string;
  created: number;
  modified: number;
  protocolType: string;
  brokerURL: string;
  topic: string;
  consumerGroupId: string;
  connectionTimeout: string;
  sessionTimeout: string;
  initialOffset: string;
  retryBackoff: string;
  fetchMinBytes: string;
  fetchMaxWait: string;
  commitInterval: string;
  heartbeatInterval: string;
  maximumQOS: string;
  username: string;
  password: string;
  encryptionMode: string;
  caCerticate: string;
  clientCertificate: string;
  clientKey: string;
  authMode: string;
  serverCertificate: string;
  scope: string;
}

export interface DataStore {
  uid: number;
  uuid: string;
  created: number;
  modified: number;
  dataStoreType: string;
  host: string;
  port: string;
  databaseName: string;
  user: string;
  password: string;
  accountName: string;
  warehouse: string;
  database: string;
  schema: string;
  authType: string;
  username: string;
  role: string;
  clientId: string;
  clientSecret: string;
  authorizationCode: string;
  redirectURI: string;
  loginTimeout: string;
  url: string;
  scope: string;
}

export interface Pipeline {
  uid: number;
  created: number;
  modified: number;
  name: string;
  pipelineType: string;
  deployerType: string;
  description: string;
  status: string;
  flowConfiguration: string;
  subscriptionTopic: string;
  logLevel: string;
}

export interface NVPair {
  name: string;
  value: string;
}

export interface ObjectProperties {
  properties: NVPair[];
}

export interface Addressable {
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

export interface Gateway {
  uid: number;
  description: string;
  createdts: number;
  updatedts: number;
  uuid: string;
  address: string;
  router: string;
  routerPort: string;
  deployNetwork: string;
  latitude: number;
  longitude: number;
  accessToken: string;
  platform: string;
  numDevices: number;
  username: string;
  devicesMetadata: string;
  subscriptions: Subscription[];
  publishers: Publisher[];
  pipelines: Pipeline[];
  dataStores: DataStore[];
  protocols: Protocol[];
  models: Model[];
}


export interface GetCommandResponse {
  device: string;
  origin: number;
  readings: Reading[];
}

export interface Reading {
  origin: number;
  device: string;
  name: string;
  value: string;
}

export interface Rule {
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

export interface Model {
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
}

export interface ModelConfig {
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

export interface Filter {
  device: string;
  resource: string;
}

export interface FiltersConfig {
  filters: Filter[];
}

export interface GatewayFiltersConfig {
  uid: number;
  deviceNames: string;
}

export interface Notification {
  uid: number;
  uuid: string;
  created: number;
  notifySource: string;
  notifyDevice: string;
  notifyResource: string;
  notifyLevel: string;
  gateway: string;
  value: string;
  description: string;
}

// TSReading - Time series reading.
export interface TSReading {
  value: string;
  created: number;
}

export interface TSCombinedReading {
  value: string;
  inferredValue: string;
  created: number;
}

export interface DataStoreMetadata {
  gateway: Gateway;
  devices: Device[];
}
