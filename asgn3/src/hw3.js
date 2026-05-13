// gloabal vars
let canvas;
let gl;
let g_aspect = 1;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
var g_RotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).rotate(g_globalAngleY, 1, 0, 0);
var g_posMat = new Matrix4().translate(0.0, 0.0, 0.0);

let a_Position;
let a_Color;
let a_TexCoord;
let u_ColorPercent;
let u_GlobalMatrix;
let u_Sampler;
let u_ModelMatrix;

// Vertex shader program
var VSHADER_SOURCE =
  'precision mediump float;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec3 a_Color;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalMatrix;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec3 v_Color;\n' +
  'void main() {\n' +
  '  v_Color = a_Color;\n' +
  '  gl_Position = u_GlobalMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';


// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform float u_ColorPercent;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec3 v_Color;\n' +
  'void main() {\n' +
  '  vec4 texColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '  if(u_ColorPercent == 0.0) {gl_FragColor = texColor*(1.0 - u_ColorPercent); if(gl_FragColor.a < 0.5) discard;} \n' +
  '  else if(u_ColorPercent == 1.0) {gl_FragColor = vec4(v_Color, 1.0)*(1.0);} \n' +
  '  else {gl_FragColor = texColor*(1.0 - u_ColorPercent) + vec4(v_Color, 1.0)*(mod(u_ColorPercent, 1.0));}\n' +
  '}\n';

// Fragment shader program2
var FSHADER_SOURCE2 =
  'precision mediump float;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec3 v_Color;\n' +
  'void main() {\n' +
  '  vec4 texColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '  gl_FragColor = texColor;\n' +
  '}\n';

var vertexBuffer;
var vertexBuffer2;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  canvas2d = document.getElementById('2d');


  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  ctx = canvas2d.getContext("2d");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}
var identityM;
function connectVariablesToGLSL(fragsource) {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, fragsource)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_Color
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return;
  }

  // // Get the storage location of a_TexCoord
  a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return;
  }

  u_GlobalMatrix = gl.getUniformLocation(gl.program, 'u_GlobalMatrix');
  if (!u_GlobalMatrix) {
    console.log('Failed to get the storage location of u_GlobalMatrix');
    return;
  }

  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_ColorPercent = gl.getUniformLocation(gl.program, 'u_ColorPercent');
  if (!u_ColorPercent) {
    console.log('Failed to get the storage location of u_ColorPercent');
    return;
  }

  identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
var fpsText;
function addActionsForHtmlUI() {
  window.addEventListener('resize', resizeCanvas);

  //document.getElementById("angleSlide").addEventListener("mousemove", function() { g_globalAngleX = this.value;});
  //document.getElementById("changeShader").onclick = function() {connectVariablesToGLSL(FSHADER_SOURCE2);};

  fpsText = document.getElementById("FPS");

  initKeys();
  initMouse();
}

