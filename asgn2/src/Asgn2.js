// gloabal vars
let canvas;
let gl;

let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + 
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';
var vertexBuffer;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function main() {
  // setup canvas and gl
  setupWebGL();
  // set up GLSL shader programs and variables
  connectVariablesToGLSL();

  // Create a buffer object
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = poke;
  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.84, 0.72, 0.45, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_redAngle = 0;
let g_greenAngle = 0;
let g_blueAngle = 0;
//let g_size = 10;
let g_selectedType = POINT;
let g_segments = 10;
let g_globalAngle = 0;
var g_animating = true;
var g_poking = -0.5;
var g_pokeDirection = {x: 0.0, y: 0.0};
function addActionsForHtmlUI() {
  // color sliders
  document.getElementById("red").addEventListener("mousemove", function() { g_redAngle = this.value; /*renderAllShapes();*/ });
  document.getElementById("green").addEventListener("mousemove", function() { g_greenAngle = this.value; /*renderAllShapes();*/ });
  document.getElementById("blue").addEventListener("mousemove", function() { g_blueAngle = this.value; /*renderAllShapes();*/ });

  // shape slider
  //document.getElementById("segment_count").onclick   = function() { g_segments = this.value; };

  document.getElementById("clear").onclick = toggleAnim;
  //document.getElementById("setSquare").onclick   = function() { g_selectedType = POINT; };
  //document.getElementById("setTriangle").onclick = function() { g_selectedType = TRIANGLE; };
  //document.getElementById("setCircle").onclick   = function() { g_selectedType = CIRCLE; };

  document.getElementById("angleSlide").addEventListener("mousemove", function() { g_globalAngle = this.value; /*renderAllShapes();*/});

}
function poke() {
  g_poking = g_seconds;
  g_pokeDirection.x = Math.random() * 20 + 5;
  g_pokeDirection.y = Math.random() * 80 - 40;
}

function toggleAnim() {
  g_animating = !g_animating;
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  //console.log(performance.now());

  g_seconds = performance.now()/1000.0 - g_startTime;

  renderAllShapes();

  requestAnimationFrame(tick);
}

function headAnim(modulo, loc) {
  var percent = (g_seconds % modulo) / modulo;
  if(g_seconds - g_poking < 0.2) {
    loc.rotate(g_pokeDirection.x, 1, 0, 0);
    loc.rotate(g_pokeDirection.y, 0, 1, 0);
    loc.scale(1 + 0.5 * (0.2 - (g_seconds - g_poking)), 1 + 1.2 * (0.2 - (g_seconds - g_poking)), 1 + 0.5 * (0.2 - (g_seconds - g_poking)));
    return;
  }

  if(percent < 0.1) {
    loc.rotate(0, 1, 0, 0);
    loc.rotate(0, 0, 1, 0);
  }
  else if(percent < 0.2) {
    loc.translate(0, -0.4, -0.25);
    if(percent*100 % 2 < 1) {
      loc.translate(0, -0.1, 0);
    }
    loc.rotate(-90, 1, 0, 0);
    loc.rotate(0, 0, 1, 0);
  }
  else if(percent < 0.4) {
    loc.rotate(-5, 1, 0, 0);
    loc.rotate(-5, 0, 1, 0);
  }
  else if(percent < 0.5) {
    loc.rotate(10, 1, 0, 0);
    loc.rotate(0, 0, 1, 0);
  }
  else if(percent < 0.6) {
    loc.translate(0, -0.05, 0);
    loc.rotate(-5, 1, 0, 0);
    loc.rotate(-50, 0, 1, 0);
  }
  else {
    loc.rotate(0, 1, 0, 0);
    loc.rotate(0, 0, 1, 0);
  }
  loc.scale(1.0,1.0 + (0.05 *Math.sin(2*g_seconds)),1.0);
}

function renderAllShapes() {
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  var body = new Cube();
  body.color = [0.2, 0.2, 0.18, 1.0];
  body.matrix.translate(0.0, 0.1, 0.0);

  var headLoc = new Matrix4(body.matrix);
  if(g_animating) {
    headAnim(12, headLoc)
  }
  if(!g_animating) {
    headLoc.rotate(g_redAngle, 0, 1, 0);
    headLoc.rotate(g_blueAngle, 1, 0, 0);
  }

  body.matrix.translate(-0.275, -0.55, -0.15);
  var legLoc = new Matrix4(body.matrix);
  var wingLoc = new Matrix4(body.matrix);
  wingLoc.translate(0.0, 0.3, 0.0);
  var tailLoc = new Matrix4(body.matrix);
  tailLoc.translate(0.2, 0.3, 0.65);

  body.matrix.scale(0.6, 0.45, 0.7);
  body.render();

  var wingLeft =  new Cube();
  wingLeft.matrix = new Matrix4(wingLoc);
  wingLeft.color = [0.15, 0.15, 0.15, 1.0];
  wingLeft.matrix.translate(-0.02, 0, 0.0);
  if(g_animating) {
    wingLeft.matrix.rotate(-10*(1+Math.sin(g_seconds)), 0, 0, 1);
    wingLeft.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  } else {
    wingLeft.matrix.rotate(g_greenAngle, 0, 0, 1);
  }
  wingLeft.matrix.translate(0, -0.3, 0.0);
  wingLeft.matrix.scale(0.02, 0.4, 0.8);
  wingLeft.render();
  wingLeft.matrix.translate(0, 0.05, 0.05);
  wingLeft.matrix.scale(1, 0.9, 0.9);
  wingLeft.color = [0.2, 0.2, 0.18, 1.0];
  wingLeft.matrix.translate(0.0, 1, 0.0);
  if(g_animating) {
    wingLeft.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  }
  wingLeft.matrix.translate(0, -1, 0.0);
  wingLeft.matrix.translate(-1.0, -0.0, 0.0);
  wingLeft.render();
  wingLeft.matrix.translate(0.0, 1, 0.0);
  if(g_animating) {
    wingLeft.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  }
  wingLeft.matrix.translate(0, -1, 0.0);
  wingLeft.matrix.translate(-1.0, -0.0, 0.0);
  wingLeft.render();
  wingLeft.matrix.translate(0.0, 1, 0.0);
  if(g_animating) {
    wingLeft.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  }
  wingLeft.matrix.translate(0, -1, 0.0);
  wingLeft.matrix.translate(-1.0, -0.0, 0.0);
  wingLeft.render();

  var wingRight =  new Cube();
  wingRight.matrix = new Matrix4(wingLoc);
  wingRight.color = [0.15, 0.15, 0.15, 1.0];
  wingRight.matrix.translate(0.6, 0.0, 0.0);
  if(g_animating) {
    wingRight.matrix.rotate(10*(1+Math.sin(g_seconds)), 0, 0, 1);
    wingRight.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  } else {
    wingRight.matrix.rotate(-g_greenAngle, 0, 0, 1);
  }
  wingRight.matrix.translate(0, -0.3, 0.0);
  wingRight.matrix.scale(0.02, 0.4, 0.8);
  wingRight.render();
  wingRight.matrix.translate(0, 0.05, 0.05);
  wingRight.matrix.scale(1, 0.9, 0.9);
  wingRight.color = [0.2, 0.2, 0.18, 1.0];
  wingRight.matrix.translate(0.0, 1, 0.0);
  if(g_animating) {
    wingRight.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  }
  wingRight.matrix.translate(0, -1, 0.0);
  wingRight.matrix.translate(1.0, -0.0, 0.0);
  wingRight.render();
  wingRight.matrix.translate(0.0, 1, 0.0);
  if(g_animating) {
    wingRight.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  }
  wingRight.matrix.translate(0, -1, 0.0);
  wingRight.matrix.translate(1.0, -0.0, 0.0);
  wingRight.render();
  wingRight.matrix.translate(0.0, 1, 0.0);
  if(g_animating) {
    wingRight.matrix.rotate(3*(1+Math.sin(g_seconds)), 1, 0, 0);
  }
  wingRight.matrix.translate(0, -1, 0.0);
  wingRight.matrix.translate(1.0, -0.0, 0.0);
  wingRight.render();

  var tail = new Cube();
  tail.matrix = new Matrix4(tailLoc);
  tail.color = [0.85, 0.85, 0.8, 1.0];
  tail.matrix.translate(-0.15, 0.0, -0.075);
  tail.matrix.rotate(-30, 0, 1, 0);
  tail.matrix.rotate(-45, 1, 0, 0);
  tail.matrix.scale(0.2, 0.1, 0.35);
  tail.render();
  var tail2 = new Cube();
  tail2.matrix = new Matrix4(tailLoc);
  tail2.color = [0.85, 0.85, 0.8, 1.0];
  tail2.matrix.translate(0.0, 0.0, 0.0);
  tail2.matrix.rotate(-45, 1, 0, 0);
  tail2.matrix.scale(0.22, 0.12, 0.4);
  tail2.render();
  var tail3 = new Cube();
  tail3.matrix = new Matrix4(tailLoc);
  tail3.color = [0.85, 0.85, 0.8, 1.0];
  tail3.matrix.translate(0.15, 0.0, 0.075);
  tail3.matrix.rotate(30, 0, 1, 0);
  tail3.matrix.rotate(-45, 1, 0, 0);
  tail3.matrix.scale(0.2, 0.1, 0.35);
  tail3.render();

  var head = new Cube();
  head.color = [0.85, 0.85, 0.8, 1.0];
  head.matrix = new Matrix4(headLoc);
  head.matrix.rotate(-45, 0, 1, 0);

  var nozeLoc = new Matrix4(head.matrix);
  nozeLoc.translate(-0.25, 0.125, -0.25);

  head.matrix.translate(-0.25, 0.0, -0.25);
  head.matrix.scale(0.5, 0.55, 0.5);
  head.render();

  var beakTop = new Cube();
  beakTop.color = [0.75, 0.75, 0.5, 1.0];
  beakTop.matrix = new Matrix4(nozeLoc);
  beakTop.matrix.rotate(45, 0, 1, 0);
  beakTop.matrix.translate(-0.125, 0.0, -0.25);
  beakTop.matrix.scale(0.25, 0.15, 0.35);
  beakTop.render();

  var beakBot = new Cube();
  beakBot.color = [0.75, 0.75, 0.5, 1.0];
  beakBot.matrix = new Matrix4(nozeLoc);
  beakBot.matrix.rotate(45, 0, 1, 0);
  beakBot.matrix.translate(-0.075, -0.05, -0.15);
  beakBot.matrix.scale(0.15, 0.05, 0.35);
  beakBot.render();

  var eyeLeft = new Cube();
  eyeLeft.matrix = new Matrix4(nozeLoc);
  eyeLeft.color = [0.95, 0.95, 0.95, 1.0]
  eyeLeft.matrix.translate(-0.02, 0.2, 0.2);
  var eyeLeftLoc = new Matrix4(eyeLeft.matrix);
  eyeLeft.matrix.scale(0.02, 0.10, 0.2);
  if(g_seconds - g_poking < 0.2 && g_animating) {
    eyeLeft.matrix.scale(1.0, 0.2, 1.0);
  }
  eyeLeft.render();

  var eyeLineLeft = new Cube();
  eyeLineLeft.matrix = new Matrix4(eyeLeftLoc);
  eyeLineLeft.color = [0.15, 0.15, 0.15, 1.0];
  eyeLineLeft.matrix.translate(0.01, -0.06, -0.03);
  eyeLineLeft.matrix.scale(0.01, 0.18, 0.28);
  if(g_seconds - g_poking < 0.2 && g_animating) {
    eyeLineLeft.matrix.scale(1.0, 0.5, 1.0);
  }
  eyeLineLeft.render();

  var eyeRight = new Cube();
  eyeRight.matrix = new Matrix4(nozeLoc);
  eyeRight.color = [0.95, 0.95, 0.95, 1.0];
  eyeRight.matrix.translate(0.2, 0.2, -0.02);
  var eyeRightLoc = new Matrix4(eyeRight.matrix);
  eyeRight.matrix.scale(0.2, 0.10, 0.02);
  if(g_seconds - g_poking < 0.2 && g_animating) {
    eyeRight.matrix.scale(1.0, 0.2, 1.0);
  }
  eyeRight.render();

  var eyeLineRight = new Cube();
  eyeLineRight.matrix = new Matrix4(eyeRightLoc);
  eyeLineRight.color = [0.15, 0.15, 0.15, 1.0];
  eyeLineRight.matrix.translate(-0.03, -0.06, 0.01);
  eyeLineRight.matrix.scale(0.28, 0.18, 0.01);
  if(g_seconds - g_poking < 0.2 && g_animating) {
    eyeLineRight.matrix.scale(1.0, 0.5, 1.0);
  }
  eyeLineRight.render();

  var main = new Cube();
  main.color = [0.75, 0.75, 0.7, 1.0];
  main.matrix = new Matrix4(headLoc);
  main.matrix.rotate(45+22.5, 0, 1, 0);
  main.matrix.translate(-0.275, -0.1, -0.275);
  main.matrix.scale(0.55, 0.1, 0.55);
  main.render();
  main.matrix = new Matrix4(headLoc);
  main.matrix.rotate(22.5, 0, 1, 0);
  main.matrix.translate(-0.275, -0.1, -0.275);
  main.matrix.scale(0.55, 0.1, 0.55);
  main.render();

  var legs = new Cube();
  legs.color = [0.15, 0.15, 0.15, 1.0];
  legs.matrix = new Matrix4(legLoc);
  legs.matrix.translate(0.2, -0.25, 0.2);
  legs.matrix.translate(0.0, -0.04, 0.0);
  var footLoc = new Matrix4(legs.matrix);
  footHere();
  legs.matrix.translate(0.0, 0.04, 0.0);
  legs.matrix.scale(0.02, 0.4, 0.02);
  legs.render();
  legs.matrix.scale(1/0.02, 1/0.4, 1/0.02);
  legs.matrix.translate(0.2, 0.0, 0.0);
  legs.matrix.translate(0.0, -0.04, 0.0);
  footLoc = new Matrix4(legs.matrix);
  footHere();
  legs.matrix.translate(0.0, 0.04, 0.0);
  legs.matrix.scale(0.02, 0.4, 0.02);
  legs.render();

  function footHere() {
    var foot = new Cube();
    foot.color = [0.15, 0.15, 0.15, 1.0];
    foot.matrix = new Matrix4(footLoc);
    foot.matrix.rotate(12.5, 1, 0, 0);
    foot.matrix.scale(0.05, 0.05, 0.2);
    foot.render();
    foot.matrix.scale(1/0.05, 1/0.05, 1/0.2);
    foot.matrix.translate(0.03, 0.0, 0.05);
    foot.matrix.rotate(-22.5, 1, 0, 0);
    foot.matrix.rotate(180, 0, 1, 0);
    foot.matrix.rotate(-25, 0, 1, 0);
    foot.matrix.scale(0.05, 0.05, 0.2);
    foot.render();
    foot.matrix.scale(1/0.05, 1/0.05, 1/0.2);
    foot.matrix.rotate(50, 0, 1, 0);
    foot.matrix.scale(0.05, 0.05, 0.2);
    foot.render();
  }
}
