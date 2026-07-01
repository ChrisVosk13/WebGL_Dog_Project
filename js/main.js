let gl; 
let shaderProgram; 
let cubeVertexPositionBuffer; 
let cubeVertexIndexBuffer; 
let bodyVertexTextureCoordBuffer;  
let headVertexTextureCoordBuffer;  
let skyVertexTextureCoordBuffer;
let floorVertexTextureCoordBuffer;
let mvMatrix; 
let pMatrix; 
let bodyTexture; 
let headTexture; 
let skyTexture;  
let floorTexture; 
let isAnimating = false; 
let animAngle = 0.0; 
let animHeight = 2.0; 
let animHeightStep = 0.05; 
let animationRequestId; 
let mouseDown = false;
let lastMouseX = null;
let lastMouseY = null;
let useMouseControl = false;
let wheelTail = 0;
let wheelHead = 0;
let wheelRBLeg = 0;
let wheelLBLeg = 0;

function main() {     
    const canvas = document.getElementById("glcanvas");     
    try { gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); } catch (e) {}     
    if (!gl) { alert("Could not initialize WebGL"); return; }     
    const mat4 = window.mat4 || glMatrix.mat4;     
    mvMatrix = mat4.create();     
    pMatrix = mat4.create();     
    gl.clearColor(0.0, 0.0, 0.25, 1.0);     
    gl.enable(gl.DEPTH_TEST);      
    
    initShaders();     
    initBuffers();          
    
    bodyTexture = loadTexture(gl, 'assets/spots.png');     
    headTexture = loadTexture(gl, 'assets/dogface.png');   
    skyTexture = loadTexture(gl, 'assets/sky.png');
    floorTexture = loadTexture(gl, 'assets/floor.png');
    
    drawScene();     
    
    document.getElementById("redrawBtn").addEventListener("click", drawScene);     
    document.getElementById("startAnimBtn").addEventListener("click", function() {         
        if (!isAnimating) { isAnimating = true; animateScene(); }     
    });     
    document.getElementById("stopAnimBtn").addEventListener("click", function() {         
        isAnimating = false; cancelAnimationFrame(animationRequestId);     
    }); 
    document.getElementById("redrawBtnBottom").addEventListener("click", drawScene);
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    canvas.addEventListener('wheel', function(event) {
        event.preventDefault();
        let delta = event.deltaY > 0 ? 0.05 : -0.05; 
        
        if (document.getElementById("animPartTail").checked) wheelTail += delta;
        else if (document.getElementById("animPartHead").checked) wheelHead += delta;
        else if (document.getElementById("animPartRBLeg").checked) wheelRBLeg += delta;
        else if (document.getElementById("animPartLBLeg").checked) wheelLBLeg += delta;

        if (!isAnimating) drawScene(); 
    }, { passive: false });
}

function loadTexture(gl, url) {     
    const texture = gl.createTexture();     
    gl.bindTexture(gl.TEXTURE_2D, texture);     
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));     
    const image = new Image();     
    image.onload = function() {         
        gl.bindTexture(gl.TEXTURE_2D, texture);       
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);         
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);         
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);         
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);         
        drawScene();      
    };     
    image.src = url;     
    return texture; 
}

const cubeVertices = [     
    -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,     
    -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,      
    -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,      
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,       
     0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,      
    -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5  
];

const bodyTextureCoords = [     
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,     
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,     
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,     
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,     
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,     
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0  
];

// Mapper 2: Slices a portrait photo into thirds for the head requirements
const headTextureCoords = [
    
// Left-X, Bottom-Y  |  Right-X, Bottom-Y  |  Right-X, Top-Y  |  Left-X, Top-Y

    // 0: Top Face 
    0.20, 0.3,  0.80, 0.3,  0.80, 0.45,  0.20, 0.45,

    // 1: Bottom Face 
    0.20, 1.05,   0.20, 0.60,   0.80, 0.60,   0.80, 1.05,
        
    // 2: Front Face 
    0.65, 0.65,   0.65, 0.45,   0.40, 0.45,   0.40, 0.65,

    // 3: Back Face 
    1.0, 0.0,   1.0, 0.0,   1.0, 0.33,  1.0, 0.33,
    
    // 4: Right Face (Side Head Fur -> Solid color patch)
    0.0, 0.0,   0.0, 0.0,   0.0, 0.0,   0.0, 0.0,

    // 5: Left Face (Side Head Fur -> Solid color patch)
    0.0, 0.0,   0.0, 0.0,   0.0, 0.0,   0.0, 0.0,
];


const skyTextureCoords = [
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  0.0, 1.0,  1.0, 1.0,  1.0, 0.0,
    1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0,
    1.0, 0.0,  0.0, 0.0,  0.0, 1.0,  1.0, 1.0,
    0.0, 0.0,  0.0, 1.0,  1.0, 1.0,  1.0, 0.0
];

const floorTextureCoords = [
    0.0, 1.0,  1.0, 1.0,  1.0, 0.0,  0.0, 0.0,
    1.0, 1.0,  1.0, 0.0,  0.0, 0.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0
];

