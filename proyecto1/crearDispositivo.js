/* 
 Modified by Luis Garreta to return the device connection string

 It creates a new device identity in the identity registry
 in your IoT hub. A device cannot connect to IoT hub unless
 it has an entry in the device identity registry

 If it exists, print the device key
*/

'use strict';

var iothub = require ('azure-iothub');
var ConnectionString = require('azure-iothub').ConnectionString;
var fs     = require ('fs');
var path   = require ('path'); 

// Command line parameters
var progname = path.basename (__filename);
var args = process.argv;
if (args.length < 4) {
	console.log ("USAGE: node %s <device name> <iothub connection string>", progname);
	process.exit (-1);
}
var deviceName = process.argv [2]
var fileIothubConnString = process.argv [3]

// Read the connection string from file, registry, and create the device
var connString = fs.readFileSync (fileIothubConnString, 'utf8');
var registry = iothub.Registry.fromConnectionString(connString);
var device = new iothub.Device(null);
var hostname = ConnectionString.parse(connString).HostName;

// Creates a new device definition in the device identity registry in your
// IoT hub. This code creates a new device if the device id does not exist in
// the registry, otherwise it returns the key of the existing device

device.deviceId = deviceName;
registry.create(device, function(err, deviceInfo, res) {
	if (err) {
      registry.get(device.deviceId, printDeviceInfo);
	}
	if (deviceInfo) {
		printDeviceInfo(err, deviceInfo, res)
	}
});

function printDeviceInfo(err, deviceInfo, res) {
	if (deviceInfo) 
		console.log (getConnectionString (deviceInfo));
}

function getConnectionString(device) {
  return 'HostName=' + hostname + ';' +
    'deviceId=' + device.deviceId + ';' +
    'SharedAccessKey=' + device.authentication.SymmetricKey.primaryKey;
}

