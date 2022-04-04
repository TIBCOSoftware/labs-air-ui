
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

export class Protocol{
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

export class DataStore {
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

export class Pipeline {
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

export class Gateway {
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

export class Model {
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

export class GatewayFiltersConfig {
  uid: number;
  deviceNames: string;
}

export class Notification {
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
export class TSReading {
  value: string;
  created: number;
}

export class TSCombinedReading {
  value: string;
  inferredValue: string;
  created: number;
}

export class DataStoreMetadata {
  gateway: Gateway;
  devices: Device[];
}
