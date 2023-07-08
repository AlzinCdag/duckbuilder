									const vsSourceColor = `
									    attribute vec4 aVertexPosition;
											attribute vec4 aVertexColor;
											attribute vec3 aVertexNormal;

									    uniform mat4 uModelViewMatrix;
									    uniform mat4 uProjectionMatrix;
											uniform mat4 uNormalMatrix;

											varying lowp vec4 vColor;
											varying highp vec3 vLighting;

									    void main() {
									      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
												vColor = aVertexColor;

												highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
									    }
									  `;

										const vsSourceTex = `
						    attribute vec4 aVertexPosition;
						    attribute vec2 aTextureCoord;
								attribute vec3 aVertexNormal;

						    uniform mat4 uModelViewMatrix;
						    uniform mat4 uProjectionMatrix;
								uniform mat4 uNormalMatrix;

						    varying highp vec2 vTextureCoord;
								varying highp vec3 vLighting;

						    void main(void) {
						      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
						      vTextureCoord = aTextureCoord;

									highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      						highp vec3 directionalLightColor = vec3(1, 1, 1);
      						highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      						highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      						highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      						vLighting = ambientLight + (directionalLightColor * directional);
						    }
						  `;

							const vsSourceWireframe = `
							attribute vec4 aVertexPosition;
							attribute vec4 aVertexColor;
							attribute vec3 aVertexNormal;

							uniform mat4 uModelViewMatrix;
							uniform mat4 uProjectionMatrix;
							uniform mat4 uNormalMatrix;
							uniform lowp float time;
							uniform lowp float tInitial;

							varying lowp vec4 vColor;
							varying highp vec3 vLighting;

							lowp float lerp = time;

							void main() {
								lowp float lerp1 = lerp;
								lowp float lerp2 = lerp-1.0;
								lowp float lerp3 = lerp-2.0;

								if (lerp <0.0) {
									lerp1 = 0.0;
								}
								if (lerp >1.0) {
									lerp1 = 1.0;
								}

								if (lerp >2.0) {
									lerp2 = 1.0;
								}
								if (lerp <1.0) {
									lerp2 = 0.0;
								}

								if (lerp >3.0) {
									lerp3 = 1.0;
								}
								if (lerp <2.0) {
									lerp3 = 0.0;
								}

								lowp float size1 = mix(3.14,4.7,lerp1);
								lowp float size2 = mix(3.14,4.7,lerp2);
								lowp float size3 = 1.0-mix(0.2,0.9,lerp3);

								/*
								mat4 transform = mat4(
									 cos(size1),-1.0*sin(size1),0,0,
									sin(size1),cos(size1),0,0,
									0,0,1,0,
									0,0,0,1
								);
								*/

								mat4 transform = mat4(
									 1,0,0,0,
									0,1,0,0,
									0,0,1,0,
									0,0,0,1
								);

								gl_Position = uProjectionMatrix * uModelViewMatrix *transform* aVertexPosition;
								vColor = aVertexColor;

								highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
							highp vec3 directionalLightColor = vec3(1, 1, 1);
							highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

							highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

							highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
							vLighting = ambientLight + (directionalLightColor * directional);
							}
								`;

										const fsSourceColor = `
										varying lowp vec4 vColor;
										varying highp vec3 vLighting;
						    void main() {
						      gl_FragColor = vec4(vColor.rgb*vLighting,vColor.a);
						    }
						  `;

							const fsSourceWireframe = `
							varying lowp vec4 vColor;
							varying highp vec3 vLighting;
					void main() {
						gl_FragColor = vec4(vColor.rgb*vLighting,vColor.a);
					}
				`;


							const fsSourceTex = `
						    varying highp vec2 vTextureCoord;
								varying highp vec3 vLighting;

						    uniform sampler2D uSampler;

						    void main(void) {
						      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
									gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
						    }
						  `;

							const pointsInGridArray = 792;

						let sceneRotX = 0;
						let sceneRotY = 0;
						let sceneRotZ = 0;

						const sceneCanvas = document.getElementById('glcanvas');

						//https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event
						var mouseIsDown = false;

						window.addEventListener('mousemove',(event)=>{

							if (mouseIsDown) {
							sceneRotY += 0.01*event.movementX;
							sceneRotX += 0.01*event.movementY;
						}

						});

						let initialTime= Date.now();

						window.addEventListener('mousedown',(event)=>{mouseIsDown=true;});
						window.addEventListener('mouseup',(event)=>{mouseIsDown=false;});

						window.addEventListener('keydown',(event)=>{
							if (event.key== "T" || event.code == "t") {
								initialTime = Date.now();
							}

						});


						class CdagScene {
							constructor(gl) {
								this.gl = gl;
								this.listOfCubeTypes = [];
								this.listOfCubesInScene = [];

								this.shaderProgramTex = initShaderProgram(this.gl, vsSourceTex, fsSourceTex);
								this.programInfoTex = {
						  program: this.shaderProgramTex,
						  attribLocations: {
						    vertexPosition: this.gl.getAttribLocation(this.shaderProgramTex, "aVertexPosition"),
								vertexNormal: this.gl.getAttribLocation(this.shaderProgramTex, "aVertexNormal"),
								//vertexColor: this.gl.getAttribLocation(this.shaderProgram,"aVertexColor"),
								 textureCoord: this.gl.getAttribLocation(this.shaderProgramTex, "aTextureCoord"),
						  },
						  uniformLocations: {
						    projectionMatrix: this.gl.getUniformLocation(this.shaderProgramTex, "uProjectionMatrix"),
						    modelViewMatrix: this.gl.getUniformLocation(this.shaderProgramTex, "uModelViewMatrix"),
								normalMatrix: this.gl.getUniformLocation(this.shaderProgramTex, "uNormalMatrix"),
								 uSampler: this.gl.getUniformLocation(this.shaderProgramTex, "uSampler"),//added with texture; disable when just color?
						  },
						};

					this.buffers = initBuffers(gl,[[1.0,0.0,0.0,1.0],[0.0,1.0,0.0,1.0],[0.0,0.0,1.0,1.0],[0.0,1.0,1.0,1.0],[1.0,1.0,0.0,1.0],[1.0,1.0,1.0,1.0]]);
							}


							initializeTypeOfCube(typeName,buffersObject,programInfoObject,textureObject) {
								
								
								const cubeType = {
									name: typeName,
									buffers: buffersObject,
									programInfo: programInfoObject,
									texture: textureObject,
								};
								this.listOfCubeTypes.push([typeName,cubeType]);
							}
							addCubeToScene(typeName,id,xCoord,yCoord,zCoord) {
								const type = this.listOfCubeTypes.find(element=>element[0] == typeName);

								//if (type != undefined)
								this.listOfCubesInScene.push([id,()=>{drawOpaqueCube(this.gl, type[1].programInfo, type[1].buffers, sceneRotX,sceneRotY,sceneRotZ,type[1].texture,10.2,0.8,0.8,0.8,xCoord,yCoord,zCoord);}]);

								
							}

							addCubeToSceneSize(typeName,id,xCoord,yCoord,zCoord,size) {
								const type = this.listOfCubeTypes.find(element=>element[0] == typeName);

								//if (type != undefined)
								this.listOfCubesInScene.push([id,()=>{drawOpaqueCube(this.gl, type[1].programInfo, type[1].buffers, sceneRotX,sceneRotY,sceneRotZ,type[1].texture,10.2,size,size,size,xCoord,yCoord,zCoord);}]);
							}
								
						removeCubeFromScene(id) {
								let index = this.listOfCubesInScene.findIndex(element=>element[0] == id);

								if (index != -1)
								{this.listOfCubesInScene.splice(index,1);}

							}

							easyInitializeTextureCubeType(textureAddress, typeName) {
								

						const texture = loadTexture(this.gl, textureAddress);
						// Flip image pixels into the bottom-to-top order that WebGL expects.
						this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

						this.initializeTypeOfCube(typeName,this.buffers,this.programInfoTex,texture);
							}

							

							easyInitializeAnimation(spriteSheetAddress,typeName,widthOfEachElement,height,frameCount) {
														  const texture = this.gl.createTexture();
						  this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

						  // Because images have to be downloaded over the internet
						  // they might take a moment until they are ready.
						  // Until then put a single pixel in the texture so we can
						  // use it immediately. When the image has finished downloading
						  // we'll update the texture with the contents of the image.
						  const level = 0;
						  const internalFormat = this.gl.RGBA;
						  const widthPlaceholder = 1;
						  const heightPlaceholder = 1;
						  const border = 0;
						  const srcFormat = this.gl.RGBA;
						  const srcType = this.gl.UNSIGNED_BYTE;
						  const pixel = new Uint8Array([0, 255, 255, 255]); // opaque blue
						   this.gl.texImage2D(
						    this.gl.TEXTURE_2D,
						    level,
						    internalFormat,
						    widthPlaceholder,
						    heightPlaceholder,
						    border,
						    srcFormat,
						    srcType,
						    pixel
						  );

						  const image = new Image();
							//image.src = url;
						  image.onload = () => {
						    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
						    this.gl.texImage2D(
						      this.gl.TEXTURE_2D,
						      level,
						      internalFormat,
						      srcFormat,
						      srcType,
						      image
						    );
							  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

							  //const imageBitMap = createImageBitmap(image).then((imageBit)=>{this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, widthOfEachElement, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE,imageBit );});
								this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, widthOfEachElement, height, this.gl.RGBA, this.gl.BYTE,image );
						  }	
							image.src = spriteSheetAddress;	

							this.initializeTypeOfCube(typeName,this.buffers,this.programInfoTex,texture);
							}
							
						}

						


									//export 

									main();
									//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL
						function main() {
							initialTime= Date.now();
									const sceneCanvas = document.getElementById('glcanvas');
									document.getElementById("glcanvas").width=window.innerWidth;
									document.getElementById("glcanvas").height=window.innerHeight;
									const gl = sceneCanvas.getContext("webgl");
									if (gl === null) {
						    alert(
						      "Unable to initialize WebGL. Your browser or machine may not support it."
						    );
						    return;
						  }
							window.scene = new CdagScene(gl);
							let scene = window.scene;
						  // Set clear color to black, fully opaque
						  gl.clearColor(0.0, 0.0, 0.0, 1.0);
						  // Clear the color buffer with specified clear color
						  gl.clear(gl.COLOR_BUFFER_BIT);

							//https://xem.github.io/articles/webgl-guide-part-2.html#1a
							gl.enable(gl.BLEND);
							gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

							const shaderProgramTex = initShaderProgram(gl, vsSourceTex, fsSourceTex);
							const shaderProgramColor = initShaderProgram(gl, vsSourceColor, fsSourceColor);
							const shaderProgramWireframe = initShaderProgram(gl, vsSourceWireframe, fsSourceWireframe);
							var timeLocation = gl.getUniformLocation(shaderProgramWireframe, "time");
							var initialTimeLocation = gl.getUniformLocation(shaderProgramWireframe,"tInitial");


							const programInfoTex = {
						  program: shaderProgramTex,
						  attribLocations: {
						    vertexPosition: gl.getAttribLocation(shaderProgramTex, "aVertexPosition"),
								vertexNormal: gl.getAttribLocation(shaderProgramTex, "aVertexNormal"),
								//vertexColor: gl.getAttribLocation(shaderProgram,"aVertexColor"),
								 textureCoord: gl.getAttribLocation(shaderProgramTex, "aTextureCoord"),
						  },
						  uniformLocations: {
						    projectionMatrix: gl.getUniformLocation(shaderProgramTex, "uProjectionMatrix"),
						    modelViewMatrix: gl.getUniformLocation(shaderProgramTex, "uModelViewMatrix"),
								normalMatrix: gl.getUniformLocation(shaderProgramTex, "uNormalMatrix"),
								 uSampler: gl.getUniformLocation(shaderProgramTex, "uSampler"),//added with texture; disable when just color?
						  },
						};

						const programInfoColor = {
						program: shaderProgramColor,
						attribLocations: {
							vertexPosition: gl.getAttribLocation(shaderProgramColor, "aVertexPosition"),
							vertexColor: gl.getAttribLocation(shaderProgramColor,"aVertexColor"),
							vertexNormal: gl.getAttribLocation(shaderProgramColor, "aVertexNormal"),
							 //textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
						},
						uniformLocations: {
							projectionMatrix: gl.getUniformLocation(shaderProgramColor, "uProjectionMatrix"),
							modelViewMatrix: gl.getUniformLocation(shaderProgramColor, "uModelViewMatrix"),
							normalMatrix: gl.getUniformLocation(shaderProgramColor, "uNormalMatrix"),
							 //uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),//added with texture; disable when just color?
						},
						};

						const programInfoWireframe = {
						program: shaderProgramWireframe,
						attribLocations: {
							vertexPosition: gl.getAttribLocation(shaderProgramWireframe, "aVertexPosition"),
							vertexColor: gl.getAttribLocation(shaderProgramWireframe,"aVertexColor"),
							 //textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
						},
						uniformLocations: {
							projectionMatrix: gl.getUniformLocation(shaderProgramWireframe, "uProjectionMatrix"),
							modelViewMatrix: gl.getUniformLocation(shaderProgramWireframe, "uModelViewMatrix"),
							time: gl.getUniformLocation(shaderProgramWireframe, "time"),
							initialTime: gl.getUniformLocation(shaderProgramWireframe, "tInitial"),
							 //uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),//added with texture; disable when just color?
						},
						};

						const buffers = initBuffers(gl,[[1.0,0.0,0.0,1.0],[0.0,1.0,0.0,1.0],[0.0,0.0,1.0,1.0],[0.0,1.0,1.0,1.0],[1.0,1.0,0.0,1.0],[1.0,1.0,1.0,1.0]]);
						//const wireframeBuffers = initBuffers(gl,[[0.5,0.5,0.5,1.0],[0.5,0.5,0.5,1.0],[0.5,0.5,0.5,1.0],[0.5,0.5,0.5,1.0],[0.5,0.5,0.5,1.0],[0.5,0.5,0.5,1.0]])
						const wireframeBuffers = initBufferGrid(gl);

						// Load texture
						const texture = loadTexture(gl, "AlznCdaglogo.png");
						// Flip image pixels into the bottom-to-top order that WebGL expects.
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

						let then = 0;
						let deltaT = 0;
						//scene.initializeTypeOfCube("testCube",buffers,programInfoTex,texture);
						scene.easyInitializeTextureCubeType("bluePattern.png","testCube");
							scene.easyInitializeAnimation("BirdSprite.png","BirdTestCube",643,768,16);
							scene.easyInitializeTextureCubeType("missTex.png","missileCube");
						scene.addCubeToScene("testCube","firstCube",-9,9,9);
							scene.addCubeToSceneSize("missileCube","missile1",-7,5,9,0.7);
							scene.addCubeToSceneSize("missileCube","missile2",-6,5,9,0.5);
							scene.addCubeToSceneSize("missileCube","missile3",-5,5,9,0.3);
							scene.addCubeToSceneSize("BirdTestCube","bird1",9,9,9,0.9);
						//scene.removeCubeFromScene("firstCube");

						// Draw the scene repeatedly
						function render(now) {
						  now *= 0.001; // convert to seconds
							deltaT = then-now;
							//sceneRotZ += deltaT;
							//gl.clearDepth(1.0);
							gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
							for (let i = 0; i < scene.listOfCubesInScene.length; i++)
							{
								scene.listOfCubesInScene[i][1]();
							}

							//cursors
							let cursorX = -9;
							let cursorY = -9;
							let cursorZ = 9;
							drawOpaqueCube(gl,programInfoColor,buffers,sceneRotX,sceneRotY,sceneRotZ,null,10.2, 10.0,0.25,0.25,0,cursorY,cursorZ);
							drawOpaqueCube(gl,programInfoColor,buffers,sceneRotX,sceneRotY,sceneRotZ,null,10.2, 0.25,10.0,0.25,cursorX,0,cursorZ);
							drawOpaqueCube(gl,programInfoColor,buffers,sceneRotX,sceneRotY,sceneRotZ,null,10.2, 0.25,0.25,10.0,cursorX,cursorY,0);
							
							
							drawOpaqueCube(gl, programInfoTex, buffers,sceneRotX,sceneRotY,sceneRotZ, texture, 10.2,0.8,0.8,0.8,2,2,2);
							//drawTransparentObjects(gl, programInfoWireframe, wireframeBuffers, sceneRotX,sceneRotY,sceneRotZ,null,10.2);
							drawGrid(gl,programInfoWireframe,wireframeBuffers,sceneRotX,sceneRotY,sceneRotZ,null,10.2,now,shaderProgramWireframe);
							then = now;



						  requestAnimationFrame(render);
						}
						requestAnimationFrame(render);
						}

						function getSceneRot() {
							return [sceneRotX,sceneRotY,sceneRotZ];
						}


						function initShaderProgram(gl, vsSource, fsSource) {
						  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
						  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

						  // Create the shader program

						  const shaderProgram = gl.createProgram();
						  gl.attachShader(shaderProgram, vertexShader);
						  gl.attachShader(shaderProgram, fragmentShader);
						  gl.linkProgram(shaderProgram);

							return shaderProgram;
						}

						//
						// creates a shader of the given type, uploads the source and
						// compiles it.
						//
						function loadShader(gl, type, source) {
						  const shader = gl.createShader(type);

						  // Send the source to the shader object

						  gl.shaderSource(shader, source);

						  // Compile the shader program

						  gl.compileShader(shader);

						  // See if it compiled successfully
						  return shader;
						}

						function initBuffers(gl,colorsForBuffer) {
						  const positionBuffer = initPositionBuffer(gl);

						//replace color or texture
							const colorBuffer = initColorBuffer(gl, colorsForBuffer);
							const textureBuffer = initTextureBuffer(gl);

							const indexBuffer = initIndexBuffer(gl);
							const normalBuffer = initNormalBuffer(gl);

						return {
						  position: positionBuffer,
						  color: colorBuffer,
							normal: normalBuffer,
						  indices: indexBuffer,
							textureCoord: textureBuffer,

						};
						}

						function initBufferGrid(gl) {
						  const positionBuffer = initPositionBufferGrid(gl);

						//replace color or texture
							const colorBuffer = initColorBufferGrid(gl);
							//const textureBuffer = initTextureBuffer(gl);

							const indexBuffer = initIndexBufferGrid(gl);

						return {
						  position: positionBuffer,
						  color: colorBuffer,
						  indices: indexBuffer,
						};
						//textureCoord: textureBuffer,
						}


						function initPositionBuffer(gl) {
						  // Create a buffer for the square's positions.
						  const positionBuffer = gl.createBuffer();

						  // Select the positionBuffer as the one to apply buffer
						  // operations to from here out.
						  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

						  // Now create an array of positions for the square.
							const positions = [
						  // Front face
						  -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

						  // Back face
						  -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

						  // Top face
						  -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

						  // Bottom face
						  -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

						  // Right face
						  1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

						  // Left face
						  -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
						];

						  // Now pass the list of positions into WebGL to build the
						  // shape. We do this by creating a Float32Array from the
						  // JavaScript array, then use it to fill the current buffer.
						  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

						  return positionBuffer;
						}


