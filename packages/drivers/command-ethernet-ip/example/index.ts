import EthernetIPDriver from '../src'


(async () => {
    const driver = new EthernetIPDriver({
        configuration: {
            host: '192.168.108.33'
        }
    });

    await driver.start()

    
    const observable = driver.subscribe([{name: 'ARR'}]);
    
    observable.subscribe((a) => {
        console.log(a);
    })
    
    
    const res = await driver.read({name: 'ARR'})

    console.log({res})

    await driver.write('ARR', [0, 1, 2, 3, 4])

    const res2 = await driver.read({name: 'ARR'})

    console.log({res2})
    
})();
