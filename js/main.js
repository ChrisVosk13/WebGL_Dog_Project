let gl;

let shaderProgram;
let cubeVertexPositionBuffer;
let cubeVertexColorBuffer;
let cubeVertexIndexBuffer;

// Declare matrices
let mvMatrix;
let pMatrix;

function main() {
    const canvas = document.getElementById("glcanvas");
    
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {}
    
    if (!gl) {
        alert("Could not initialize WebGL, sorry :-(");
        return;
    }

    // Safe initialization of the matrix variables
    const mat4 = window.mat4 || glMatrix.mat4;
    mvMatrix = mat4.create();
    pMatrix = mat4.create();

    // Dark blue background
    gl.clearColor(0.0, 0.0, 0.25, 1.0);
    gl.enable(gl.DEPTH_TEST); // Ensures the front faces hide the back faces!

    initShaders();
    initBuffers();
    drawScene();
}

// --- 1. DATA SETUP ---

// 24 vertices total (4 vertices per face, 6 faces)
// Edge length of 1, centered at (0,0,0) -> coordinates range from -0.5 to 0.5
const cubeVertices = [
    // Front face
    -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
    // Back face
    -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
    // Top face
    -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
    // Bottom face
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
    // Right face
     0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
    // Left face
    -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5
];

// 6 distinct colors for the 6 faces
const faceColors = [
    [1.0, 0.0, 0.0, 1.0], // Front: Red
    [0.0, 1.0, 0.0, 1.0], // Back: Green
    [0.0, 0.0, 1.0, 1.0], // Top: Blue
    [1.0, 1.0, 0.0, 1.0], // Bottom: Yellow
    [1.0, 0.0, 1.0, 1.0], // Right: Purple
    [0.0, 1.0, 1.0, 1.0]  // Left: Cyan
];

// Unpack the colors so every single vertex gets assigned its face's color
let cubeColors = [];
for (let i = 0; i < faceColors.length; i++) {
    let color = faceColors[i];
    for (let j = 0; j < 4; j++) {
        cubeColors = cubeColors.concat(color);
    }
}

// Map the 24 vertices into 12 triangles (2 triangles per face)
const cubeIndices = [
    0,  1,  2,      0,  2,  3,    // Front
    4,  5,  6,      4,  6,  7,    // Back
    8,  9,  10,     8,  10, 11,   // Top
    12, 13, 14,     12, 14, 15,   // Bottom
    16, 17, 18,     16, 18, 19,   // Right
    20, 21, 22,     20, 22, 23    // Left
];

// --- 2. SHADERS SETUP ---
function initShaders() {
    const vsSource = `
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        varying vec4 vColor;
        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor; // Pass the color to the fragment shader
        }
    `;

    const fsSource = `
        precision mediump float;
        varying vec4 vColor;
        void main(void) {
            gl_FragColor = vColor; // Apply the solid color
        }
    `;


    const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    gl.useProgram(shaderProgram);

    // Link attributes
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // Link uniforms
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

// --- 3. BUFFERS SETUP ---
function initBuffers() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeColors), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

// --- 4. DRAWING ---
function drawScene() {
    const mat4 = window.mat4 || glMatrix.mat4;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- ΒΗΜΑ 2: ΠΡΟΟΠΤΙΚΗ (Perspective) ---
    // Γωνία θέασης 60 μοιρών (σε ακτίνια), αναλογία 1, κοντινό 0.0001, μακρινό 9000
    mat4.perspective(pMatrix, 60 * Math.PI / 180, 1.0, 0.0001, 9000.0);

    // --- ΒΗΜΑ 2: ΘΕΣΗ ΚΑΜΕΡΑΣ (LookAt) ---
    // Κάμερα στο (9,9,9), κοιτάζει το (0,0,0), με τον άξονα z (0,0,1) προς τα επάνω
    mat4.identity(mvMatrix);
    mat4.lookAt(mvMatrix, [9, 9, 9], [0, 0, 0], [0, 0, 1]);

    // Σύνδεση των θέσεων των κορυφών
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Σύνδεση των χρωμάτων
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Σύνδεση των δεικτών (indices)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    // Αποστολή των πινάκων στην GPU (στους shaders)
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    // Σχεδίαση του κύβου!
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}