//const pointsInGridArray = 320;
						function initPositionBufferGrid(gl) {
						  // Create a buffer for the square's positions.
						  const positionBuffer = gl.createBuffer();

						  // Select the positionBuffer as the one to apply buffer
						  // operations to from here out.
						  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

						  // Now create an array of positions for the square.
							var positions = [];

							for (let i = -5; i<=5; i++) {
								positions.push(i/5,-1,-1);
								positions.push(i/5,1,-1);

								positions.push(i/5,1,-1);
								positions.push(i/5,1,1);

								positions.push(i/5,1,1);
								positions.push(i/5,-1,1);

								positions.push(i/5,-1,1);
								positions.push(i/5,-1,-1);



								positions.push(-1,i/5,-1);
								positions.push(1,i/5,-1);

								positions.push(1,i/5,-1);
								positions.push(1,i/5,1);

								positions.push(1,i/5,1);
								positions.push(-1,i/5,1);

								positions.push(-1,i/5,1);
								positions.push(-1,i/5,-1);



								positions.push(-1,-1,i/5);
								positions.push(1,-1,i/5);

								positions.push(1,-1,i/5);
								positions.push(1,1,i/5);

								positions.push(1,1,i/5);
								positions.push(-1,1,i/5);

								positions.push(-1,1,i/5);
								positions.push(-1,-1,i/5);


							};


							//document.getElementById("yourShips").innerHTML += positions.length;

						  // Now pass the list of positions into WebGL to build the
						  // shape. We do this by creating a Float32Array from the
						  // JavaScript array, then use it to fill the current buffer.
						  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

						  return positionBuffer;
						}

						function initColorBuffer(gl,faceColors) {
						// Convert the array of colors into a table for all the vertices.

						var colors = [];

						for (var j = 0; j < faceColors.length; ++j) {
						  const c = faceColors[j];
						  // Repeat each color four times for the four vertices of the face
						  colors = colors.concat(c, c, c, c);
						}

						  const colorBuffer = gl.createBuffer();
						  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
						  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

						  return colorBuffer;
						}

						function initColorBufferGrid(gl) {
						// Convert the array of colors into a table for all the vertices.

						var colors = [];
							const c = [0.5,0.5,0.5,1.0];
						for (var j = 0; j < pointsInGridArray/3; j++) {
						  // Repeat each color four times for the four vertices of the face
						  colors = colors.concat(c);
						}

						  const colorBuffer = gl.createBuffer();
						  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
						  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

						  return colorBuffer;
						}

						function initIndexBuffer(gl) {
						  const indexBuffer = gl.createBuffer();
						  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

						  // This array defines each face as two triangles, using the
						  // indices into the vertex array to specify each triangle's
						  // position.

						  const indices = [
						    0,
						    1,
						    2,
						    0,
						    2,
						    3, // front
						    4,
						    5,
						    6,
						    4,
						    6,
						    7, // back
						    8,
						    9,
						    10,
						    8,
						    10,
						    11, // top
						    12,
						    13,
						    14,
						    12,
						    14,
						    15, // bottom
						    16,
						    17,
						    18,
						    16,
						    18,
						    19, // right
						    20,
						    21,
						    22,
						    20,
						    22,
						    23, // left
						  ];

						  // Now send the element array to GL

						  gl.bufferData(
						    gl.ELEMENT_ARRAY_BUFFER,
						    new Uint16Array(indices),
						    gl.STATIC_DRAW
						  );

						  return indexBuffer;
						}


						function initIndexBufferGrid(gl) {
							const indexBuffer = gl.createBuffer();
							gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

							// This array defines each face as two triangles, using the
							// indices into the vertex array to specify each triangle's
							// position.

							const indices = [];
							for (let i = 0; i<pointsInGridArray/3;i++) {
								indices.push(i);
							}

							// Now send the element array to GL

							gl.bufferData(
								gl.ELEMENT_ARRAY_BUFFER,
								new Uint16Array(indices),
								gl.STATIC_DRAW
							);

							return indexBuffer;
						}

						function initTextureBuffer(gl) {
						  const textureCoordBuffer = gl.createBuffer();
						  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

						  const textureCoordinates = [
						    // Front
						    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
						    // Back
						    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
						    // Top
						    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
						    // Bottom
						    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
						    // Right
						    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
						    // Left
						    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
						  ];

						  gl.bufferData(
						    gl.ARRAY_BUFFER,
						    new Float32Array(textureCoordinates),
						    gl.STATIC_DRAW
						  );

						  return textureCoordBuffer;
						}


	function initNormalBuffer(gl) {
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  const vertexNormals = [
    // Front
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

    // Top
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

    // Bottom
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

    // Right
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

    // Left
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
  ];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertexNormals),
    gl.STATIC_DRAW
  );

  return normalBuffer;
}


						// Tell WebGL how to pull out the colors from the color buffer
						// into the vertexColor attribute.
						function setColorAttribute(gl, buffers, programInfo) {
						  const numComponents = 4;
						  const type = gl.FLOAT;
						  const normalize = false;
						  const stride = 0;
						  const offset = 0;
						  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
						  gl.vertexAttribPointer(
						    programInfo.attribLocations.vertexColor,
						    numComponents,
						    type,
						    normalize,
						    stride,
						    offset
						  );
						  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
						}

							function drawTransparentObjects(gl, programInfo, buffers, rotX,rotY,rotZ, texture,projectionScale) {

								//gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
								//gl.clearDepth(1.0); // Clear everything
								//gl.disable(gl.DEPTH_TEST); // Enable depth testing
								gl.depthFunc(gl.LEQUAL); // Near things obscure far things
								gl.enable(gl.CULL_FACE);
								gl.cullFace(gl.FRONT);

								// Clear the canvas before we start drawing on it.

								//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

								const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
								const zNear = -10;
								const zFar = 100.0;
								const xShift = -0.0;
								const yShift = 0.0;
								const zShift = -5.0;
								const xScale =10;
								const yScale =10;
								const zScale = 10;
								const projectionMatrix = createPerspectiveProjectionMatrix(-projectionScale,projectionScale,-projectionScale,projectionScale,zNear,zFar,aspect);
							//document.getElementById('yourShips').innerHTML += projectionMatrix;
								// Set the drawing position to the "identity" point, which is
								// the center of the scene.
								var modelViewMatrix = createTranslationMatrix(-0.0, 0.0, -2.0);
							modelViewMatrix = modelViewMatrix = createTransformationMatrix(xShift,yShift,zShift,xScale,yScale,zScale,rotX,rotY,rotZ,0,0,0);
								// Now move the drawing position a bit to where we want to
								// start drawing the square.




								// Tell WebGL how to pull out the positions from the position
								// buffer into the vertexPosition attribute.
								setPositionAttribute(gl, buffers, programInfo);

							if (texture == null)	{
								setColorAttribute(gl, buffers, programInfo);
							}
							else {
								setTextureAttribute(gl, buffers, programInfo);
							}
							setNormalAttribute(gl, buffers, programInfo);
								// Tell WebGL which indices to use to index the vertices
							gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

								// Tell WebGL to use our program when drawing
								gl.useProgram(programInfo.program);

								// Set the shader uniforms

								gl.uniformMatrix4fv(
									programInfo.uniformLocations.projectionMatrix,
									false,
									convert4dMatrixToColumnMajorOrder(projectionMatrix)
								);

							//	for (let i = 0; i < 10; i++) {
							//		for (let j = 0; j<10; j++) {
							//			for (let k = 0; k<10; k++) {
								gl.uniformMatrix4fv(
									programInfo.uniformLocations.modelViewMatrix,
									false,
									convert4dMatrixToColumnMajorOrder(modelViewMatrix)
								);

								if (texture != null) {
									// Tell WebGL we want to affect texture unit 0
							gl.activeTexture(gl.TEXTURE0);

							// Bind the texture to texture unit 0
							gl.bindTexture(gl.TEXTURE_2D, texture);

							// Tell the shader we bound the texture to texture unit 0
							gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
								}

								{
									const vertexCount = 36;
									const type = gl.UNSIGNED_SHORT;
									const offset = 0;
									gl.cullFace(gl.FRONT);
									gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
									gl.cullFace(gl.BACK);
									gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
								}
							//}//for k
							//} // for j
							//}//for i
								gl.disable(gl.CULL_FACE);
						}



						function drawOpaqueCube(gl, programInfo, buffers, rotX,rotY,rotZ, texture, projectionScale,xScale,yScale,zScale,xShift,yShift,zShift) {
						  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
						  //gl.clearDepth(1.0); // Clear everything
						  gl.enable(gl.DEPTH_TEST); // Enable depth testing
						  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

						  // Clear the canvas before we start drawing on it.
//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
						  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
						  const zNear = -12;
						  const zFar = 100.0;
							//const xShift = -0.0;
							//const yShift = 0.0;
							//const zShift = -5.0;
							//const xScale =1;
							//const yScale =1;
							//const zScale = 1;
						  const projectionMatrix = createPerspectiveProjectionMatrix(-projectionScale,projectionScale,-projectionScale,projectionScale,zNear,zFar,aspect);
						//document.getElementById('yourShips').innerHTML += projectionMatrix;
						  // Set the drawing position to the "identity" point, which is
						  // the center of the scene.
						  //var modelViewMatrix = createTranslationMatrix(-0.0, 0.0, -2.0);
						var modelViewMatrix = createTransformationMatrix(xShift,yShift,zShift,xScale,yScale,zScale,rotX,rotY,rotZ,0,0,0);
						  // Now move the drawing position a bit to where we want to
						  // start drawing the square.




						  // Tell WebGL how to pull out the positions from the position
						  // buffer into the vertexPosition attribute.
						  setPositionAttribute(gl, buffers, programInfo);

						if (texture == null)	{
							setColorAttribute(gl, buffers, programInfo);
						}
						else {
							setTextureAttribute(gl, buffers, programInfo);
						}

						setNormalAttribute(gl, buffers, programInfo);

							// Tell WebGL which indices to use to index the vertices
						gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

						  // Tell WebGL to use our program when drawing
						  gl.useProgram(programInfo.program);

						  // Set the shader uniforms

						  gl.uniformMatrix4fv(
						    programInfo.uniformLocations.projectionMatrix,
						    false,
						    convert4dMatrixToColumnMajorOrder(projectionMatrix)
						  );

						//	for (let i = 0; i < 10; i++) {
						//		for (let j = 0; j<10; j++) {
						//			for (let k = 0; k<10; k++) {
						  gl.uniformMatrix4fv(
						    programInfo.uniformLocations.modelViewMatrix,
						    false,
						    convert4dMatrixToColumnMajorOrder(modelViewMatrix)
						  );

							const normalMatrix = transposeMatrix(invertMatrix(modelViewMatrix));

							gl.uniformMatrix4fv(
  							programInfo.uniformLocations.normalMatrix,
  							false,
  							convert4dMatrixToColumnMajorOrder(normalMatrix)
);


							if (texture != null) {
								// Tell WebGL we want to affect texture unit 0
						gl.activeTexture(gl.TEXTURE0);

						// Bind the texture to texture unit 0
						gl.bindTexture(gl.TEXTURE_2D, texture);

						// Tell the shader we bound the texture to texture unit 0
						gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
							}

							{
							  const vertexCount = 36;
							  const type = gl.UNSIGNED_SHORT;
							  const offset = 0;
							  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
							}
						//}//for k
						//} // for j
						//}//for i
						gl.disable(gl.CULL_FACE);
}

