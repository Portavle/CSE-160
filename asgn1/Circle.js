class Circle{
  constructor() {
    this.type = "circle";
    this.position = [0, 0, 0];
    this.color = [0.0, 0.0, 0.0, 0.0];
    this.size = 0;
    this.segments = 10;
  }

  render() {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    // Pass the size of a point to u_Size
    gl.uniform1f(u_Size, this.size);
  
    // Draw
    drawCircle(this.position, this.size, this.segments);
  }
}


function drawCircle(centerV, radius, segments) {
    var d = radius/200.0;

    let angleStep = 360/segments;
    let v1 = [d, 0];
    let p1 = [v1[0] + centerV[0], v1[1] + centerV[1]];
    for(var i = 0; i < segments - 1; i++) {
        let angle1 = angleStep * i;
        let angle2 = angleStep * (i+1);
        let v2 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
        let v3 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
        let p2 = [v2[0] + centerV[0], v2[1] + centerV[1]];
        let p3 = [v3[0] + centerV[0], v3[1] + centerV[1]];
        
        drawTriangle([p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]]);
    }
}
