const {export_schematic} = require('@hive-command/schematic-export')

exports.handler = async function (event, context) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));

    export_schematic(event.program || {
        pages: [
            {id: '1', nodes: [{id: '1', type: 'electricalSymbol', position: {x: 50, y: 10}, data: {} }, {id: '2', type: 'electricalSymbol', position: {x:  1200, y: 800}, data: {symbol: 'AcCoil'} }]},
            {id: '2', nodes: [{ id: '2', type: 'electricalSymbol', position: {x: 10, y: 10}, data: {symbol: 'AcCoil'} }]},
        ]
    })

    return context.logStreamName;
};