function drawGrid(gl, programInfo, buffers, rotX,rotY,rotZ, texture,projectionScale,now,shaderProgramWireframe) {

	gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
	//gl.clearDepth(1.0); // Clear everything
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things
	//gl.enable(gl.CULL_FACE);
	//gl.cullFace(gl.FRONT);

	// Clear the canvas before we start drawing on it.

	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = -10;
	const zFar = 100.0;
	const xShift = -0.0;
	const yShift = 0.0;
	const zShift = 0.0;
	const xScale =10;
	const yScale =10;
	const zScale = 10;
	const projectionMatrix = createPerspectiveProjectionMatrix(-projectionScale,projectionScale,-projectionScale,projectionScale,zNear,zFar,aspect);
//document.getElementById('yourShips').innerHTML += projectionMatrix;
	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	var modelViewMatrix = createTranslationMatrix(-0.0, 0.0, -2.0);
modelViewMatrix = modelViewMatrix = createTransformationMatrix(xShift,yShift,zShift,xScale,yScale,zScale,rotX,rotY,rotZ,0,0,0);
	// Now move the drawing position a bit to where we want to
	// start drawing the square.




	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	setPositionAttribute(gl, buffers, programInfo);

if (texture == null)	{
	setColorAttribute(gl, buffers, programInfo);
}
else {
	setTextureAttribute(gl, buffers, programInfo);
}

	// Tell WebGL which indices to use to index the vertices
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program);

	//gl.uniform1f(gl.getUniformLocation(programInfo.program, "time"), Date.now());
	gl.uniform1f( gl.getUniformLocation(programInfo.program,"tInitial"), initialTime);

	let lerp = (Date.now()-initialTime)/5000;
	gl.uniform1f(gl.getUniformLocation(programInfo.program, "time"), lerp);
	//document.getElementById("yourShips").innerHTML = lerp;

	// Set the shader uniforms

	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		convert4dMatrixToColumnMajorOrder(projectionMatrix)
	);

