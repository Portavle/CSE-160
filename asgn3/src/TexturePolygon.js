class TexturePolygon {
    constructor(gl, u_Sampler, u_ColorPercent, cp, src, vbuffer, vertices) {
        this.gl = gl;
        this.u_Sampler = u_Sampler;
        this.u_ColorPercent = u_ColorPercent;
        this.percent = cp;
        this.texture = this.gl.createTexture();
        this.image = new Image();
        this.image.src = src;
        this.n = vertices.length / 8;

        this.vbuffer = vbuffer;
        this.vertices = vertices;
        //this.matrix = new Matrix4();
        this.newTexture = true;
        this.transparent = false;
    }

    initVBuffer() {
        var FSIZE = this.vertices.BYTES_PER_ELEMENT;
        if(this.transparent) {
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }

        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*8, 0);
        this.gl.enableVertexAttribArray(a_Position);

        this.gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE*8, FSIZE*3);
        this.gl.enableVertexAttribArray(a_TexCoord);

        this.gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*8, FSIZE*5);
        this.gl.enableVertexAttribArray(a_Color);
    }

    load() {
        if(this.newTexture) {
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
            // Enable the texture unit 0
            this.gl.activeTexture(this.gl.TEXTURE0);
            // Bind the texture object to the target
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

            // Set the texture parameters
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
            // Set the texture image
            if(this.transparent) {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
            } else {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.image);
            }

            // Set the texture unit 0 to the sampler
            this.gl.uniform1i(this.u_Sampler, 0);
        }
        this.gl.uniform1f(this.u_ColorPercent, this.percent);
        // this.gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.n);
        if(this.transparent) {
            this.gl.disable(this.gl.BLEND);
        }
    }
    render() {
        this.initVBuffer();
        this.load();
    }
}