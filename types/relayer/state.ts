import { Relayers, Jobs, Loaders } from './entities'

type Wei = string

export type RelayerState = {
    ethRate: Wei
    relayers: Relayers
    jobs: Jobs
    loaders: Loaders
}
