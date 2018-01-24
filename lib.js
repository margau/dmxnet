var dgram = require('dgram');
var jspack = require('jspack').jspack;

// ArtDMX Header for jspack
var ArtDmxHeaderFormat = '!7sBHHBBHH';
// ArtDMX Payload for jspack
var ArtDmxPayloadFormat = '512B';
//ArtDMX Sequence Counter
var ArtDmxSeq=1;

//dmxnet constructor
function dmxnet(options) {
	this.verbose=options.verbose || 0;
	this.oem=options.oem || 0;
    if(this.verbose>0) {
        console.log("dmxnet started with options "+JSON.stringify(options));
    }
    //ToDo: Register Sender and Receiver    
    //ToDo: Send ArtPoll
    return this;
}
//get a new sender object
dmxnet.prototype.newSender=function(options) {
    return new sender(options,this);
}

//define sender with user options and inherited parent object
sender=function (options,parent){
    //save parent object
    this.parent=parent;
    //set options
	var options = options || {};
	this.net=options.net || 0;
	this.subnet=options.subnet || 0;
	this.universe=options.universe || 0;
	this.ip=options.ip || "255.255.255.255";
    this.port=options.port || 6545; 
    this.verbose=this.parent.verbose;
	
	if(this.verbose>0) {
		console.log("new dmxnet sender started with params: "+JSON.stringify(options));
	}
	//init dmx-value array
	this.values=new Array()
	//fill all 512 channels
	for(var i = 0; i < 512; i++) {
		this.values[i]=0;
	}
	//ToDo: Build Subnet/Universe/Net Int16

    //Transmit first Frame
	this.transmit();
    
    //Workaround for this-Contect inside setInterval
    var _this=this;
    //Send Frame all 1000ms even there is no channel change
    this.interval=setInterval(function() {
       _this.transmit();
    },1000);
}
//Transmit function
sender.prototype.transmit = function () {
	if(ArtDmxSeq>=255) {
		ArtDmxSeq=1;
	}
	//Build Package: ID Int8[8], OpCode Int16, ProtVer Int16, Sequence Int8, PhysicalPort Int8, SubnetUniverseNet Int16, Length Int16 
	var udpPackage=jspack.Pack(ArtDmxHeaderFormat+ArtDmxPayloadFormat,["Art-Net",0,20480,14,ArtDmxSeq,0,0,512]);
    //ToDo: Finish Build Package    
    //ToDo: Send UDP

    if(this.verbose>1) {
        console.log("Transmit");
    }
    if(this.verbose>2) {
        console.log(udpPackage);
    }
};

//ToDo: Receiver
//Export dmxnet
module.exports = {dmxnet};
