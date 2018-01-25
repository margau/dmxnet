//Load dmxnet as libary
var dmxlib=require('./lib.js');
//Create new dmxnet instance
var dmxnet = new dmxlib.dmxnet({verbose:2});
//Create new Sender instance
var sender=dmxnet.newSender({ip:"255.255.255.255",subnet:0,universe:0,net:0});
//Set Channels
sender.setChannel(511,255);
sender.setChannel(255,128);
//Fill Channels
sender.fillChannels(1,20,250);
//Stop sender after 5 seconds
setTimeout(function() {
    sender.stop();
},50000);
