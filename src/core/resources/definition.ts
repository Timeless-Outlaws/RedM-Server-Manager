export type Definition = {
    resources: Resource[]
}

export type Resource = {
    type?: ResourceType,
    path: string,
    url?: string,

}

export enum ResourceType {
    GIT = 'GIT',
    TARBALL = 'TARBALL'
}
