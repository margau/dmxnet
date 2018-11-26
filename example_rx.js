//Load dmxnet as libary
var dmxlib=require('./lib.js');
//Create new dmxnet instance
var dmxnet = new dmxlib.dmxnet({verbose:2});
//Display controllers every 5 seconds
setInterval(function() {
    console.log(dmxnet.controllers);
},30000);
