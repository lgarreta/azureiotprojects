/* console app that simulates a device that sends device-to-cloud
   messages to an IoT hub. */

'use strict';
// Protocols: http, amqp-ws, amqp
var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var path   = require ('path'); 
var fs      = require ('fs');

// Edison and Grove Kit packages
var five = require("johnny-five");
var Edison = require("edison-io");

var board = new five.Board({
	io: new Edison()
});


// Vars for devices
var tempDevice;
var lightDevice; 
var relayDevice;

// Devices data
var Temperatura = 0;
var Luminosidad = 0;

// Command line parameters
var progname = path.basename (__filename);
var args = process.argv;
if (args.length < 3) {
	console.log ("USAGE: node %s <connection string device> ", progname);
	process.exit (-1);
}
var fileDeviceConnString = process.argv [2]

// Connection settings
var connectionString = fs.readFileSync (fileDeviceConnString, 'utf8');
var deviceId = ConnectionString.parse(connectionString).DeviceId;
var client   = clientFromConnectionString(connectionString);

/* Create a callback and use the setInterval function
   to send a new message to your IoT hub every second */
var connectCallback = function (err) {
  if (err) {
      console.log('Could not connect: ' + err);
  } else {
		console.log('Client connected');
		// Create a message and send it to the IoT Hub every 5 second
		setInterval (intervalCallback, 5000);
		// Listen for  incoming messages
		client.on ('message', messageHandler);

	}
};

// Init board 
board.on("ready", function() {
	// Initialize sensors
	tempDevice = new five.Temperature({
		pin: "A0",
		controller: "GROVE"
	});
	lightDevice = new five.Sensor("A3");

	relayDevice = new five.Relay(3);

	// Open the connection to your IoT Hub and start sending messages
	client.open(connectCallback);
});


//---------------------------------------------------------
//------------------ Helper functions ---------------------
//---------------------------------------------------------

// Handle messages send to the devise from the IoT Hub
function messageHandler (msg) {
	try {
	  var command = JSON.parse(msg.getData());
	  switch (command.Name) {
		case 'SetTemperature':
		  var temperatura = command.Parameters.Temperatura;
		  console.log ("")
		  console.log (">>>>>> Receiving command <SetTemperature>. Toggling the relay");
		  console.log ("")
		  relayDevice.toggle ()
		  client.complete(msg, printErrorFor('complete'));
		  break;
		default:
		  console.error('Unknown command: ' + command.Name);
		  client.reject(msg, printErrorFor('complete'));
		  break;
	  }
	}
	catch (err) {
	  printErrorFor('parse received message')(err);
	  client.reject(msg, printErrorFor('reject'));
	}
}

// Get the value from the temperature and send it to the cloud
function intervalCallback () {
	var data = JSON.stringify({
		"deviceId":deviceId,
		"Luminosidad":lightDevice.value,
		'Temperatura':tempDevice.celsius
	});
	var message = new Message(data);
	console.log("Sending message: " + message.getData());
	client.sendEvent  (message, printResultFor('send'));
}

// Print mensajes fo the object "op"
function printResultFor(op) {
  return function printResult(err, res) {
      if (err) console.log(op + ' error: ' + err.toString());
	  if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

// print results for an operation
function printErrorFor(op) {
  return function printError(err) {
    if (err) console.log(op + ' error: ' + err.toString());
  };
}


