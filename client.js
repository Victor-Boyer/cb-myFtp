const fs = require('fs');
const net = require('net');
const readLine = require('readline');
const path = require('path');

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

const id = process.argv[2]
const port = process.argv[3]

if (!port) {
    console.log('usage: node e01.js <port>')
    process.exit(0)
  }
if (!id) {
    console.log('usage: node e01.js <id>')
    process.exit(0)
}

let client = new net.Socket();
client.connect(port, id, function() {
  client.on('ready', function(){
    console.log('Hello, welcome to the TCP client/server.');
  })
  console.log('Connected');
});

rl.on('line', (line) => {
  client.write(`${line}`);
  if (line.substr(0, 4) == 'stor') {
    console.log('executing...');  
    let array_data = line.toString().split(' ');

    try {
      let file = fs.readFileSync(''+ array_data[1] + '');
      let fileName = path.basename(''+ array_data[1] + '');

      client.write( 'stor pipe_on |'+ file + '|' + fileName);
    } catch (err) {
      console.error('No such file called : ' + array_data[1]);
    }
  }
});

client.on('data', function(data) {
  if(data.toString().substr(0, 4) == 'retr') {
    let stor_data = data.toString().split('|');
      try {
        fs.writeFile('./ '+ stor_data[2].toString(), stor_data[1], function() {
          console.log('Download done');
        });
      } catch (err) {
          console.error('Error, cannot download the file. Maybe it already exist.');
        }
  } else console.log('Received: ' + data.toString());
});

client.on('close', function() {
  console.log('Connection closed');
  process.exit(0)
});