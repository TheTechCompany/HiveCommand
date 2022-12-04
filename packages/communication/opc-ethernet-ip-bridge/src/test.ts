(async () => {
    await Promise.all([1, 2, 3, 4, 5, 6, 7].map(async () => {

        await new Promise((resolve) => setTimeout(() => resolve(true), 200));
        console.log("Time")
    }))

})()