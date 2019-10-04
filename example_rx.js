'use strict';
// Load dmxnet as libary
var dmxlib = require('./lib.js');
// Create new dmxnet instance
var dmxnet = new dmxlib.dmxnet({});

// Create a new receiver instance, listening for universe 5 on net 0 subnet 0
var receiver = dmxnet.newReceiver({
  subnet: 0,
  universe: 5,
  net: 0,
});

// Dump data if DMX Data is received
receiver.on('data', function(data) {
  console.log('DMX data:', data); // eslint-disable-line no-console
});
