export interface Pipeline {
    uid: string,
    name: string,
    pipelineType: string,
    deployerType: string,
    description: string,
    created: number,
    modified: number,
    status: string,
    flowConfiguration: string,
    logLevel: string
}

export interface FlogoFlow {
    flowFilename: string,
    flowDefinition: string,
    flowProperties: string,
    volumeName: string,
    volumePath: string,
    portMap1: string,
    portMap2:  string,
    httpServicePort: string,
    propsEnv: string,
}