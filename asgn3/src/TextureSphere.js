class TextureSphere {
    constructor(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, pos, pivot, scale, rows, collumns, color, half) {
        this.gl = gl;
        //this.texture = this.gl.createTexture();
        this.n = 4;

        this.matrix = new Matrix4();

        this.vbuffer = vbuffer;
        this.scale = scale;
        this.pos = pos;
        this.pivot = pivot;
        this.color = color;
        this.polygonList = [];
        this.half = half;

        let perRow = 1.0 / rows;
        let perRowDeg = Math.PI / rows;
        let perCol = 1.0 / collumns;
        let perColDeg = Math.PI*2 / collumns;
        if(this.half) {perColDeg = Math.PI / collumns;}
        for(let i = 0; i < rows; i++) {
            for(let j = 0; j < collumns; j++) {
                let sphereFrag = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
                    new Float32Array([
                    this.pivot[0] + Math.sin(i*perRowDeg) * Math.cos(j*perColDeg) * this.scale[0], 
                    this.pivot[1] + Math.cos(i*perRowDeg) * this.scale[1], 
                    this.pivot[2] + Math.sin(i*perRowDeg) * Math.sin(j*perColDeg) * this.scale[2], 
                        j * perRow, 1 - (i * perCol), this.color[0], this.color[1], this.color[2], 
                    this.pivot[0] + Math.sin(i*perRowDeg) * Math.cos((j+1)*perColDeg) * this.scale[0], 
                    this.pivot[1] + Math.cos(i*perRowDeg) * this.scale[1], 
                    this.pivot[2] + Math.sin(i*perRowDeg) * Math.sin((j+1)*perColDeg) * this.scale[2], 
                        (j+1) * perRow, 1 - (i * perCol), this.color[0], this.color[1], this.color[2],
                    this.pivot[0] + Math.sin((i+1)*perRowDeg) * Math.cos(j*perColDeg) * this.scale[0], 
                    this.pivot[1] + Math.cos((i+1)*perRowDeg) * this.scale[1], 
                    this.pivot[2] + Math.sin((i+1)*perRowDeg) * Math.sin(j*perColDeg) * this.scale[2], 
                        j * perRow, 1 - ((i+1) * perCol), this.color[0], this.color[1], this.color[2],
                    this.pivot[0] + Math.sin((i+1)*perRowDeg) * Math.cos((j+1)*perColDeg) * this.scale[0], 
                    this.pivot[1] + Math.cos((i+1)*perRowDeg) * this.scale[1], 
                    this.pivot[2] + Math.sin((i+1)*perRowDeg) * Math.sin((j+1)*perColDeg) * this.scale[2], 
                        (j+1) * perRow, 1 - ((i+1) * perCol), this.color[0], this.color[1], this.color[2]]));
                sphereFrag.newTexture = false;
                this.polygonList.push(sphereFrag);
            }
        }
        this.polygonList[0].newTexture = true;
        this.polygonList[this.polygonList.length - 1].newTexture = true;
    }
    render() {
        let newM = new Matrix4().translate(this.pos[0], this.pos[1], this.pos[2]).multiply(this.matrix);
        this.gl.uniformMatrix4fv(u_ModelMatrix, false, newM.elements);
        this.polygonList.forEach((polygon) => {
            polygon.render();
        });
        this.gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements);
    }
}
