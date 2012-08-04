Fireworks.ComboEmitter.Firepuff	= function(opts){
	// parse parameters
	opts		= {};
	this._webaudio	= opts.webaudio	|| new WebAudio();
	this._onReady	= opts.onReady	|| function(comboEmitter){};

	this._container	= new THREE.Object3D();
	this._emitter	= null;	
	
	this._emitterCtor();
	this._soundCtor();

	// update the emitter in rendering loop
	this._$loopCb	= world.loop().hook(this._loopCb.bind(this));
}

Fireworks.ComboEmitter.Firepuff.prototype._destroy	= function(){
	world.loop().unhook(this._$loopCb);
	this._emitterDtor();
	this._soundDtor();
}

// inherit from Fireworks.ComboEmitter
Fireworks.ComboEmitter.Firepuff.prototype		= new Fireworks.ComboEmitter();
Fireworks.ComboEmitter.Firepuff.prototype.constructor	= Fireworks.ComboEmitter.Firepuff;

//////////////////////////////////////////////////////////////////////////////////
//		Getter								//
//////////////////////////////////////////////////////////////////////////////////

Fireworks.ComboEmitter.Firepuff.prototype.shoot	= function(){
	var spawner	= this._emitter.effect('spawner').opts;
	spawner.start();
	spawner.reset();
	
	this._soundPlay();
};

/**
 * @return {boolean} true if it is ready, false otherwise
*/
Fireworks.ComboEmitter.Firepuff.prototype.isReady	= function(){
	// test the spritesheet has been loaded
	if( !this._emitter )	return false;
	// if all previous tests passed, it is ready
	return true;
};

Fireworks.ComboEmitter.Firepuff.prototype._notifyReadyIfPossible	= function(){
	if( this.isReady() === false )	return;
	this._onReady(this);
};

//////////////////////////////////////////////////////////////////////////////////
//		Getter								//
//////////////////////////////////////////////////////////////////////////////////

Fireworks.ComboEmitter.Firepuff.prototype.object3D	= function(){
	return this._container;
};

Fireworks.ComboEmitter.Firepuff.prototype.sound	= function(){
	return this._sound;
};

Fireworks.ComboEmitter.Firepuff.prototype.emitter	= function(){
	return this._emitter;
};

//////////////////////////////////////////////////////////////////////////////////
//		rendering loop function						//
//////////////////////////////////////////////////////////////////////////////////


Fireworks.ComboEmitter.Firepuff.prototype._loopCb	= function(delta, now){
	// if this.is_ready() is false, return now
	if( this.isReady() === false ) return;
	// render this._emitter
	this._emitter.update(delta).render();
}

//////////////////////////////////////////////////////////////////////////////////
//		Flame jet emitter						//
//////////////////////////////////////////////////////////////////////////////////

