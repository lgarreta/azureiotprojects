/* console app that simulates a device that sends device-to-cloud
   messages to an IoT hub. */

'use strict';
// Protocols: http, amqp-ws, amqp
var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var fs      = require ('fs');

// Connection settings
var connectionString = fs.readFileSync ('connstr-device.txt', 'utf8');
var client   = clientFromConnectionString(connectionString);
var deviceId = ConnectionString.parse(connectionString).DeviceId;

/* Create a callback and use the setInterval function
   to send a new message to your IoT hub every second */
var connectCallback = function (err) {
  if (err) {
      console.log('Could not connect: ' + err);
  } else {
		console.log('Client connected');
		// Create a message and send it to the IoT Hub every 5 second
		setInterval (sendEventMessage, 5000);
		// Listen for  incoming messages
		client.on ('message', messageHandler);
	}
};

// Open the connection to your IoT Hub and start sending messages
client.open(connectCallback);


//---------------------------------------------------------
//------------------ Helper functions ---------------------
//---------------------------------------------------------

// Handle messages send to the devise from the IoT Hub
function messageHandler (msg) {
	try {
	  var command = JSON.parse(msg.getData());
	  switch (command.Name) {
		case 'SetTemperature':
		  var temperature = command.Parameters.Temperature;
		  console.log ("")
		  console.log('>>>>> Lowering the temperature to :' + temperature + ' ºC');
		  console.log ("")
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
function sendEventMessage () {
	var v1 = deviceId;
	var v2 = 'SensorTemp';
	var v3 = 'version01';
	var v4 = deviceId;
	var v5 = 3 + (Math.random() * 40);

	var data = JSON.stringify({
		"ObjectName": v1, 
		"ObjectType": v2, 
		"Version": v2, 
		"TargetAlarmDevice": v4, 
		'Temperature': v5 
	});
	var message = new Message(data);
	console.log("Sending message: " + message.getData());
	client.sendEvent(message, printResultFor('send'));
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


