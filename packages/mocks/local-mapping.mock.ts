import { MappingConstraints } from '@serge/custom-types'

const localMappingConstraints: MappingConstraints = {
    bounds: [[14.194809302, 42.3558566271],[12.401259302, 43.7417816271]],
    h3res: 7,
    tileLayer: {
        url: './gulf_tiles/{z}/{x}/{y}.png',
        attribution: 'Generated by QTiles'
    },
    minZoom: 8,
    maxZoom: 13,
    maxNativeZoom: 12
}

export default localMappingConstraints