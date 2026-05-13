class TextureSurface {
    constructor(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, pos, scale, rows, collumns, color) {
        this.gl = gl;
        //this.texture = this.gl.createTexture();
        this.n = 4;

        this.matrix = new Matrix4();

        this.vbuffer = vbuffer;
        this.scale = scale;
        this.pos = pos;
        this.color = color;
        this.polygonList = [];

        let perRow = 1.0 / rows;
        let perCol = 1.0 / collumns;
        for(let i = 0; i < rows; i++) {
            for(let j = 0; j < collumns; j++) {
                let frag = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
                    new Float32Array([
                    (this.scale[0] * i * perRow)*2 - this.scale[0], 
                    Math.cos(pos[0] - this.scale[0] + i*perRow*this.scale[0]*2 * Math.PI + pos[2] - this.scale[2] +  j*perCol*this.scale[2]*2 * Math.PI) * this.scale[1], 
                    (this.scale[2] * j * perCol)*2 - this.scale[2], 
                        (j * perRow)*5, (1 - (i * perCol))*5, this.color[0], this.color[1], this.color[2], 
                    (this.scale[0] * i * perRow)*2 - this.scale[0], 
                    Math.cos(pos[0] - this.scale[0] + i*perRow*this.scale[0]*2 * Math.PI + pos[2] - this.scale[2] +  (j+1)*perCol*this.scale[2]*2 * Math.PI) * this.scale[1], 
                    (this.scale[2] * (j+1) * perRow)*2 - this.scale[2], 
                        ((j+1) * perRow)*5, (1 - (i * perCol))*5, this.color[0], this.color[1], this.color[2],
                    (this.scale[0] * (i+1) * perRow)*2 - this.scale[0], 
                    Math.cos(pos[0] - this.scale[0] + (i+1)*perRow*this.scale[0]*2 * Math.PI + pos[2] - this.scale[2] +  j*perCol*this.scale[2]*2 * Math.PI) * this.scale[1], 
                    (this.scale[2] * j * perCol)*2 - this.scale[2], 
                        (j * perRow)*5, (1 - ((i+1) * perCol))*5, this.color[0], this.color[1], this.color[2],
                    (this.scale[0] * (i+1) * perRow)*2 - this.scale[0], 
                    Math.cos(pos[0] - this.scale[0] + (i+1)*perRow*this.scale[0]*2 * Math.PI + pos[2] - this.scale[2] +  (j+1)*perCol*this.scale[2]*2 * Math.PI) * this.scale[1], 
                    (this.scale[2] * (j+1) * perRow)*2 - this.scale[2], 
                        ((j+1) * perRow)*5, (1 - ((i+1) * perCol))*5, this.color[0], this.color[1], this.color[2]]));
                frag.newTexture = false;
                this.polygonList.push(frag);
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