const cubeIndices = [     
    0, 1, 2,  0, 2, 3,  4, 5, 6,  4, 6, 7,  8, 9, 10,  8, 10, 11,     
    12, 13, 14,  12, 14, 15,  16, 17, 18,  16, 18, 19,  20, 21, 22,  20, 22, 23 
];

function initShaders() {     
    const vsSource = `         
        attribute vec3 aVertexPosition;         
        attribute vec2 aTextureCoord;         
        uniform mat4 uMVMatrix;         
        uniform mat4 uPMatrix;         
        varying vec2 vTextureCoord;         
        void main(void) {             
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);             
            vTextureCoord = aTextureCoord;         
        }     
    `;     
    const fsSource = `         
        precision mediump float;         
        varying vec2 vTextureCoord;         
        uniform sampler2D uSampler;         
        void main(void) {             
            gl_FragColor = texture2D(uSampler, vTextureCoord);         
        }     
    `;     
    const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);     
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);     
    shaderProgram = gl.createProgram();     
    gl.attachShader(shaderProgram, vertexShader);     
    gl.attachShader(shaderProgram, fragmentShader);     
    gl.linkProgram(shaderProgram);     
    gl.useProgram(shaderProgram);     
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");     
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);     
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");     
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);     
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");     
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");     
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler"); 
}

function compileShader(type, source) {     
    const shader = gl.createShader(type);     
    gl.shaderSource(shader, source);     
    gl.compileShader(shader);     
    return shader; 
}

function initBuffers() {     
    cubeVertexPositionBuffer = gl.createBuffer();     
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);     
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);     
    cubeVertexPositionBuffer.itemSize = 3;     
    cubeVertexPositionBuffer.numItems = 24;     
    
    bodyVertexTextureCoordBuffer = gl.createBuffer();     
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyVertexTextureCoordBuffer);     
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bodyTextureCoords), gl.STATIC_DRAW);     
    bodyVertexTextureCoordBuffer.itemSize = 2;     
    
    headVertexTextureCoordBuffer = gl.createBuffer();     
    gl.bindBuffer(gl.ARRAY_BUFFER, headVertexTextureCoordBuffer);     
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headTextureCoords), gl.STATIC_DRAW);     
    headVertexTextureCoordBuffer.itemSize = 2;     
    
    cubeVertexIndexBuffer = gl.createBuffer();     
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);     
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);     
    cubeVertexIndexBuffer.itemSize = 1;     
    cubeVertexIndexBuffer.numItems = 36; 
}

function drawComponent(translation, scale, texture, coordBuffer, rotAngle = 0, rotAxis = [1, 0, 0], pivot = [0, 0, 0]) {
    const mat4 = window.mat4 || glMatrix.mat4;
    let localMV = mat4.create();
    mat4.copy(localMV, mvMatrix);

    if (rotAngle !== 0) {
        // Μεταφορά στο σημείο περιστροφής (pivot)
        mat4.translate(localMV, localMV, pivot);
        // Περιστροφή γύρω από τον επιλεγμένο άξονα
        mat4.rotate(localMV, localMV, rotAngle * Math.PI / 180, rotAxis);
        // Επιστροφή από το pivot
        mat4.translate(localMV, localMV, [-pivot[0], -pivot[1], -pivot[2]]);
    }
    
    // Τοποθέτηση και κλιμάκωση του κομματιού
    mat4.translate(localMV, localMV, translation);
    mat4.scale(localMV, localMV, scale);
    
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, localMV);
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function animateScene() {     
    if (!isAnimating) return;     
    animAngle += 0.02;     
    animHeight += animHeightStep;     
    if (animHeight > 15.0 || animHeight < 2.0) {         
        animHeightStep = -animHeightStep;     
    }     
    drawScene();     
    animationRequestId = requestAnimationFrame(animateScene); 
}