var textRect;
var textRect2;
let textBox;
function main() {
  // setup canvas and gl
  setupWebGL();
  // set up GLSL shader programs and variables
  connectVariablesToGLSL(FSHADER_SOURCE);

  addActionsForHtmlUI();

  // Create a buffer object
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  initObjectData();

  textBox = new TextBox(40, 50);
  textBox.nextText("Use WASD to move. QE, or drag mouse to look around. Space and shift to rise and fall. Z to hide message", "T");
  textBox.setVisible(true);

  resizeCanvas();
  requestAnimationFrame(tick);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  g_aspect = window.innerWidth / window.innerHeight;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
var g_lastSeconds = g_seconds;
let textCount = 0;
function tick() {
  g_lastSeconds = g_seconds;
  g_seconds = performance.now()/1000.0 - g_startTime;
  let delta = g_seconds - g_lastSeconds;
  textCount += delta;
  while(textCount > 0.02) {
    textBox.loadIn(delta);
    textCount -= 0.02;
  }

  handleInputs(delta);

  draw(delta);

  requestAnimationFrame(tick);
}

function handleInputs(delta) {
  if(keys["q"]) {
    g_globalAngleX -= 180 * delta;
  }
  if(keys["e"]) {
    g_globalAngleX += 180 * delta;
  }
  if(keys["z"]) {
    textBox.setVisible(false);
  }
  var mat;
  if(keys["w"]) {
    mat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).translate(0.0, 0.0, 1.0 * delta);
    g_posMat.translate(-mat.elements[12], 0, mat.elements[14]);
  }
  if(keys["a"]) {
    mat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).translate(-1.0 * delta, 0, 0);
    g_posMat.translate(-mat.elements[12], 0, mat.elements[14]);
  }
  if(keys["s"]) {
    mat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).translate(0, 0, -1.0 * delta);
    g_posMat.translate(-mat.elements[12], 0, mat.elements[14]);
  }
  if(keys["d"]) {
    mat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).translate(1.0 * delta, 0, 0);
    g_posMat.translate(-mat.elements[12], 0, mat.elements[14]);
  }
  if(keys[" "]) {
    mat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).translate(0, -1.0 * delta, 0);
    g_posMat.translate(0, mat.elements[13], 0);
  }
  if(keys["Shift"]) {
    mat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0).translate(0, 1.0 * delta, 0);
    g_posMat.translate(0, mat.elements[13], 0);
  }
}
function draw(delta) {
  fpsText.textContent = Math.round(1.0 / delta);

  g_RotMat = new Matrix4().rotate(g_globalAngleY, 1, 0, 0).rotate(g_globalAngleX, 0, 1, 0);
  var mat = new Matrix4().setFrustum(-0.5 * g_aspect, 0.5 * g_aspect, -0.5, 0.5, 0.25, 8).concat(g_RotMat);

  gl.uniformMatrix4fv(u_GlobalMatrix, false, mat.elements);

  gl.clearColor(0.0, 0.0, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // BG
  gl.disable(gl.DEPTH_TEST);
  gl.depthMask(true);
  var skyboxRotate = new Matrix4().setRotate(g_seconds*0.15 % 360.0, 1, 0, 0).rotate(g_seconds*0.23 % 360.0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, skyboxRotate.elements);
  skybox.forEach((rect) => {rect.render()})
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  sun.matrix.setRotate(50, 0, 1, 0).rotate(g_seconds*0.5 % 360.0, 1, 0, 0);
  sun.render();
  earth.matrix.setRotate(0, 1, 0, 0).rotate(g_seconds*0.8 % 360.0, 1, 0, 0);
  earth.render();
  jup.matrix.setRotate(30, 1, 0, 0).rotate(g_seconds*0.9 % 360.0, 0, 0, 1);
  jup.render();
  gl.clear(gl.DEPTH_BUFFER_BIT);

  var mat = new Matrix4().setFrustum(-0.5 * g_aspect, 0.5 * g_aspect, -0.5, 0.5, 0.25, 10).concat(g_RotMat).concat(g_posMat).translate(0, Math.sin(g_seconds*0.7) * 0.1, 0);
  gl.uniformMatrix4fv(u_GlobalMatrix, false, mat.elements);

  // MidGround
  gl.enable(gl.DEPTH_TEST);
  gl.depthMask(true);
  surface.render();
  geom[0].matrix.setRotate(g_seconds*5 % 360.0, 1, 0, 0);
  geom[1].matrix.setRotate(g_seconds*5 + 120.0 % 360.0, 1, 0, 0);
  geom[2].matrix.setRotate(g_seconds*5 + 240.0 % 360.0, 1, 0, 0);
  geom.forEach((rect) => {rect.render()});
  if(g_seconds % 1.0 < 0.5) {
    sno1.render();
  } else {
    sno2.render();
  }
  if(g_seconds % 1.0 < 0.5) {
    window1.render();
    window3.render();
  } else {
    window2.render();
    window4.render();
  }
  dish.forEach((rect) => {rect.render()});
  ship.forEach((rect) => {rect.render()});
  
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_GlobalMatrix, false, identityM.elements);
  // ForeGround
  gl.disable(gl.DEPTH_TEST);
  var mouse = new Matrix4().setTranslate((lastMouse[0]/window.innerWidth)*2 - 1.0, 1.0 - (lastMouse[1]/window.innerHeight)*2, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, mouse.elements);

  gl.depthMask(false);
  if(g_seconds % 0.4 < 0.2) {
    mouse1.render();
  } else {
    mouse2.render();
  }
  
  ctx.clearRect(0,0, canvas.width, canvas.height);
  textBox.draw();
}
let skybox = [];
let geom = [];
let dish = [];
let ship = [];
function initObjectData() {
  skybox[0] = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.15, '../resources/Star.png', vertexBuffer, 
    new Float32Array([
     2.25,  2.25,  2.25, 0.0, 1.0, 0.0, 0.0, 1.0, 
     2.25, -2.25,  2.25, 0.0, 0.0, 0.0, 0.0, 0.0,
     2.25,  2.25, -2.25, 1.0, 1.0, 0.0, 0.0, 0.0,
     2.25, -2.25, -2.25, 1.0, 0.0, 0.0, 0.0, 0.0]));
  skybox[1] = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.15, '../resources/Star.png', vertexBuffer, 
    new Float32Array([
    -2.25,  2.25, -2.25, 0.0, 1.0, 0.0, 0.0, 1.0, 
    -2.25, -2.25, -2.25, 0.0, 0.0, 0.0, 0.0, 1.0,
     2.25,  2.25, -2.25, 1.0, 1.0, 0.0, 0.0, 0.0,
     2.25, -2.25, -2.25, 1.0, 0.0, 0.0, 0.0, 0.0]));
  skybox[1].newTexture = false;
  skybox[2] = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.15, '../resources/Star.png', vertexBuffer, 
    new Float32Array([
    -2.25,  2.25, -2.25, 0.0, 1.0, 0.0, 0.0, 1.0, 
     2.25,  2.25, -2.25, 0.0, 0.0, 0.0, 0.0, 0.0,
    -2.25,  2.25,  2.25, 1.0, 1.0, 0.0, 0.0, 0.0,
     2.25,  2.25,  2.25, 1.0, 0.0, 0.0, 0.0, 1.0]));
  skybox[2].newTexture = false;
  skybox[3] = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.15, '../resources/Star.png', vertexBuffer, 
    new Float32Array([
    -2.25, -2.25, -2.25, 0.0, 1.0, 0.0, 0.0, 1.0, 
     2.25, -2.25, -2.25, 0.0, 0.0, 0.0, 0.0, 0.0,
    -2.25, -2.25,  2.25, 1.0, 1.0, 0.0, 0.0, 1.0,
     2.25, -2.25,  2.25, 1.0, 0.0, 0.0, 0.0, 0.0]));
  skybox[3].newTexture = false;
  skybox[4] = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.15, '../resources/Star.png', vertexBuffer, 
    new Float32Array([
    -2.25,  2.25,  2.25, 0.0, 1.0, 0.0, 0.0, 0.0, 
    -2.25, -2.25,  2.25, 0.0, 0.0, 0.0, 0.0, 1.0,
     2.25,  2.25,  2.25, 1.0, 1.0, 0.0, 0.0, 1.0,
     2.25, -2.25,  2.25, 1.0, 0.0, 0.0, 0.0, 0.0]));
  skybox[4].newTexture = false;
  skybox[5] = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.15, '../resources/Star.png', vertexBuffer, 
    new Float32Array([
    -2.25,  2.25,  2.25, 0.0, 1.0, 0.0, 0.0, 0.0, 
    -2.25, -2.25,  2.25, 0.0, 0.0, 0.0, 0.0, 1.0,
    -2.25,  2.25, -2.25, 1.0, 1.0, 0.0, 0.0, 1.0,
    -2.25, -2.25, -2.25, 1.0, 0.0, 0.0, 0.0, 1.0]));
  skybox[5].newTexture = false;

  /*textRect = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.9, '../resources/ChileClose.png', vertexBuffer, 
    new Float32Array([
    -0.8,  0.8, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 
    -0.8, -0.8, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
     0.8,  0.8, -1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
     0.8, -0.8, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0]));
  textRect2 = new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.2, '../resources/SnowClose.png', vertexBuffer, 
    new Float32Array([
     1.0,  0.8, 0.8, 0.0, 1.0, 0.0, 0.0, 1.0, 
     1.0, -0.8, 0.8, 0.0, 0.0, 0.0, 0.0, 1.0,
     1.0,  0.8, -0.8, 1.0, 1.0, 0.0, 1.0, 1.0,
     1.0, -0.8, -0.8, 1.0, 0.0, 0.0, 0.0, 1.0]));*/
     
  cube1 = new TextureCube(gl, u_Sampler, u_ColorPercent, 0.9, '../resources/SnowClose.png', vertexBuffer, [3,0,0], [0, -0.5, 0], [0.5, 0.5, 0.5], [0, 0, 1.0]);
  sun = new TextureSphere(gl, u_Sampler, u_ColorPercent, 0.6, '../resources/Sun.png', vertexBuffer, [0,0,0], [0.01, 2.0, 2.4], [0.25, 0.25, 0.25], 5, 5, [1.0, 1.0, 1.0], false);
  jup = new TextureSphere(gl, u_Sampler, u_ColorPercent, 0.2, '../resources/Sun.png', vertexBuffer, [0,0,0], [-1.0, -2.0, 0.0], [0.2, 0.2, 0.2], 5, 5, [2.0, 1.0, 1.0], false);
  earth = new TextureSphere(gl, u_Sampler, u_ColorPercent, 0.5, '../resources/Earth.png', vertexBuffer, [0,0,0], [0.01, 1.0, -1.4], [0.15, 0.15, 0.15], 5, 5, [0, 0, 0.5], false);
  surface = new TextureSurface(gl, u_Sampler, u_ColorPercent, 0.3, '../resources/moon.png', vertexBuffer, [0.0,-0.9,0], [19.00, 0.20, 19.00], 13, 13, [0, 0, 0.5]);
  
  geom.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 0.8, '../resources/SnowClose.png', vertexBuffer, [3,0,0], [0, -2.5, 0], [0.5, 0.5, 0.5], [0, 0, 1.0]));
  geom.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 0.8, '../resources/SnowClose.png', vertexBuffer, [3,0,0], [0, -2.5, 0], [0.5, 0.5, 0.5], [0, 0, 1.0]));
  geom.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 0.8, '../resources/SnowClose.png', vertexBuffer, [3,0,0], [0, -2.5, 0], [0.5, 0.5, 0.5], [0, 0, 1.0]));
  sno1 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Sno1.png', vertexBuffer, 
    new Float32Array([
     3.0,  0.8, 0.8, 0.0, 1.0, 0.0, 0.0, 1.0, 
     3.0, -0.8, 0.8, 0.0, 0.0, 0.0, 0.0, 1.0,
     3.0,  0.8, -0.8, 1.0, 1.0, 0.0, 1.0, 1.0,
     3.0, -0.8, -0.8, 1.0, 0.0, 0.0, 0.0, 1.0])));
  sno2 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Sno2.png', vertexBuffer, 
    new Float32Array([
     3.0,  0.8, 0.8, 0.0, 1.0, 0.0, 0.0, 1.0, 
     3.0, -0.8, 0.8, 0.0, 0.0, 0.0, 0.0, 1.0,
     3.0,  0.8, -0.8, 1.0, 1.0, 0.0, 1.0, 1.0,
     3.0, -0.8, -0.8, 1.0, 0.0, 0.0, 0.0, 1.0])));
  sno1.transparent = true;
  sno2.transparent = true;
  mouse1 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Mouse1.png', vertexBuffer, 
    new Float32Array([
    -0.05,  0.05, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 
    -0.05, -0.15, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
     0.15,  0.05, -1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
     0.15, -0.15, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0])));
  mouse2 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Mouse2.png', vertexBuffer, 
    new Float32Array([
    -0.05,  0.05, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 
    -0.05, -0.15, -1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
     0.15,  0.05, -1.0, 1.0, 1.0, 0.0, 1.0, 1.0,
     0.15, -0.15, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0])));
  mouse1.transparent = true;
  mouse2.transparent = true;

  dish.push(new TextureSphere(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-6,4,-6], [0.0, 0.0, 2.0], [4.0, 4.0, 2.0], 5, 5, [0.3, 0.3, 0.5], true));
  dish.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-6,4,-6], [0.0, 0.0, 8.0], [0.1, 0.1, 8.0], [0.0, 0.0, 0.0]));
  dish.push(new TextureSphere(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-6,4,-6], [0.0, 0.0, -0.6], [1.0, 1.0, 1.0], 6, 6, [0.8, 0.8, 0.0], false));
  dish[0].matrix.rotate(45, 1, 0, 0);
  dish[1].matrix.rotate(45, 1, 0, 0);
  dish[2].matrix.rotate(45, 1, 0, 0);
  ship.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-4, 0.0, 0.2], [0.0, -0.8, -1.8], [0.1, 0.8, 0.4], [0.5, 0.6, 0.6]));
  ship.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-4, 0.0, 0.2], [0.0, -0.8, -1.8], [0.1, 0.8, 0.4], [0.5, 0.6, 0.6]));
  ship.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-4, 0.0, 0.2], [0.0, -0.8, -1.8], [0.1, 0.8, 0.4], [0.5, 0.6, 0.6]));
  ship.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-4, 2.8, 0.2], [0.0, 0.0, 0.0], [1.3, 2.8, 1.3], [0.1, 0.4, 0.3]));
  //ship.push(new TextureCube(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-4, 2.8, 0.2], [0.0, 0.0, 0.0], [1.3, 2.8, 1.3], [0.1, 0.4, 0.3]));
  ship.push(new TextureSphere(gl, u_Sampler, u_ColorPercent, 1.0, '../resources/Earth.png', vertexBuffer, [-4, 5.5, 0.2], [0.0, 0.0, 0.0], [1.5, 1.5, 2.3], 5, 5, [0.5, 0.5, 0.6], true));
  ship[4].matrix.rotate(-90, 1, 0, 0);
  window1 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Window1.png', vertexBuffer, 
    new Float32Array([
     -2.5,  1.8, 0.8, 0.0, 1.0, 0.0, 0.0, 1.0, 
     -2.5, 0.2, 0.8, 0.0, 0.0, 0.0, 0.0, 1.0,
     -2.5,  1.8, -0.8, 1.0, 1.0, 0.0, 1.0, 1.0,
     -2.5, 0.2, -0.8, 1.0, 0.0, 0.0, 0.0, 1.0])));
  window2 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Window2.png', vertexBuffer, 
    new Float32Array([
     -2.5,  1.8, 0.8, 0.0, 1.0, 0.0, 0.0, 1.0, 
     -2.5, 0.2, 0.8, 0.0, 0.0, 0.0, 0.0, 1.0,
     -2.5,  1.8, -0.8, 1.0, 1.0, 0.0, 1.0, 1.0,
     -2.5, 0.2, -0.8, 1.0, 0.0, 0.0, 0.0, 1.0])));
  window3 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Window1.png', vertexBuffer, 
    new Float32Array([
     -2.5,  3.8, 0.8, 0.0, 1.0, 0.0, 0.0, 1.0, 
     -2.5,  2.2, 0.8, 0.0, 0.0, 0.0, 0.0, 1.0,
     -2.5,  3.8, -0.8, 1.0, 1.0, 0.0, 1.0, 1.0,
     -2.5,  2.2, -0.8, 1.0, 0.0, 0.0, 0.0, 1.0])));
  window4 = (new TexturePolygon(gl, u_Sampler, u_ColorPercent, 0.0, '../resources/Window2.png', vertexBuffer, 
    new Float32Array([
     -2.5,  3.8, 0.8, 0.0, 1.0, 0.0, 0.0, 1.0, 
     -2.5,  2.2, 0.8, 0.0, 0.0, 0.0, 0.0, 1.0,
     -2.5,  3.8, -0.8, 1.0, 1.0, 0.0, 1.0, 1.0,
     -2.5,  2.2, -0.8, 1.0, 0.0, 0.0, 0.0, 1.0])));
  window1.transparent = true;
  window2.transparent = true;
  window3.transparent = true;
  window4.transparent = true;
  //ship[0].matrix.rotate(45, 0, 0, 0);
  ship[1].matrix.rotate(120, 0, 1, 0);
  ship[2].matrix.rotate(240, 0, 1, 0);
  ship[0].matrix.rotate(20, 1, 0, 0);
  ship[1].matrix.rotate(20, 1, 0, 0);
  ship[2].matrix.rotate(20, 1, 0, 0);
}

