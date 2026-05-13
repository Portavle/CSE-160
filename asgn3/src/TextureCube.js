class TextureCube {
    constructor(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, pos, pivot, scale, color) {
        this.gl = gl;
        this.u_Sampler = u_Sampler;
        this.u_ColorPercent = u_ColorPercent;
        this.percent = cp;
        //this.texture = this.gl.createTexture();
        this.n = 4;

        this.matrix = new Matrix4();

        this.vbuffer = vbuffer;
        this.scale = scale;
        this.pos = pos;
        this.pivot = pivot;
        this.color = color;
        this.front = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
            new Float32Array([
            this.pivot[0] + this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] +  this.scale[2], 0.0, 1.0, this.color[0], this.color[1], this.color[2], 
            this.pivot[0] + this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] +  this.scale[2], 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] + this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] + -this.scale[2], 1.0, 1.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] + this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] + -this.scale[2], 1.0, 0.0, this.color[0], this.color[1], this.color[2]]));
        this.right = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
            new Float32Array([
            this.pivot[0] + -this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] + -this.scale[2], 0.0, 1.0, this.color[0], this.color[1], this.color[2], 
            this.pivot[0] + -this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] + -this.scale[2], 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] +  this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] + -this.scale[2], 1.0, 1.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] +  this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] + -this.scale[2], 1.0, 0.0, this.color[0], this.color[1], this.color[2]]));
        this.right.newTexture = false;
        this.top = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
            new Float32Array([
            this.pivot[0] + -this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] + -this.scale[2], 0.0, 1.0, this.color[0], this.color[1], this.color[2], 
            this.pivot[0] +  this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] + -this.scale[2], 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] + -this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] +  this.scale[2], 1.0, 1.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] +  this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] +  this.scale[2], 1.0, 0.0, this.color[0], this.color[1], this.color[2]]));
        this.top.newTexture = false;
        this.bottom = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
            new Float32Array([
            this.pivot[0] + -this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] + -this.scale[2], 0.0, 1.0, this.color[0], this.color[1], this.color[2], 
            this.pivot[0] +  this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] + -this.scale[2], 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] + -this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] +  this.scale[2], 1.0, 1.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] +  this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] +  this.scale[2], 1.0, 0.0, this.color[0], this.color[1], this.color[2]]));
        this.bottom.newTexture = false;
        this.back = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
            new Float32Array([
            this.pivot[0] + -this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] +  this.scale[2], 0.0, 1.0, this.color[0], this.color[1], this.color[2], 
            this.pivot[0] + -this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] +  this.scale[2], 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] +  this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] +  this.scale[2], 1.0, 1.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] +  this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] +  this.scale[2], 1.0, 0.0, this.color[0], this.color[1], this.color[2]]));
        this.back.newTexture = false;
        this.left = new TexturePolygon(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, 
            new Float32Array([
            this.pivot[0] + -this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] +  this.scale[2], 0.0, 1.0, this.color[0], this.color[1], this.color[2], 
            this.pivot[0] + -this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] +  this.scale[2], 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] + -this.scale[0], this.pivot[1] +  this.scale[1], this.pivot[2] + -this.scale[2], 1.0, 1.0, this.color[0], this.color[1], this.color[2],
            this.pivot[0] + -this.scale[0], this.pivot[1] + -this.scale[1], this.pivot[2] + -this.scale[2], 1.0, 0.0, this.color[0], this.color[1], this.color[2]]));
        this.left.newTexture = false;
    }
    render() {
        let newM = new Matrix4().translate(this.pos[0], this.pos[1], this.pos[2]).multiply(this.matrix);
        this.gl.uniformMatrix4fv(u_ModelMatrix, false, newM.elements);
        this.front.render();
        this.top.render();
        this.right.render();
        this.left.render();
        this.back.render();
        this.bottom.render();
        this.gl.uniformMatrix4fv(u_ModelMatrix, false, new Matrix4().elements);
    }
}