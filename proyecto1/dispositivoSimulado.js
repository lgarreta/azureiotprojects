/* console app that simulates a device that sends device-to-cloud
   messages to an IoT hub. */

'use strict';
// Protocols: http, amqp-ws, amqp
var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var fs      = require ('fs');

// Command line parameters
var fileDeviceConnString = process.argv [2]

// Connection settings
var connectionString = fs.readFileSync (fileDeviceConnString, 'utf8');
var deviceId = ConnectionString.parse(connectionString).DeviceId;
var connClient   = clientFromConnectionString(connectionString);

// Start sending event messages to the IoT Hub
connClient.open (handleSendMessages);

// Use the setInterval function to send message every 5 secs
function handleSendMessages (err) {
  if (err) {
      console.log('Could not connect: ' + err);
  } else {
		console.log('Client connected');

		// Create a message and send it to the IoT Hub every 5 second
		setInterval (sendEventMessage, 5000);
	}
}

// Construct the message sensing the temperature and send it to the cloud
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
	connClient.sendEvent(message, printResultFor('send'));
}

//---------------------------------------------------------
//------------------ Helper functions ---------------------
//---------------------------------------------------------

// Print mensajes fo the object "op"
function printResultFor(op) {
  return function printResult(err, res) {
      if (err) console.log(op + ' error: ' + err.toString());
	  if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}


