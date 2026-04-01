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

function areaTriangle(v1, v2) {
  let tv = Vector3.cross(v1, v2);
  return tv.magnitude() / 2;
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

  let v3 = new Vector3(v1.elements);
  let v4 = new Vector3(v2.elements);
  switch(op_command) {
    case "add":
      v3.add(v2);
      v4.mul(0);
      break;
    case "sub":
      v3 = v1.sub(v2);
      v4.mult(0);
      break;
    case "mul":
      v3 = v3.mul(op_scalar);
      v4 = v4.mul(op_scalar);
      break;
    case "div":
      v3 = v3.div(op_scalar);
      v4 = v4.div(op_scalar);
      break;
    case "mag":
      v3 = v3.mul(0);
      v4 = v4.mul(0);
      console.log("Magnitude v1: " + v1.magnitude());
      console.log("Magnitude v2: " + v2.magnitude());
      break;
    case "norm":
      v3 = v3.normalize();
      v4 = v4.normalize();
      break;
    case "angle":
      v3 = v3.mul(0);
      v4 = v4.mul(0);
      let dot = Vector3.dot(v1, v2);
      let angle = Math.acos(dot / (v1.magnitude() * v2.magnitude())) / Math.PI * 180;
      console.log("Angle: " + angle);
      break;
    case "area":
      v3 = v3.mul(0);
      v4 = v4.mul(0);
      console.log("Area of the triangle: " + areaTriangle(v1, v2));
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