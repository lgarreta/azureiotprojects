/*
 * Gets values from Temperatura and Luminosidad sensors and sends to 
 * the Azure IoT Hub
 * Author: Luis Garreta
 */

'use strict';

// Azure IoT packages
var Protocol = require('azure-iot-device-http').Http;
var Client = require('azure-iot-device').Client;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var fs = require ('fs');							 

// Command line parameters
var fileDeviceConnString = process.argv [2]

// Get IoT Hub device info and create the IoT Hub Client
var connectionString = fs.readFileSync (fileDeviceConnString, 'utf8');
var deviceId = ConnectionString.parse(connectionString).DeviceId;
var client   = Client.fromConnectionString(connectionString, Protocol);

// Edison packages
var five = require("johnny-five");
var Edison = require("edison-io");

var board = new five.Board({
	io: new Edison()
});

// Devices data
var Temperatura = 0;
var Luminosidad = 0;

// Send device meta data
var deviceMetaData = getDeviceMetaData ();
console.log (">>> " + deviceMetaData);

board.on("ready", function() {
	// Initialize sensors
	var tempDevice = new five.Temperatura({
		pin: "A0",
		controller: "GROVE"
	});
	var lightDevice = new five.Sensor("A3");

	var relayDevice = new five.Relay(3);
	
	client.open(function (err, result) {
		if (err) {
			printErrorFor('open')(err);
		} else {
			console.log('Sending device metadata:\n' + JSON.stringify(deviceMetaData));
			client.sendEvent(new Message(JSON.stringify(deviceMetaData)), printErrorFor('send metadata'));

			client.on('message', function (msg) {
				console.log('receive data: ' + msg.getData());

				try {
					var command = JSON.parse(msg.getData());

					switch (command.Name) {
						case 'SetFan':
							var fanValue = command.Parameters.FanValue;
							if (fanValue == 1.0) {
								relayDevice.on ()
								console.log('Fan is turned on');
							}
							else if (fanValue == 0.0) {
								relayDevice.off ()
								console.log('Fan is turned off');
							}
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
			});

			// start event data send routing
			var sendInterval = setInterval(function () {
				Temperatura = tempDevice.celsius;
				Luminosidad = lightDevice.value;
				var data = JSON.stringify({
					'DeviceID': deviceId,
					'Temperatura': Temperatura,
					'Luminosidad': Luminosidad
				});

				console.log('Sending device event data:\n' + data);
				client.sendEvent(new Message(data), printErrorFor('send event'));
			}, 1000);

			client.on('error', function (err) {
				printErrorFor('client')(err);
				if (sendInterval) clearInterval(sendInterval);
				client.close();
			});
		}
	});
});

//---------------------------------------------------------
// Helper function to print results for an operation
//---------------------------------------------------------
function printErrorFor(op) {
	return function printError(err) {
		if (err) console.log(op + ' error: ' + err.toString());
	};
}

//---------------------------------------------------------
// Return the device metadata
//---------------------------------------------------------
function getDeviceMetaData () {
	var deviceMetaData = {
		'ObjectType': 'DeviceInfo',
		'IsSimulatedDevice': 0,
		'Version': '1.0',
		'DeviceProperties': {
		'DeviceID': deviceId,
		'HubEnabledState': 1,
		'CreatedTime': '2016-09-21T20:28:55.5448990Z',
		'DeviceState': 'normal',
		'UpdatedTime': null,
		'Manufacturer': 'Intel',
		'ModelNumber': 'Edison',
		'SerialNumber': '12345678',
		'FirmwareVersion': '159',
		'Platform': 'node.js',
		'Processor': 'Intel',
		'InstalledRAM': '64 MB',
		'Latitude': 3.247700,
		'Longitude': -76.530800
		},
		'Commands': [{'Name': 'SetFan', 'Parameters': [{ 'Name': 'Fan', 'Type': 'double' }] }]
	};
	return deviceMetaData;
}
