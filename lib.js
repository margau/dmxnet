var dgram = require('dgram');
var jspack = require('jspack').jspack;

// ArtDMX Header for jspack
var ArtDmxHeaderFormat = '!7sBHHBBHH'
// ArtDMX Payload for jspack
var ArtDmxPayloadFormat = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
//ArtDMX Sequence Counter
var ArtDmxSeq=1;

function sender(options){
	//set options
	var options = options || {};
	this.net=options.net || 0;
	this.subnet=options.subnet || 0;
	this.universe=options.universe || 0;
	this.ip=options.ip || 0; 
	this.oem=options.oem || 0;
	this.verbose=options.verbose || 0;
	
	if(this.verbose>0) {
		console.log("dmxnet sender started with params: "+JSON.stringify(options));
	}
	//init dmx-value array
	this.values=new Array()
	//fill all 512 channels
	for(var i = 0; i < 512; i++) {
		this.values[i]=0;
	}
	
	//ToDo: Send ArtPoll
}

sender.prototype.transmit = function () {
	if(ArtDmxSeq>=255) {
		ArtDmxSeq=1;
	}
	var udpPackage=jspack.Pack(ArtDmxHeaderFormat+ArtDmxPayloadFormat,["Art-Net",0,20480,14,ArtDmxSeq,0,,512]);
};
//ToDo: Receiver
//Export sender
module.exports = {sender};