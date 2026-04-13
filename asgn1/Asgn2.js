// gloabal vars
let canvas;
let gl;

let a_Position;
let u_FragColor;
let u_Size;

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
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
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


let g_shapesList = [];  // The array for shapes
function click(ev) {
  // Extract event click to WebGL coords
  let [x, y] = convertCoordinatesEventToGL(ev);
  let rgba = [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]]
  let size = g_size;

  let newPoint;
  switch(g_selectedType) {
    case CIRCLE:
      newPoint = new Circle();
      newPoint.segments = g_segments;
      break;
    case TRIANGLE:
      newPoint = new Triangle();
      var d = size/200;
      newPoint.vertices = [x, y, x + d, y, x, y + d];
      break;
    case POINT:
    default:
      newPoint = new Point();
      break;
  }

  newPoint.position = [x, y];
  newPoint.color = rgba;
  newPoint.size = size;
  g_shapesList.push(newPoint);
  console.log(g_shapesList);

  renderAllShapes();
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_size = 10;
let g_selectedType = POINT;
let g_segments = 10;
function addActionsForHtmlUI() {
  // color sliders
  document.getElementById("red").addEventListener("mouseup", function() { g_selectedColor[0] = this.value });
  document.getElementById("green").addEventListener("mouseup", function() { g_selectedColor[1] = this.value });
  document.getElementById("blue").addEventListener("mouseup", function() { g_selectedColor[2] = this.value });

  // shape slider
  document.getElementById("shape_size").addEventListener("mouseup",  function() { g_size = this.value });
  document.getElementById("segment_count").onclick   = function() { g_segments = this.value; };

  document.getElementById("clear").onclick = clear;
  document.getElementById("create").onclick = createDrawing;
  document.getElementById("setSquare").onclick   = function() { g_selectedType = POINT; };
  document.getElementById("setTriangle").onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById("setCircle").onclick   = function() { g_selectedType = CIRCLE; };

}

function clear() {
  g_shapesList = [];
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}
