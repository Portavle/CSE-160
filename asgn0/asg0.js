// DrawTriangle.js (c) 2012 matsuda
var ctx;
let v1 = new Vector3([0, 0, 0]);
let v2 = new Vector3([0, 0, 0]);

function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';             // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color
}

function drawVector(v, color) {
  if(!v)
    return;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(200 + 20 * v.elements[0], 200 - 20 * v.elements[1]);
  ctx.stroke();
}

function handleDrawEvent() {
  let v1_x = document.getElementById("v1_x").value;
  let v1_y = document.getElementById("v1_y").value;
  let v1 = new Vector3([v1_x, v1_y, 0]);
  let v2_x = document.getElementById("v2_x").value;
  let v2_y = document.getElementById("v2_y").value;
  let v2 = new Vector3([v2_x, v2_y, 0]);

  // Draw a black rectangle
  ctx.fillStyle = 'black';             // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  let v1_x = document.getElementById("v1_x").value;
  let v1_y = document.getElementById("v1_y").value;
  let v1 = new Vector3([v1_x, v1_y, 0]);
  let v2_x = document.getElementById("v2_x").value;
  let v2_y = document.getElementById("v2_y").value;
  let v2 = new Vector3([v2_x, v2_y, 0]);
  let op_command = document.getElementById("op").value;
  let op_scalar = document.getElementById("scalar").value;

  let v3;
  let v4;
  switch(op_command) {
    case "add":
      v3 = new Vector3([v1.elements[0] + v2.elements[0], v1.elements[1] + v2.elements[1], 0]);
      break;
    case "sub":
      v3 = new Vector3([v1.elements[0] - v2.elements[0], v1.elements[1] - v2.elements[1], 0]);
      break;
    case "mult":
      v3 = new Vector3([v1.elements[0] * op_scalar, v1.elements[1] * op_scalar, 0]);
      v4 = new Vector3([v2.elements[0] * op_scalar, v2.elements[1] * op_scalar, 0]);
      break;
    case "div":
      v3 = new Vector3([v1.elements[0] / op_scalar, v1.elements[1] / op_scalar, 0]);
      v4 = new Vector3([v2.elements[0] / op_scalar, v2.elements[1] / op_scalar, 0]);
      break;
  }

  // Draw a black rectangle
  ctx.fillStyle = 'black';             // Set color to black
  ctx.fillRect(0, 0, 400, 400);        // Fill a rectangle with the color

  drawVector(v1, "red");
  drawVector(v2, "blue");
  drawVector(v3, "green");
  drawVector(v4, "green");
}