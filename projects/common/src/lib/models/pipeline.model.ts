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

