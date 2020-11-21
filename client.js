const { read } = require('fs');
var net = require('net');
const readLine = require('readline');

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

var client = new net.Socket();
client.connect(port, id, function() {
  client.on('ready', function(){
    console.log('Hello, welcome to the TCP client/server.');
  })
  console.log('Connected');
});

rl.on('line', (line) => {
  client.write(`${line}`);
});

client.on('data', function(data) {
  var msg =  data.toString();
	console.log('Received: ' + msg);
	//client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});