/**
 * Create the flame jet
*/
Fireworks.ComboEmitter.Firepuff.prototype._emitterCtor	= function(){
	var container	= this._container;
	var baseUrl	= "vendor/fireworks.js/images/flame/"
	var urls	= [
		// baseUrl + "/flame00.png",
		// baseUrl + "/flame01.png",
		// baseUrl + "/flame02.png",
		baseUrl + "/flame03.png",
		baseUrl + "/flame04.png",
		baseUrl + "/flame05.png",
		baseUrl + "/flame06.png",
		baseUrl + "/flame07.png",
		baseUrl + "/flame08.png",
		baseUrl + "/flame09.png",
		baseUrl + "/flame10.png",
		baseUrl + "/flame11.png",
		baseUrl + "/flame12.png",
		baseUrl + "/flame13.png",
		baseUrl + "/flame14.png",
		baseUrl + "/flame15.png",
		baseUrl + "/flame16.png",
		baseUrl + "/flame17.png",
		baseUrl + "/flame18.png",
		baseUrl + "/flame19.png",
		baseUrl + "/flame20.png",
		baseUrl + "/flame21.png",
		baseUrl + "/flame22.png",
		baseUrl + "/flame23.png",
		baseUrl + "/flame24.png"
	];

	loadTremulousFlameParticule(urls, function(texture){
		//console.log("images", images)
		console.log("all images loaded");

		var emitter	= this._emitter = Fireworks.createEmitter({nParticles : 200})
			.bindTriggerDomEvents()
			.effectsStackBuilder()
				.spawnerOneShot(1)
				.position(Fireworks.createShapeSphere(0, 0, 0, 0.1))
				.velocity(Fireworks.createShapeSphere(0, 60, 0, 20), 30)
				.lifeTime(0.9)
				.friction(0.90)
				//.randomVelocityDrift(Fireworks.createVector(10,10,0))
				.createEffect('scale', {
						origin	: 1/10,
						factor	: 1.001
					}).onBirth(function(particle){
						var object3d	= particle.get('threejsObject3D').object3d;
						var scale	= this.opts.origin * container.scale.x;
							object3d.scale.set(scale, scale)
					}).onUpdate(function(particle, deltaTime){
						var object3d	= particle.get('threejsObject3D').object3d;
						object3d.scale.multiplyScalar(this.opts.factor);
					}).back()
				.createEffect('opacity', {
						gradient: Fireworks.createLinearGradient()
								.push(0.00, 0.00)
								.push(0.05, 1.00)
								.push(0.99, 1.00) 
								.push(1.00, 0.00)			
					}).onUpdate(function(particle){
						var object3d	= particle.get('threejsObject3D').object3d;
						var canonAge	= particle.get('lifeTime').normalizedAge();
						object3d.opacity= this.opts.gradient.get(canonAge)*0.9;
					}).back()
				.renderToThreejsObject3D({
					container	: container,
					create		: function(){
						var object3d	= new THREE.Sprite({
							//color			: 0xaa66ee,
							useScreenCoordinates	: false,
							map			: texture,
							//blending		: THREE.AdditiveBlending,
							transparent		: true
						});
	
						//object3d.opacity= 0.9; 
						object3d.uvScale.set(1, 1/urls.length)
						
						return object3d;
					}	
				})
				.createEffect("renderer")
					.onUpdate(function(particle, deltaTime){
						var object3d	= particle.get('threejsObject3D').object3d;
						var canonAge	= particle.get('lifeTime').normalizedAge();
						var imageIdx	= Math.floor(canonAge * (urls.length));
						var uvOffsetY	= imageIdx * 1/urls.length;
						object3d.uvOffset.set(0, uvOffsetY)
					}).back()

				.back()
			.start();

		// stop the spawner
		var spawner	= this._emitter.effect('spawner').opts;
		spawner.stop();

		// notify Ready if possible
		this._notifyReadyIfPossible();
	}.bind(this));


	//////////////////////////////////////////////////////////////////////////
	//		misc helpers						//
	//////////////////////////////////////////////////////////////////////////
	function loadTremulousFlameParticule(urls, onReady){
		// load all the images from urls
		tQuery.TextureUtils.loadImages(urls, function(images, urls){
			// build a tiled spreadsheet canvas with images
			var canvas	= tQuery.TextureUtils.buildTiledSpriteSheet({
				images	: images,
				spriteW	: images[0].width,
				spriteH	: images[0].height,
				nSpriteX: 1
			});
			// create the texture
			var texture	= new THREE.Texture( canvas );
			texture.needsUpdate = true;
			// generate Alpha as it got no alpha 
			tQuery.TextureUtils.generateAlphaFromLuminance(texture, 16, 4);
			// notify caller
			onReady(texture, urls)
		})
	}
}

Fireworks.ComboEmitter.Firepuff.prototype._emitterDtor	= function(){
}

//////////////////////////////////////////////////////////////////////////////////
//		sound								//
//////////////////////////////////////////////////////////////////////////////////

Fireworks.ComboEmitter.Firepuff.prototype._soundCtor	= function(){
	// generate the data with jsfx
	// tune your own [here](http://egonelbre.com/js/jsfx/)
	var lib		= ["saw",0.0000,0.4000,0.0000,0.2800,0.0000,0.2380,20.0000,837.0000,2400.0000,-0.7300,0.0000,0.0000,0.0100,0.0003,0.0000,0.0000,0.0000,0.3235,0.0100,0.0000,0.0000,0.0000,1.0000,0.0000,0.0000,0.0000,0.0000];	var params	= jsfxlib.arrayToParams(lib);
	var data	= jsfx.generate(params);
	// create and fill the buffer
	var buffer	= this._webaudio.context().createBuffer(1, data.length, 44100);
	var fArray	= buffer.getChannelData(0);
	for(var i = 0; i < fArray.length; i++){
		fArray[i]	= data[i];
	}
	// create the sound
	var sound	= this._webaudio.createSound();
	this._sound	= sound;
	// set the buffer
	sound.buffer(buffer);
}
Fireworks.ComboEmitter.Firepuff.prototype._soundDtor	= function(){
	this._sound.destroy();
}

Fireworks.ComboEmitter.Firepuff.prototype._soundPlay	= function(){
	this._sound.play();
}