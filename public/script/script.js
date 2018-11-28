
(() => {
    let canvas, canvasWidth, canvasHeight;
    let gl, ext, run, mode = 0;
    let mouse = [0.0, 0.0];
    let textures = [];
    let mat = new matIV();
    let audio = new gl3Audio(0.3, 0.5);

    let scenePrg;
    let resetPrg;
    let pastePrg;
    let lowresPrg;
    let graphPrg;
    let positionPrg;
    let velocityPrg;

    const DEBUG_MODE = true;

    const POINT_RESOLUTION       = 32;
    const POINT_SIZE             = 5.0;
    const POINT_COLOR            = [1.0, 0.3, 0.8, 0.25];
    const POSITION_BUFFER_INDEX  = 1;
    const VELOCITY_BUFFER_INDEX  = 3;
    const FRAMEBUFFER_RESOLUTION = 128;

    window.addEventListener('load', () => {
        canvas = document.getElementById('canvas');
        setCanvasSize();

        gl = canvas.getContext('webgl');
        ext = getWebGLExtensions();

        // events
        window.addEventListener('resize', setCanvasSize, false);
        if(DEBUG_MODE === true){
            canvas.addEventListener('mousemove', (eve) => {
                let x = (eve.clientX / canvasWidth) * 2.0 - 1.0;
                let y = (eve.clientY / canvasHeight) * 2.0 - 1.0;
                mouse = [x, -y];
                // console.log(mouse);
            }, false);
            window.addEventListener('keydown', (eve) => {
                run = eve.key !== 'Escape';
                if(run !== true){
                    // audio.src[0].stop();
                }
                if(eve.key === 'Enter'){
                    mode = (mode + 1) % 2;
                }
            }, false);
        }

        createTexture('./image/lenna.jpg', (textureObject) => {
            textures[0] = textureObject;
            loadShaderSource(
                './shader/scene.vert',
                './shader/scene.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    scenePrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
            loadShaderSource(
                './shader/reset.vert',
                './shader/reset.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    resetPrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
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
                './shader/lowres.vert',
                './shader/lowres.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    lowresPrg = new ProgramParameter(prg);
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
            loadShaderSource(
                './shader/position.vert',
                './shader/position.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    positionPrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
            loadShaderSource(
                './shader/velocity.vert',
                './shader/velocity.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    velocityPrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
        });
        function loadCheck(){
            if(
                scenePrg != null &&
                resetPrg != null &&
                pastePrg != null &&
                lowresPrg != null &&
                graphPrg != null &&
                positionPrg != null &&
                velocityPrg != null &&
                true
            ){loadSound();}
        }
    }, false);

    function loadSound(){
        audio.load('sound/background.mp3', 0, true, true, init);
    }

    function init(){
        scenePrg.attLocation[0] = gl.getAttribLocation(scenePrg.program, 'texCoord');
        scenePrg.attStride[0]   = 2;
        scenePrg.uniLocation[0] = gl.getUniformLocation(scenePrg.program, 'mvpMatrix');
        scenePrg.uniLocation[1] = gl.getUniformLocation(scenePrg.program, 'pointSize');
        scenePrg.uniLocation[2] = gl.getUniformLocation(scenePrg.program, 'positionTexture');
        scenePrg.uniLocation[3] = gl.getUniformLocation(scenePrg.program, 'globalColor');
        scenePrg.uniType[0]     = 'uniformMatrix4fv';
        scenePrg.uniType[1]     = 'uniform1f';
        scenePrg.uniType[2]     = 'uniform1i';
        scenePrg.uniType[3]     = 'uniform4fv';

        resetPrg.attLocation[0] = gl.getAttribLocation(resetPrg.program, 'position');
        resetPrg.attStride[0]   = 3;
        resetPrg.uniLocation[0] = gl.getUniformLocation(resetPrg.program, 'resolution');
        resetPrg.uniType[0]     = 'uniform2fv';

        pastePrg.attLocation[0] = gl.getAttribLocation(pastePrg.program, 'position');
        pastePrg.attLocation[1] = gl.getAttribLocation(pastePrg.program, 'texCoord');
        pastePrg.attStride[0]   = 3;
        pastePrg.attStride[1]   = 2;
        pastePrg.uniLocation[0] = gl.getUniformLocation(pastePrg.program, 'resolution');
        pastePrg.uniLocation[1] = gl.getUniformLocation(pastePrg.program, 'mouse');
        pastePrg.uniLocation[2] = gl.getUniformLocation(pastePrg.program, 'globalTime');
        pastePrg.uniLocation[3] = gl.getUniformLocation(pastePrg.program, 'imageTexture');
        pastePrg.uniLocation[4] = gl.getUniformLocation(pastePrg.program, 'sceneTexture');
        pastePrg.uniType[0]     = 'uniform2fv';
        pastePrg.uniType[1]     = 'uniform2fv';
        pastePrg.uniType[2]     = 'uniform1f';
        pastePrg.uniType[3]     = 'uniform1i';
        pastePrg.uniType[4]     = 'uniform1i';

        lowresPrg.attLocation[0] = gl.getAttribLocation(lowresPrg.program, 'position');
        lowresPrg.attLocation[1] = gl.getAttribLocation(lowresPrg.program, 'texCoord');
        lowresPrg.attStride[0]   = 3;
        lowresPrg.attStride[1]   = 2;
        lowresPrg.uniLocation[0] = gl.getUniformLocation(lowresPrg.program, 'imageTexture');
        lowresPrg.uniType[0]     = 'uniform1i';

        graphPrg.attLocation[0] = gl.getAttribLocation(graphPrg.program, 'position');
        graphPrg.attLocation[1] = gl.getAttribLocation(graphPrg.program, 'texCoord');
        graphPrg.attStride[0]   = 3;
        graphPrg.attStride[1]   = 2;
        graphPrg.uniLocation[0] = gl.getUniformLocation(graphPrg.program, 'resolution');
        graphPrg.uniLocation[1] = gl.getUniformLocation(graphPrg.program, 'time');
        graphPrg.uniType[0]     = 'uniform2fv';
        graphPrg.uniType[1]     = 'uniform1f';

        positionPrg.attLocation[0] = gl.getAttribLocation(positionPrg.program, 'position');
        positionPrg.attStride[0]   = 3;
        positionPrg.uniLocation[0] = gl.getUniformLocation(positionPrg.program, 'prevTexture');
        positionPrg.uniLocation[1] = gl.getUniformLocation(positionPrg.program, 'velocityTexture');
        positionPrg.uniLocation[2] = gl.getUniformLocation(positionPrg.program, 'resolution');
        positionPrg.uniLocation[3] = gl.getUniformLocation(positionPrg.program, 'move');
        positionPrg.uniType[0]     = 'uniform1i';
        positionPrg.uniType[1]     = 'uniform1i';
        positionPrg.uniType[2]     = 'uniform2fv';
        positionPrg.uniType[3]     = 'uniform1i';

        velocityPrg.attLocation[0] = gl.getAttribLocation(velocityPrg.program, 'position');
        velocityPrg.attStride[0]   = 3;
        velocityPrg.uniLocation[0] = gl.getUniformLocation(velocityPrg.program, 'prevTexture');
        velocityPrg.uniLocation[1] = gl.getUniformLocation(velocityPrg.program, 'positionTexture');
        velocityPrg.uniLocation[2] = gl.getUniformLocation(velocityPrg.program, 'resolution');
        velocityPrg.uniLocation[3] = gl.getUniformLocation(velocityPrg.program, 'time');
        velocityPrg.uniLocation[4] = gl.getUniformLocation(velocityPrg.program, 'move');
        velocityPrg.uniLocation[5] = gl.getUniformLocation(velocityPrg.program, '');
        velocityPrg.uniType[0]     = 'uniform1i';
        velocityPrg.uniType[1]     = 'uniform1i';
        velocityPrg.uniType[2]     = 'uniform2fv';
        velocityPrg.uniType[3]     = 'uniform1f';
        velocityPrg.uniType[4]     = 'uniform1i';
        velocityPrg.uniType[5]     = 'uniform2fv';

        let pointTexCoord = [];
        for(let i = 0; i < POINT_RESOLUTION; ++i){
            let t = i / POINT_RESOLUTION;
            for(let j = 0; j < POINT_RESOLUTION; ++j){
                let s = j / POINT_RESOLUTION;
                pointTexCoord.push(s, t);
            }
        }
        let pointVBO = [createVbo(pointTexCoord)];

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

        // matrix
        let mMatrix      = mat.identity(mat.create());
        let vMatrix      = mat.identity(mat.create());
        let pMatrix      = mat.identity(mat.create());
        let vpMatrix     = mat.identity(mat.create());
        let mvpMatrix    = mat.identity(mat.create());
        mat.lookAt([0.0, 0.0, 8.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
        mat.perspective(60, canvasWidth / canvasHeight, 0.1, 20.0, pMatrix);
        mat.multiply(pMatrix, vMatrix, vpMatrix);

        // framebuffer
        let positionFramebuffers = [
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION),
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION)
        ];
        let velocityFramebuffers = [
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION),
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION)
        ];
        let outFramebuffer = createFramebuffer(FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION);
        let lowresFramebuffer = createFramebuffer(FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION);

        // textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.activeTexture(gl.TEXTURE0 + POSITION_BUFFER_INDEX);
        gl.bindTexture(gl.TEXTURE_2D, positionFramebuffers[0].texture);
        gl.activeTexture(gl.TEXTURE0 + POSITION_BUFFER_INDEX + 1);
        gl.bindTexture(gl.TEXTURE_2D, positionFramebuffers[1].texture);
        gl.activeTexture(gl.TEXTURE0 + VELOCITY_BUFFER_INDEX);
        gl.bindTexture(gl.TEXTURE_2D, velocityFramebuffers[0].texture);
        gl.activeTexture(gl.TEXTURE0 + VELOCITY_BUFFER_INDEX + 1);
        gl.bindTexture(gl.TEXTURE_2D, velocityFramebuffers[1].texture);
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, outFramebuffer.texture);
        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, lowresFramebuffer.texture);

        // reset framebuffers
        gl.useProgram(resetPrg.program);
        gl[resetPrg.uniType[0]](resetPrg.uniLocation[0], [POINT_RESOLUTION, POINT_RESOLUTION]);
        setAttribute(planeVBO, resetPrg.attLocation, resetPrg.attStride, planeIBO);
        gl.viewport(0, 0, POINT_RESOLUTION, POINT_RESOLUTION);
        for(let i = 0; i <= 1; ++i){
            // position buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, positionFramebuffers[i].framebuffer);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);
            // velocity buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFramebuffers[i].framebuffer);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);
        }

        // lowres framebuffer
        gl.useProgram(lowresPrg.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, lowresFramebuffer.framebuffer);
        gl.viewport(0, 0, FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION);
        setAttribute(planeTexCoordVBO, lowresPrg.attLocation, lowresPrg.attStride, planeIBO);
        gl[lowresPrg.uniType[0]](lowresPrg.uniLocation[0], 0);
        gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);

        // flags
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);

        // setting
        let startTime = Date.now();
        let nowTime = 0;
        let loopCount = 0;
        run = true;
        render();

        // audio.src[0].play();

        function render(){
            // update sound ---------------------------------------------------
            audio.src[0].update = true;
            let soundData = 1.0;
            for(let i = 0; i < 16; ++i){
                soundData += (audio.src[0].onData[i] / 255.0) * 0.1;
            }
            // let isMouseDown = soundData > 1.8;
            let isMouseDown = true;

            nowTime = (Date.now() - startTime) / 1000;
            ++loopCount;
            let targetBufferIndex = loopCount % 2;
            let prevBufferIndex = 1 - targetBufferIndex;

            // update gpgpu buffers -------------------------------------------
            gl.disable(gl.BLEND);
            gl.viewport(0, 0, POINT_RESOLUTION, POINT_RESOLUTION);
            // velocity update
            gl.useProgram(velocityPrg.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFramebuffers[targetBufferIndex].framebuffer);
            setAttribute(planeVBO, velocityPrg.attLocation, velocityPrg.attStride, planeIBO);
            gl[velocityPrg.uniType[0]](velocityPrg.uniLocation[0], VELOCITY_BUFFER_INDEX + prevBufferIndex);
            gl[velocityPrg.uniType[1]](velocityPrg.uniLocation[1], POSITION_BUFFER_INDEX + prevBufferIndex);
            gl[velocityPrg.uniType[2]](velocityPrg.uniLocation[2], [POINT_RESOLUTION, POINT_RESOLUTION]);
            gl[velocityPrg.uniType[3]](velocityPrg.uniLocation[3], nowTime);
            gl[velocityPrg.uniType[4]](velocityPrg.uniLocation[4], isMouseDown);
            gl[velocityPrg.uniType[5]](velocityPrg.uniLocation[5], [0.0, 0.0]);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);
            // position update
            gl.useProgram(positionPrg.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, positionFramebuffers[targetBufferIndex].framebuffer);
            setAttribute(planeVBO, positionPrg.attLocation, positionPrg.attStride, planeIBO);
            gl[positionPrg.uniType[0]](positionPrg.uniLocation[0], POSITION_BUFFER_INDEX + prevBufferIndex);
            gl[positionPrg.uniType[1]](positionPrg.uniLocation[1], VELOCITY_BUFFER_INDEX + targetBufferIndex);
            gl[positionPrg.uniType[2]](positionPrg.uniLocation[2], [POINT_RESOLUTION, POINT_RESOLUTION]);
            gl[positionPrg.uniType[3]](positionPrg.uniLocation[3], isMouseDown);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);

            // render to final scene ------------------------------------------
            gl.enable(gl.BLEND);
            gl.bindFramebuffer(gl.FRAMEBUFFER, outFramebuffer.framebuffer);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION);

            // push and render
            switch(mode){
                case 0:
                    gl.useProgram(scenePrg.program);
                    setAttribute(pointVBO, scenePrg.attLocation, scenePrg.attStride);
                    mat.identity(mMatrix);
                    mat.scale(mMatrix, [soundData, soundData, soundData], mMatrix);
                    mat.multiply(vpMatrix, mMatrix, mvpMatrix);
                    gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], false, mvpMatrix);
                    gl[scenePrg.uniType[1]](scenePrg.uniLocation[1], POINT_SIZE);
                    gl[scenePrg.uniType[2]](scenePrg.uniLocation[2], POSITION_BUFFER_INDEX + targetBufferIndex);
                    gl[scenePrg.uniType[3]](scenePrg.uniLocation[3], POINT_COLOR);
                    gl.drawArrays(gl.POINTS, 0, POINT_RESOLUTION * POINT_RESOLUTION);
                    break;
                case 1:
                    gl.useProgram(graphPrg.program);
                    setAttribute(planeTexCoordVBO, graphPrg.attLocation, graphPrg.attStride, planeIBO);
                    gl[graphPrg.uniType[0]](graphPrg.uniLocation[0], [FRAMEBUFFER_RESOLUTION, FRAMEBUFFER_RESOLUTION]);
                    gl[graphPrg.uniType[1]](graphPrg.uniLocation[1], nowTime);
                    gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);
                    break;
            }

            // render to canvas -----------------------------------------------
            gl.disable(gl.BLEND);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.useProgram(pastePrg.program);
            gl.viewport(0, 0, canvasWidth, canvasHeight);
            setAttribute(planeTexCoordVBO, pastePrg.attLocation, pastePrg.attStride, planeIBO);
            gl[pastePrg.uniType[0]](pastePrg.uniLocation[0], [canvasWidth, canvasHeight]);
            gl[pastePrg.uniType[1]](pastePrg.uniLocation[1], mouse);
            gl[pastePrg.uniType[2]](pastePrg.uniLocation[2], nowTime);
            gl[pastePrg.uniType[3]](pastePrg.uniLocation[3], 6);
            gl[pastePrg.uniType[4]](pastePrg.uniLocation[4], 5);
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
