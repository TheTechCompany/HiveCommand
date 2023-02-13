import { SidecarConf } from '.';

describe('Conf store', () => {

    it('Can handle path as input', () => {
        const config = new SidecarConf({path: '/tmp/file'});
    })

    it('Can handle filename as input', () => {
        const config = new SidecarConf({filename: 'file.json'})
    })

})