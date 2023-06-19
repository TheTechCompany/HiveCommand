import EthernetIPDriver from '../src'


(async () => {
    const driver = new EthernetIPDriver({
        configuration: {
            host: '192.168.1.2'
        }
    });

    await driver.start()

    
    const observable = await driver.subscribe([
        {name: 'Test'},
        {name: 'CEB_Date.Month_Set'},
        // {name: 'CEB_Date.Month_Set[2]'},
        // {name: 'CEB_Date.Month_Set[3]'},
        // {name: 'CEB_Date.Month_Set[4]'},
        // {name: 'CEB_Date.Month_Set[5]'},
        // {name: 'CEB_Date.Month_Set[6]'},
        // {name: 'CEB_Date.Month_Set[7]'}

    ]);
    
    observable.subscribe((a) => {
        console.log(Date.now(), a);
    })

    driver.write('Test.tester.HMI_Extend', true)
    

    // const res = await driver.read({name: 'ARR'})
// 
    // console.log({res})

    // await driver.write('ARR', [0, 1, 2, 3, 4])

    // const res2 = await driver.read({name: 'ARR'})

    // console.log({res2})
    
})();
