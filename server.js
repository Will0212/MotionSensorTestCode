const express = require('express'); 
const { SerialPort } = require('serialport'); 
const { ReadlineParser } = require('@serialport/parser-readline'); 

const app = express();

const port = new SerialPort({ path: 'COM7', baudRate: 115200 });

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let currentSignal = 0;

app.use(express.static('public'));

app.get('/control_motor', (req, res) => {
    const command = req.query.command;
    let arduinoCommand = command;
 
    port.write(arduinoCommand + '\n', (err) => {
        if (err) {
            return res.status(500).send('Error on write: ' + err.message);
        }
        res.send('Command sent to Arduino: ' + arduinoCommand);
    });
});

app.get('/get_sensor_signal', (req, res) => {
    res.send({ signal: currentSignal });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});

parser.on('data', line =>{
    if (line.startsWith("signal:")) {
    	currentSignal = parseFloat(line.split("signal:")[1]);
    }
});