//	for (let i = 0; i < 10; i++) {
//		for (let j = 0; j<10; j++) {
//			for (let k = 0; k<10; k++) {
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		convert4dMatrixToColumnMajorOrder(modelViewMatrix)
	);

	if (texture != null) {
		// Tell WebGL we want to affect texture unit 0
gl.activeTexture(gl.TEXTURE0);

// Bind the texture to texture unit 0
gl.bindTexture(gl.TEXTURE_2D, texture);

// Tell the shader we bound the texture to texture unit 0
gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	}

	{
		const vertexCount = pointsInGridArray/3;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.cullFace(gl.FRONT);
		gl.drawElements(gl.LINES, vertexCount, type, offset);
		//gl.cullFace(gl.BACK);
		//gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
//}//for k
//} // for j
//}//for i
	gl.disable(gl.CULL_FACE);
}

						// tell webgl how to pull out the texture coordinates from buffer
						function setTextureAttribute(gl, buffers, programInfo) {
						  const num = 2; // every coordinate composed of 2 values
						  const type = gl.FLOAT; // the data in the buffer is 32-bit float
						  const normalize = false; // don't normalize
						  const stride = 0; // how many bytes to get from one set to the next
						  const offset = 0; // how many bytes inside the buffer to start from
						  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
						  gl.vertexAttribPointer(
						    programInfo.attribLocations.textureCoord,
						    num,
						    type,
						    normalize,
						    stride,
						    offset
						  );
						  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
						}

						// Tell WebGL how to pull out the normals from
