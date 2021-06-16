
export class PropertyValue {
  type: string = "";
  readWrite: string = "";
  minimum: string = "";
  maximum: string = "";
  defaultValue: string = "";
  size: string = "";
  word: string = "";
  lsb: string = "";
  mask: string = "";
  shift: string = "";
  scale: string = "";
  offset: string = "";
  base: string = "";
  assertion: string = "";
  signed: string = "";
  precision: string = "";
}

export class PropertyUnit {
  type: string = "";
  readWrite: string = "";
  defaultValue: string = "";
}

export class ResourceProperty {
  value: PropertyValue = new PropertyValue();
  units: PropertyUnit = new PropertyUnit();
}

export class ResourceAttribute {
  Interface: string = "";
  Pin_Num: string = "";
  Type: string = "";
  Visualization?: string = ""
}

export class Resource {
  description: string = "";
  name: string = "";
  tag: string = "";
  properties: ResourceProperty = new ResourceProperty();
  attributes: ResourceAttribute = new ResourceAttribute();
}

export class CommandResponse {
  code: string = "";
  description: string = "";
  expectedValues: string[] = [];
}

export class CommandOp {
  path: string = "";
  responses: CommandResponse[] = [];
  parameterNames: string[] = [];
}

export class Command {
  id: string = "";
  name: string = "";
  get: CommandOp = new CommandOp();
  put: CommandOp = new CommandOp();
}

export class Profile {
  created: number = 0;
  modified: number = 0;
  name: string = "";
  description: string = "";
  id: string = "";
  manufacturer: string = "";
  model: string = "";
  deviceResources: Resource[] = [];
  deviceCommands: Command[] = [];
}

export class Service {
  created: string = "";
  description: string = "";
  name: string = "";
}


export class Device {
  created: string = "";
  modified: string = "";
  origin: string = "";
  description: string = "";
  id: string = "";
  name: string = "";
  adminState: string = "";
  operatingState: string = "";
  location: string = "";
  labels: string[] = [];
  profile: Profile = new Profile();
  service: Service = new Service();
}

export class Subscription {
  uid: number = 0;
  origin: number = 0;
  created: number = 0;
  modified: number = 0;
  name: string = "";
  consumer: string = "";
  publisher: string = "";
  destination: string = "";
  protocol: string = "";
  method: string = "";
  address: string = "";
  port: number = 0;
  path: string = "";
  format: string = "";
  enabled: boolean = false;
  user: string = "";
  password: string = "";
  topic: string = "";
  encryptionAlgorithm: string = "";
  encryptionKey: string = "";
  initializingVector: string = "";
  compression: string = "";
  deviceIdentifierFilter: string = "";
  valueDescriptorFilter: string = "";
}

export class Publisher {
  uid: number = 0;
  created: number = 0;
  modified: number = 0;
  name: string = "";
  protocol: string = "";
  hostname: string = "";
  port: string = "";
  topic: string = "";
}

export class Protocol{
  uid: number = 0;
  uuid: string = "";
  created: number = 0;
  modified: number = 0;
  protocolType: string = "";
  brokerURL: string = "";
  topic: string = "";
  consumerGroupId: string = "";
  connectionTimeout: string = "";
  sessionTimeout: string = "";
  initialOffset: string = "";
  retryBackoff: string = "";
  fetchMinBytes: string = "";
  fetchMaxWait: string = "";
  commitInterval: string = "";
  heartbeatInterval: string = "";
  maximumQOS: string = "";
  username: string = "";
  password: string = "";
  encryptionMode: string = "";
  caCerticate: string = "";
  clientCertificate: string = "";
  clientKey: string = "";
  authMode: string = "";
  serverCertificate: string = "";
  scope: string = "";
}

export class DataStore {
  uid: number = 0;
  uuid: string = "";
  created: number = 0;
  modified: number = 0;
  dataStoreType: string = "";
  host: string = "";
  port: string = "";
  databaseName: string = "";
  user: string = "";
  password: string = "";
  accountName: string = "";
  warehouse: string = "";
  database: string = "";
  schema: string = "";
  authType: string = "";
  username: string = "";
  role: string = "";
  clientId: string = "";
  clientSecret: string = "";
  authorizationCode: string = "";
  redirectURI: string = "";
  loginTimeout: string = "";
  url: string = "";
  scope: string = "";
}

