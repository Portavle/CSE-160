class Triangle{
  constructor() {
    this.type = "triangle";
    this.position = [0, 0, 0];
    this.color = [0.0, 0.0, 0.0, 0.0];
    this.vertices = [0, 0, 0, 0, 0, 0];
    this.size = 0;
  }

  render() {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    // Pass the size of a point to u_Size
    gl.uniform1f(u_Size, this.size);
  
    // Draw
    //gl.drawArrays(gl.POINTS, 0, 1);
    drawTriangle(this.vertices);
  }
}


function drawTriangle(vertices) {
  var n = 3; // The number of vertices

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}