let dragging = false;
let lastMouse = [0, 0];
function initMouse() {
  canvas.addEventListener("mousedown", (event) => {
    dragging = true;
    lastMouse[0] = event.clientX;
    lastMouse[1] = event.clientY;
  });
  canvas.addEventListener("mouseup", (event) => {
    dragging = false;
  });
  canvas.addEventListener("mouseleave", (event) => {
    dragging = false;
  });
  canvas.addEventListener("mousemove", (event) => {
    if (!dragging) {
      lastMouse[0] = event.clientX;
      lastMouse[1] = event.clientY;
      return;
    }
    g_globalAngleX += (event.clientX - lastMouse[0]) * 0.5;
    g_globalAngleY += (event.clientY - lastMouse[1]) * 0.5;
    if(g_globalAngleY > 90) g_globalAngleY = 90;
    if(g_globalAngleY < -90) g_globalAngleY = -90;

    lastMouse[0] = event.clientX;
    lastMouse[1] = event.clientY;
  });
}

let keys = {};
function initKeys() {
    document.addEventListener("keydown", (event) => {
        let posi = {
            key: event.key,
            code: event.code,
            which: event.keyCode,
            location: event.location,

            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey,
            meta: event.metaKey,

            unique: true,
        };

        if (!(posi.key == "I" && posi.ctrl && posi.shift)) {
            event.preventDefault();
        }

        if (!keys[event.key]) keys[event.key] = posi;

        return false;
    });
    document.addEventListener("keyup", (e) => {
        keys[event.key] = false;
    });
}
function keyDownLatest(code_a,code_b) {
    const a = keys[code_a]
    const b = keys[code_b]
    if (a) {
        if (b) {
            if (a.age < b.age) return -1 
            else return 1
        } else return -1
    } else {
        if (b) return 1
        else return 0
    }
}
function keyDown(code) {
    return !!keys[code];
}
function keyPressed(code) {
    return !!(keys[code] && keys[code].unique);
}