export class Pipeline {
  uid: number = 0;
  created: number = 0;
  modified: number = 0;
  name: string = "";
  pipelineType: string = "";
  protocolType: string = ""; //deprecated
  protocol: any; // deprecated
  dataStoreType: string = ""; // deprecated
  dataStore: any; // deprecated
  filter: any; // deprecated
  streaming: any; // deprecated
  description: string = "";
  status: string = "";
  flowConfiguration: string = "";
  logLevel: string = "";
}

export class NVPair {
  name: string = "";
  value: string = "";
}

export class ObjectProperties {
  properties: NVPair[] = [];
}

export class Addressable {
  created: number = 0;
  modified: number = 0;
  origin: number = 0;
  id: string = "";
  name: string = "";
  protocol: string = "";
  method: string = "";
  address: string = "";
  port: number = 0;
  path: string = "";
  baseURL: string = "";
  url: string = "";
  user: string = "";
  password: string = "";
}

export class Gateway {
  uid: number = 0;
  description: string = "";
  createdts: number = 0;
  updatedts: number = 0;
  uuid: string = "";
  address: string = "";
  router: string = "";
  routerPort: string = "";
  deployNetwork: string = "";
  latitude: number = 0;
  longitude: number = 0;
  accessToken: string = "";
  platform: string = "";
  numDevices: number = 0;
  username: string = "";
  devicesMetadata: string = "";
  subscriptions: Subscription[] = [];
  publishers: Publisher[] = [];
  pipelines: Pipeline[] = [];
  dataStores: DataStore[] = [];
  protocols: Protocol[] = [];
  models: Model[] = [];
}


export class GetCommandResponse {
  device: string = "";
  origin: number = 0;
  readings: Reading[] = [];
}

export class Reading {
  origin: number = 0;
  device: string = "";
  name: string = "";
  value: string = "";
}

export class Rule {
  uid: number = 0;
  created: number = 0;
  modified: number = 0;
  uuid: string = "";
  name: string = "";
  description: string = "";
  useInferredValue: boolean = false;
  condDevice: string = "";
  condResource: string = "";
  condCompareNewMetricToValue: boolean = false;
  condCompareNewMetricToValueOp: string = "";
  condCompareNewMetricValue: string = "";
  condCompareNewMetricToLastMetric: boolean = false;
  condCompareNewMetricToLastMetricOp: string = "";
  condCompareLastMetricToValue: boolean = false;
  condCompareLastMetricToValueOp: string = "";
  condCompareLastMetricValue: string = "";
  actionSendNotification: boolean = false;
  actionNotification: string = "";
  actionSendCommand: boolean = false;
  actionDevice: string = "";
  actionResource: string = "";
  actionValue: string = "";
}

export class Model {
  uid: number = 0;
  created: number = 0;
  modified: number = 0;
  uuid: string = "";
  name: string = "";
  description: string = "";
  inputType: string = "";
  url: string = "";
  platform: string = "";
  scope: string = "";
}

export class ModelConfig {
  uid: number = 0;
  created: number = 0;
  modified: number = 0;
  uuid: string = "";
  name: string = "";
  description: string = "";
  device: string = "";
  resource: string = "";
  model: string = "";
}

export class Filter {
  device: string = "";
  resource: string = "";
}

export class FiltersConfig {
  filters: Filter[] = [];
}

export class GatewayFiltersConfig {
  uid: number = 0;
  deviceNames: string = "";
}

export class Notification {
  uid: number = 0;
  uuid: string = "";
  created: number = 0;
  notifySource: string = "";
  notifyDevice: string = "";
  notifyResource: string = "";
  notifyLevel: string = "";
  gateway: string = "";
  value: string = "";
  description: string = "";
}

// TSReading - Time series reading.
export class TSReading {
  value: string = "";
  created: number = 0;
}

export class ChartTSData {
  x: string = "";
  y: number = 0;

  constructor(x: string, y: number) {
    this.x = x;
    this.y = y;
  }

}

export class DataStoreMetadata {
  gateway: Gateway = new Gateway();
  devices: Device[] = [];
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
