
(() => {
    let canvas, canvasWidth, canvasHeight;
    let gl, ext, run, scene = 0;
    let audio = new gl3Audio(0.4, 0.5);
    let startTime = 0;
    let nowTime = 0;

    let pastePrg;
    let graphPrg;

    const DEBUG_MODE = false;

    const FRAMEBUFFER_RESOLUTION = 128;

    window.addEventListener('load', () => {
        canvas = document.getElementById('canvas');
        setCanvasSize();

        gl = canvas.getContext('webgl');
        ext = getWebGLExtensions();

        // events
        window.addEventListener('resize', setCanvasSize, false);
        if(DEBUG_MODE === true){
            window.addEventListener('keydown', (eve) => {
                run = eve.key !== 'Escape';
                if(run !== true){
                    audio.src[0].stop();
                    console.log(nowTime);
                }
            }, false);
        }

        loadShaderSource(
            './shader/paste.vert',
            './shader/paste.frag',
            (shader) => {
                let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                let prg = createProgram(vs, fs);
                if(prg == null){return;}
                pastePrg = new ProgramParameter(prg);
                loadCheck();
            }
        );
        loadShaderSource(
            './shader/graph.vert',
            './shader/graph.frag',
            (shader) => {
                let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                let prg = createProgram(vs, fs);
                if(prg == null){return;}
                graphPrg = new ProgramParameter(prg);
                loadCheck();
            }
        );
        function loadCheck(){
            if(
                pastePrg != null &&
                graphPrg != null &&
                true
            ){loadSound();}
        }
    }, false);

    function loadSound(){
        audio.load('sound/background.mp3', 0, false, true, () => {
            setTimeout(init, 3000);
        });
    }

    function init(){
        pastePrg.attLocation[0] = gl.getAttribLocation(pastePrg.program, 'position');
        pastePrg.attLocation[1] = gl.getAttribLocation(pastePrg.program, 'texCoord');
        pastePrg.attStride[0]   = 3;
        pastePrg.attStride[1]   = 2;
        pastePrg.uniLocation[0] = gl.getUniformLocation(pastePrg.program, 'graphTexture');
        pastePrg.uniType[0]     = 'uniform1i';

        graphPrg.attLocation[0] = gl.getAttribLocation(graphPrg.program, 'position');
        graphPrg.attLocation[1] = gl.getAttribLocation(graphPrg.program, 'texCoord');
        graphPrg.attStride[0]   = 3;
        graphPrg.attStride[1]   = 2;
        graphPrg.uniLocation[0] = gl.getUniformLocation(graphPrg.program, 'resolution');
        graphPrg.uniLocation[1] = gl.getUniformLocation(graphPrg.program, 'time');
        graphPrg.uniLocation[2] = gl.getUniformLocation(graphPrg.program, 'scene');
        graphPrg.uniType[0]     = 'uniform2fv';
        graphPrg.uniType[1]     = 'uniform1f';
        graphPrg.uniType[2]     = 'uniform1i';

        // vertices
        let planePosition = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];
        let planeTexCoord = [
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];
        let planeIndex = [
            0, 1, 2, 2, 1, 3
        ];
        let planeVBO = [createVbo(planePosition)];
        let planeIBO = createIbo(planeIndex);
        let planeTexCoordVBO = [
            createVbo(planePosition),
            createVbo(planeTexCoord)
        ];

        let graphFramebuffer = createFramebuffer(FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION);

        // textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, graphFramebuffer.texture);

        // flags
        gl.disable(gl.DEPTH_TEST);

        // setting
        run = true;

        audio.src[0].play();

        startTime = Date.now();
        nowTime = 0;
        render();

        function render(){
            nowTime = (Date.now() - startTime) / 1000;

            switch(true){
                case nowTime < 6.0:
                    scene = 0;
                    break;
                case nowTime < 14.75:
                    scene = 1;
                    break;
                case nowTime < 22.0:
                    scene = 2;
                    break;
                case nowTime < 25.5:
                    scene = 3;
                    break;
                case nowTime < 29.0:
                    scene = 4;
                    break;
                case nowTime < 36.25:
                    scene = 5;
                    break;
                case nowTime < 49.5:
                    scene = 6;
                    break;
                case nowTime < 52.25:
                    scene = 7;
                    break;
                case nowTime < 67.0:
                    scene = 8;
                    break;
                case nowTime < 68.75:
                    scene = 9;
                    break;
                case nowTime < 97.5:
                    scene = 10;
                    break;
                case nowTime < 102.5:
                    scene = 11;
                    break;
                default:
                    scene = 0;
                    run = false;
                    break;
            }

            // render to graph
            gl.bindFramebuffer(gl.FRAMEBUFFER, graphFramebuffer.framebuffer);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION);
            // push and render
            gl.useProgram(graphPrg.program);
            setAttribute(planeTexCoordVBO, graphPrg.attLocation, graphPrg.attStride, planeIBO);
            gl[graphPrg.uniType[0]](graphPrg.uniLocation[0], [FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION]);
            gl[graphPrg.uniType[1]](graphPrg.uniLocation[1], nowTime);
            gl[graphPrg.uniType[2]](graphPrg.uniLocation[2], scene);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);

            // render to canvas -----------------------------------------------
            gl.disable(gl.BLEND);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.useProgram(pastePrg.program);
            gl.viewport(0, 0, canvasWidth, canvasHeight);
            setAttribute(planeTexCoordVBO, pastePrg.attLocation, pastePrg.attStride, planeIBO);
            gl[pastePrg.uniType[0]](pastePrg.uniLocation[0], 0);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);

            gl.flush();

            // animation loop
            if(run){requestAnimationFrame(render);}
        }
    }

    class ProgramParameter {
        constructor(program){
            this.program     = program;
            this.attLocation = [];
            this.attStride   = [];
            this.uniLocation = [];
            this.uniType     = [];
        }
    }

    function loadShaderSource(vsPath, fsPath, callback){
        let vs, fs;
        xhr(vsPath, true);
        xhr(fsPath, false);
        function xhr(source, isVertex){
            let xml = new XMLHttpRequest();
            xml.open('GET', source, true);
            xml.setRequestHeader('Pragma', 'no-cache');
            xml.setRequestHeader('Cache-Control', 'no-cache');
            xml.onload = () => {
                if(isVertex){
                    vs = xml.responseText;
                }else{
                    fs = xml.responseText;
                }
                if(vs != null && fs != null){
                    console.log('loaded', vsPath, fsPath);
                    callback({vs: vs, fs: fs});
                }
            };
            xml.send();
        }
    }

    function createShader(source, type){
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            return shader;
        }else{
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    function createProgram(vs, fs){
        if(vs == null || fs == null){return;}
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
            return program;
        }else{
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }

    function createVbo(data){
        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    function createIbo(data){
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    function createIboInt(data){
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    function setAttribute(vbo, attL, attS, ibo){
        for(let i in vbo){
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attL[i]);
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
        if(ibo != null){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    }

    function createTexture(source, callback){
        let img = new Image();
        img.addEventListener('load', () => {
            let tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.bindTexture(gl.TEXTURE_2D, null);
            callback(tex);
        }, false);
        img.src = source;
    }

    function createFramebuffer(width, height){
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture};
    }

    function createFramebufferFloat(ext, width, height){
        if(ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)){
            console.log('float texture not support');
            return;
        }
        let flg = (ext.textureFloat != null) ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES;
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, texture: fTexture};
    }

    function getWebGLExtensions(){
        return {
            elementIndexUint: gl.getExtension('OES_element_index_uint'),
            textureFloat:     gl.getExtension('OES_texture_float'),
            textureHalfFloat: gl.getExtension('OES_texture_half_float')
        };
    }

    function setCanvasSize(){
        canvasWidth = canvasHeight = Math.min(window.innerWidth, window.innerHeight);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }
})();