// the normal buffer into the vertexNormal attribute.
function setNormalAttribute(gl, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexNormal,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}


						// Tell WebGL how to pull out the positions from the position
						// buffer into the vertexPosition attribute.
						function setPositionAttribute(gl, buffers, programInfo) {
						  const numComponents = 3; // pull out 3 values per iteration (x,y,z)
						  const type = gl.FLOAT; // the data in the buffer is 32bit floats
						  const normalize = false; // don't normalize
						  const stride = 0; // how many bytes to get from one set of values to the next
						  // 0 = use type and numComponents above
						  const offset = 0; // how many bytes inside the buffer to start from
						  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
						  gl.vertexAttribPointer(
						    programInfo.attribLocations.vertexPosition,
						    numComponents,
						    type,
						    normalize,
						    stride,
						    offset
						  );
						  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
						}


						//
						// Initialize a texture and load an image.
						// When the image finished loading copy it into the texture.
						//
						function loadTexture(gl, url) {
						  const texture = gl.createTexture();
						  gl.bindTexture(gl.TEXTURE_2D, texture);

						  // Because images have to be downloaded over the internet
						  // they might take a moment until they are ready.
						  // Until then put a single pixel in the texture so we can
						  // use it immediately. When the image has finished downloading
						  // we'll update the texture with the contents of the image.
						  const level = 0;
						  const internalFormat = gl.RGBA;
						  const width = 1;
						  const height = 1;
						  const border = 0;
						  const srcFormat = gl.RGBA;
						  const srcType = gl.UNSIGNED_BYTE;
						  const pixel = new Uint8Array([0, 255, 255, 255]); // opaque blue
						   gl.texImage2D(
						    gl.TEXTURE_2D,
						    level,
						    internalFormat,
						    width,
						    height,
						    border,
						    srcFormat,
						    srcType,
						    pixel
						  );

						  const image = new Image();
							//image.src = url;
						  image.onload = () => {
						    gl.bindTexture(gl.TEXTURE_2D, texture);
						    gl.texImage2D(
						      gl.TEXTURE_2D,
						      level,
						      internalFormat,
						      srcFormat,
						      srcType,
						      image
						    );

						    // WebGL1 has different requirements for power of 2 images
						    // vs. non power of 2 images so check if the image is a
						    // power of 2 in both dimensions.
						    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
						      // Yes, it's a power of 2. Generate mips.
						      gl.generateMipmap(gl.TEXTURE_2D);
						    } else {
						      // No, it's not a power of 2. Turn off mips and set
						      // wrapping to clamp to edge
						      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
						    }
						 };
							//
						  image.src = url;

						  return texture;
						}

						function isPowerOf2(value) {
						  return (value & (value - 1)) === 0;
						}


						//https://en.wikipedia.org/wiki/Orthographic_projection
						//https://ogldev.org/www/tutorial12/tutorial12.html

						function createOrthographicProjectionMatrix(left,right,bottom,top,near,far,aspectRatio) {
						return [
						[2/((right-left)*aspectRatio), 0,              0,              -(right+left)/(right-left)],
						[0,              2/(top-bottom), 0,              -(top+bottom)/(top-bottom)],
						[0,              0,              -2/(far-near),   -(far+near)/(far-near)],
						[0,              0,              0,                1]
						];
						}


						function createPerspectiveProjectionMatrix(left,right,bottom,top,near,far,aspectRatio) {
							return [
							[1/(aspectRatio)*near, 0,              0,              0],
							[0,              (near), 0,              0],
							[0,              0,              (near),  -1],
							[0,              0,              (near),                0]
							];
							}

						//http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/

						/**convert from model space to world space,
						 or from world space to camera space

						translation matrix*rotation matrix * scale matrix*/
						function createTransformationMatrix(xShift,yShift,zShift,xScale,yScale,zScale,xTheta,yTheta,zTheta,inModelXTheta,inModelYTheta,inModelZTheta) {
						return multiplyMatrices4d(createTranslationMatrix(-0,0,-20),multiplyMatrices4d(createRotationMatrix(xTheta,yTheta,zTheta),multiplyMatrices4d(createTranslationMatrix(xShift,yShift,zShift),multiplyMatrices4d(createRotationMatrix(inModelXTheta,inModelYTheta,inModelZTheta),createScaleMatrix(xScale,yScale,zScale)))));

						}

						function createScaleMatrix(xScale,yScale,zScale) {
							return [[xScale,0,0,0],[0,yScale,0,0],[0,0,zScale,0],[0,0,0,1]];
						}

						function createRotationMatrix(xTheta,yTheta,zTheta) {
							//https://en.wikipedia.org/wiki/Rotation_matrix, and the logic from http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/ involving translations and the 4d matrices
							let matX = [[1,     0,                 0,                  0],
							            [0,     Math.cos(xTheta), -1*Math.sin(xTheta), 0],
													[0,     Math.sin(xTheta),  Math.cos(xTheta),   0],
													[0,     0,                 0,                  1]
												];

						 let matY = [[Math.cos(yTheta),   0, Math.sin(yTheta),0],
						             [0,                  1, 0,               0],
											   [-1*Math.sin(yTheta),0, Math.cos(yTheta),0],
											   [0,                  0, 0,               1]];

						let matZ = [
												[Math.cos(zTheta),-1*Math.sin(zTheta),0,0],
												[Math.sin(zTheta),   Math.cos(zTheta),0,0],
												[0,0,1,0],
												[0,0,0,1]
						];

						return multiplyMatrices4d(matX,multiplyMatrices4d(matZ,matY));
						}

						function createTranslationMatrix(xShift,yShift,zShift) {

							return [
								[1,0,0,xShift],
								[0,1,0,yShift],
								[0,0,1,zShift],
								[0,0,0,1]
							];
						}

						function multiplyMatrixByVector4d(vector, matrix) {
							/*[ [a b c d]          [[q]         [[aq + br + cs + dt]
									[e f g h]     *     [r]  =       [eq + fr + gs + ht]
									[i j k l]           [s]          [iq + jr + ks + lt]
									[m n o p] ]         [t] ]        [mq + nr + os  + pt]]

							 */

							return [[matrix[0][0]*vector[0][0]+matrix[0][1]*vector[1][0]+matrix[0][2]*vector[2][0]+matrix[0][3]*vector[3][0]],
							        [matrix[1][0]*vector[0][0]+matrix[1][1]*vector[1][0]+matrix[1][2]*vector[2][0]+matrix[1][3]*vector[3][0]],
						          [matrix[2][0]*vector[0][0]+matrix[2][1]*vector[1][0]+matrix[2][2]*vector[2][0]+matrix[2][3]*vector[3][0]],
										  [matrix[3][0]*vector[0][0]+matrix[3][1]*vector[1][0]+matrix[3][2]*vector[2][0]+matrix[3][3]*vector[3][0]]]
						}

						function multiplyMatrices4d(m1,m2) {

							return [[m1[0][0]*m2[0][0]+m1[0][1]*m2[1][0]+m1[0][2]*m2[2][0]+m1[0][3]*m2[3][0], m1[0][0]*m2[0][1]+m1[0][1]*m2[1][1]+m1[0][2]*m2[2][1]+m1[0][3]*m2[3][1],m1[0][0]*m2[0][2]+m1[0][1]*m2[1][2]+m1[0][2]*m2[2][2]+m1[0][3]*m2[3][2],m1[0][0]*m2[0][3]+m1[0][1]*m2[1][3]+m1[0][2]*m2[2][3]+m1[0][3]*m2[3][3]],
							        [m1[1][0]*m2[0][0]+m1[1][1]*m2[1][0]+m1[1][2]*m2[2][0]+m1[1][3]*m2[3][0], m1[1][0]*m2[0][1]+m1[1][1]*m2[1][1]+m1[1][2]*m2[2][1]+m1[1][3]*m2[3][1],m1[1][0]*m2[0][2]+m1[1][1]*m2[1][2]+m1[1][2]*m2[2][2]+m1[1][3]*m2[3][2],m1[1][0]*m2[0][3]+m1[1][1]*m2[1][3]+m1[1][2]*m2[2][3]+m1[1][3]*m2[3][3]],
						          [m1[2][0]*m2[0][0]+m1[2][1]*m2[1][0]+m1[2][2]*m2[2][0]+m1[2][3]*m2[3][0], m1[2][0]*m2[0][1]+m1[2][1]*m2[1][1]+m1[2][2]*m2[2][1]+m1[2][3]*m2[3][1],m1[2][0]*m2[0][2]+m1[2][1]*m2[1][2]+m1[2][2]*m2[2][2]+m1[2][3]*m2[3][2],m1[2][0]*m2[0][3]+m1[2][1]*m2[1][3]+m1[2][2]*m2[2][3]+m1[2][3]*m2[3][3]],
										  [m1[3][0]*m2[0][0]+m1[3][1]*m2[1][0]+m1[3][2]*m2[2][0]+m1[3][3]*m2[3][0], m1[3][0]*m2[0][1]+m1[3][1]*m2[1][1]+m1[3][2]*m2[2][1]+m1[3][3]*m2[3][1],m1[3][0]*m2[0][2]+m1[3][1]*m2[1][2]+m1[3][2]*m2[2][2]+m1[3][3]*m2[3][2],m1[3][0]*m2[0][3]+m1[3][1]*m2[1][3]+m1[3][2]*m2[2][3]+m1[3][3]*m2[3][3]]
										];

						}

						function transposeMatrix(m) {
								return [
								[m[0][0],m[1][0],m[2][0],m[3][0]],
								[m[0][1],m[1][1],m[2][1],m[3][1]],
								[m[0][2],m[1][2],m[2][2],m[3][2]],
								[m[0][3],m[1][3],m[2][3],m[3][3]]
							]

						}

						function invertMatrix(m) { //https://en.wikipedia.org/wiki/Invertible_matrix
							//https://semath.info/src/inverse-cofactor-ex4.html
							let retVal = [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]];
							let adjugate = adjugateMatrix(m);
							//document.getElementById('yourShips').innerHTML += adjugate;
							let det = 1/(determinantMatrix4(m));
							for (let i = 0; i<4;i++) {
								for (let j = 0; j<4;j++){
									retVal[i][j] = det*adjugate[i][j];
								}
							}

							return retVal;

						}

						function adjugateMatrix(m) {//https://en.wikipedia.org/wiki/Adjugate_matrix
							//https://en.wikipedia.org/wiki/Laplace_expansion
							let cofactorMatrix  = [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]];
							for (let i = 0; i< 4; i++) {
									for (let j = 0; j<4; j++) {

										cofactorMatrix[i][j] =((-1)**(i+j))*determinantMatrix3(minorMatrix4(m,i,j));
									}
							}

							return transposeMatrix(cofactorMatrix);
						}

						function determinantMatrix3(m) {
							//https://en.wikipedia.org/wiki/Determinant
							return m[0][0]*m[1][1]*m[2][2]+m[0][1]*m[1][2]*m[2][0]+m[0][2]*m[1][0]*m[2][1]-m[0][2]*m[1][1]*m[2][0]-m[0][1]*m[1][0]*m[2][2]-m[0][0]*m[1][2]*m[2][1];
						}

						function determinantMatrix4(m) {
							//laplace expansion
							let retVal = 0;
							for (let i = 0; i< 4; i++) {
									for (let j = 0; j<4; j++) {

										retVal += ((-1)**(i+j))*m[i][j]*determinantMatrix3(minorMatrix4(m,i,j));
									}
							}
							return retVal;

						}

						function minorMatrix4(m, row,column) {
							const retVal = [];

							for (let i = 0; i< m.length; i++) {
								if (i != row) {
									let rowToPush = [];
									for (let j = 0; j<m[i].length; j++) {
										if (j != column)
											rowToPush.push(m[i][j]);
									}
									retVal.push(rowToPush);

								}//if

							}//for
							return retVal;
						}

						function convert4dMatrixToColumnMajorOrder(mat) {
						return [mat[0][0],mat[1][0],mat[2][0],mat[3][0],mat[0][1],mat[1][1],mat[2][1],mat[3][1],mat[0][2],mat[1][2],mat[2][2],mat[3][2],mat[0][3],mat[1][3],mat[2][3],mat[3][3]];

						}

						function createCube() {}

						function hideCube() {}

						function createWireCube() {}

						function hideWireCube() {}

						function rotateCamera() {}

						function createCubeWithImageTexture() {}