function drawScene() {     
    const mat4 = window.mat4 || glMatrix.mat4;     
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);     
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     
    
    let viewAngle = parseFloat(document.getElementById("viewAngle").value) || 60;     
    let d = parseFloat(document.getElementById("camOrthoDistance").value) || 35;     
    let camPos = [d, d, d];      
    
    if (isAnimating || useMouseControl) {         
        camPos[0] = d * Math.cos(animAngle);          
        camPos[1] = d * Math.sin(animAngle);          
        camPos[2] = animHeight;     
    } else {         
        if (document.getElementById("LFT").checked) camPos = [-d, d, d];         
        if (document.getElementById("LFB").checked) camPos = [-d, d, -d];         
        if (document.getElementById("LBT").checked) camPos = [-d, -d, d];         
        if (document.getElementById("LBB").checked) camPos = [-d, -d, -d];         
        if (document.getElementById("RFT").checked) camPos = [d, d, d];         
        if (document.getElementById("RFB").checked) camPos = [d, d, -d];         
        if (document.getElementById("RBT").checked) camPos = [d, -d, d];         
        if (document.getElementById("RBB").checked) camPos = [d, -d, -d];     
    }     
    
    mat4.perspective(pMatrix, viewAngle * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.0001, 9000);     
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);     
    
    mat4.identity(mvMatrix);     
    mat4.lookAt(mvMatrix, camPos, [0, 0, 9], [0, 0, 1]);   
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);     
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);     
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);     
    
    // Υπολογισμός Γωνιών Περιστροφής με ημίτονο/συνημίτονο για την "ταλάντωση"
    let tailAngle = 45 * Math.sin(wheelTail) + 45; // 0 έως 90 μοίρες (πάνω κατακόρυφα -> κάτω)
    let headAngle = 90 * Math.sin(wheelHead);      // -90 έως +90 μοίρες (σύνολο 180 δεξιά-αριστερά)
    let rbLegAngle = 90 * Math.sin(wheelRBLeg);    // -90 έως +90 μοίρες (σύνολο 180 εμπρός-πίσω)
    let lbLegAngle = 90 * Math.sin(wheelLBLeg);    // -90 έως +90 μοίρες (σύνολο 180 εμπρός-πίσω)

    // (Τα στατικά αντικείμενα μένουν όπως είναι)
    drawComponent([0, 0, 0], [2000, 2000, 2000], skyTexture, bodyVertexTextureCoordBuffer);
    drawComponent([0, 0, -0.1], [60, 60, 0.2], floorTexture, bodyVertexTextureCoordBuffer);
    drawComponent([0, 0, 9], [8, 14, 6], bodyTexture, bodyVertexTextureCoordBuffer); // Κορμός

    // --- Κεφάλι, Λαιμός και Αυτιά (Άξονας Z, Pivot: Κέντρο βάσης λαιμού [0, 5, 12]) ---
    drawComponent([0, 5, 13.5], [2, 2, 3], bodyTexture, bodyVertexTextureCoordBuffer, headAngle, [0, 0, 1], [0, 5, 12]); 
    drawComponent([0, 7, 17], [6, 8, 4], headTexture, headVertexTextureCoordBuffer, headAngle, [0, 0, 1], [0, 5, 12]); 
    drawComponent([-4, 5, 17], [2, 2, 4], bodyTexture, bodyVertexTextureCoordBuffer, headAngle, [0, 0, 1], [0, 5, 12]); 
    drawComponent([ 4, 5, 17], [2, 2, 4], bodyTexture, bodyVertexTextureCoordBuffer, headAngle, [0, 0, 1], [0, 5, 12]); 

    // --- Ουρά (Άξονας X, Pivot: Πίσω ακμή βάσης [0, -7, 12]) ---
    drawComponent([0, -6, 14], [2, 2, 4], bodyTexture, bodyVertexTextureCoordBuffer, tailAngle, [1, 0, 0], [0, -7, 12]);

    // --- Αριστερό Πίσω Πόδι & Πατούσα (Άξονας X, Pivot: Μέσο πάνω όψης [-4.5, -5.5, 6]) ---
    drawComponent([-4.5, -5.5, 4], [2, 3, 4], bodyTexture, bodyVertexTextureCoordBuffer, lbLegAngle, [1, 0, 0], [-4.5, -5.5, 6]); 
    drawComponent([-4.5, -5.5, 1], [3, 5, 2], bodyTexture, bodyVertexTextureCoordBuffer, lbLegAngle, [1, 0, 0], [-4.5, -5.5, 6]); 

    // --- Δεξί Πίσω Πόδι & Πατούσα (Άξονας X, Pivot: Μέσο πάνω όψης [4.5, -5.5, 6]) ---
    drawComponent([ 4.5, -5.5, 4], [2, 3, 4], bodyTexture, bodyVertexTextureCoordBuffer, rbLegAngle, [1, 0, 0], [4.5, -5.5, 6]); 
    drawComponent([ 4.5, -5.5, 1], [3, 5, 2], bodyTexture, bodyVertexTextureCoordBuffer, rbLegAngle, [1, 0, 0], [4.5, -5.5, 6]); 

    // --- Μπροστινά Πόδια (Σταθερά σε αυτό το βήμα) ---
    drawComponent([-4.5,  5.5, 4], [2, 3, 4], bodyTexture, bodyVertexTextureCoordBuffer); 
    drawComponent([-4.5,  5.5, 1], [3, 5, 2], bodyTexture, bodyVertexTextureCoordBuffer); 
    drawComponent([ 4.5,  5.5, 4], [2, 3, 4], bodyTexture, bodyVertexTextureCoordBuffer); 
    drawComponent([ 4.5,  5.5, 1], [3, 5, 2], bodyTexture, bodyVertexTextureCoordBuffer);  
}

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    useMouseControl = true;
}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    
    let newX = event.clientX;
    let newY = event.clientY;

    let deltaX = newX - lastMouseX;
    let deltaY = newY - lastMouseY;
    animAngle -= deltaX / 100.0;
    animHeight += deltaY / 50.0;

    lastMouseX = newX;
    lastMouseY = newY;

    drawScene();
}