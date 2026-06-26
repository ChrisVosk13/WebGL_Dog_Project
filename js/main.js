let gl;

let shaderProgram;
let cubeVertexPositionBuffer;
let cubeVertexIndexBuffer;

<<<<<<< HEAD
// Matrices for 3D viewing and projection
=======
// Πίνακες για την 3D προβολή και την κάμερα
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
let mvMatrix;
let pMatrix;

// --- PHASE 6: Animation Variables ---
let isAnimating = false;
let animAngle = 0.0;
let animHeight = 2.0;
let animHeightStep = 0.05;
let animationRequestId;

function main() {
    const canvas = document.getElementById("glcanvas");
    
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {}
    
    if (!gl) {
        alert("Could not initialize WebGL, sorry :-(");
        return;
    }

    // Ασφαλής αρχικοποίηση των πινάκων της glMatrix
    const mat4 = window.mat4 || glMatrix.mat4;
    mvMatrix = mat4.create();
    pMatrix = mat4.create();

<<<<<<< HEAD
    // Set the background color to dark blue
    gl.clearColor(0.0, 0.0, 0.25, 1.0);
    gl.enable(gl.DEPTH_TEST); 
=======
    // Βήμα 1: Σκούρα απόχρωση του μπλε για το φόντο
    gl.clearColor(0.0, 0.0, 0.25, 1.0);
    gl.enable(gl.DEPTH_TEST); // Ενεργοποίηση depth test για σωστή απόκρυψη των πίσω όψεων
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf

    initShaders();
    initBuffers();
    drawScene();

<<<<<<< HEAD
    // --- EVENT LISTENERS FOR HTML BUTTONS ---
=======
    // Βήμα 4: Σύνδεση του Redraw button με τη drawScene
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
    document.getElementById("redrawBtn").addEventListener("click", drawScene);

    // PHASE 6: Animation Listeners
    document.getElementById("startAnimBtn").addEventListener("click", function() {
        if (!isAnimating) {
            isAnimating = true;
            animateScene();
        }
    });

    document.getElementById("stopAnimBtn").addEventListener("click", function() {
        isAnimating = false;
        cancelAnimationFrame(animationRequestId);
    });
}

<<<<<<< HEAD
// --- BASE CUBE DATA (Edge 1, Centered at 0,0,0) ---
=======
// --- ΔΕΔΟΜΕΝΑ ΚΥΒΟΥ ΒΑΣΗΣ (Ακμή 1, κέντρο στο 0,0,0) ---
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
const cubeVertices = [
    // Μπροστινή όψη
    -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
    // Πίσω όψη
    -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
    // Πάνω όψη
    -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
    // Κάτω όψη
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
    // Δεξιά όψη
     0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
    // Αριστερή όψη
    -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5
];

const cubeIndices = [
    0,  1,  2,      0,  2,  3,    // Μπροστά
    4,  5,  6,      4,  6,  7,    // Πίσω
    8,  9,  10,     8,  10, 11,   // Πάνω
    12, 13, 14,     12, 14, 15,   // Κάτω
    16, 17, 18,     16, 18, 19,   // Δεξιά
    20, 21, 22,     20, 22, 23    // Αριστερά
];

// --- SHADERS ---
function initShaders() {
    const vsSource = `
        attribute vec3 aVertexPosition;
        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
        }
    `;

    // Fragment shader uses a uniform color variable now
    const fsSource = `
        precision mediump float;
        uniform vec4 uColor;
        void main(void) {
            gl_FragColor = uColor;
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

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor"); 
}

function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

// --- BUFFERS ---
function initBuffers() {
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

<<<<<<< HEAD
// --- HELPER FUNCTION: DRAW DOG COMPONENT ---
// Takes translation, scaling, and color arrays to draw a specific body part
=======
// --- ΣΥΝΑΡΤΗΣΗ ΣΧΕΔΙΑΣΗΣ ΜΕΛΟΥΣ ---
// Παίρνει τη μετατόπιση, την κλιμάκωση και το χρώμα και σχεδιάζει ένα τμήμα του σκύλου
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
function drawComponent(translation, scale, color) {
    const mat4 = window.mat4 || glMatrix.mat4;
    
    let localMV = mat4.create();
<<<<<<< HEAD
    mat4.copy(localMV, mvMatrix); // Copy the master camera matrix
    
    // Apply transformations
    mat4.translate(localMV, localMV, translation);
    mat4.scale(localMV, localMV, scale); 
    
    // Send to Shaders
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, localMV);
    gl.uniform4fv(shaderProgram.colorUniform, color);
    
    // Draw this specific cube
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

// --- PHASE 6: ANIMATION LOOP ---
function animateScene() {
    if (!isAnimating) return;

    // Spin the camera
    animAngle += 0.02;

    // Bob the camera up and down in a spiral
    animHeight += animHeightStep;
    if (animHeight > 15.0 || animHeight < 2.0) {
        animHeightStep = -animHeightStep; // Reverse direction
    }

    drawScene();
    
    animationRequestId = requestAnimationFrame(animateScene);
}

// --- DRAW FULL SCENE (PHASE 5 + PHASE 6) ---
=======
    mat4.copy(localMV, mvMatrix); // Αντιγραφή του βασικού πίνακα της κάμερας
    
    // Εφαρμογή μετασχηματισμών
    mat4.translate(localMV, localMV, translation);
    mat4.scale(localMV, localMV, scale); 
    
    // Αποστολή στους Shaders
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, localMV);
    gl.uniform4fv(shaderProgram.colorUniform, color);
    
    // Σχεδίαση του συγκεκριμένου κύβου
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

// --- ΚΥΡΙΑ ΣΧΕΔΙΑΣΗ ΣΚΗΝΗΣ (ΒΗΜΑ 5) ---
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
function drawScene() {
    const mat4 = window.mat4 || glMatrix.mat4;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

<<<<<<< HEAD
    // Read UI values
    let viewAngle = parseFloat(document.getElementById("viewAngle").value) || 60;
    let d = parseFloat(document.getElementById("camOrthoDistance").value) || 35;

    let camPos = [d, d, d]; // Default

    // PHASE 6: Dynamic camera position if animating, else use radio buttons
    if (isAnimating) {
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

    // Set Perspective Matrix
    mat4.perspective(pMatrix, viewAngle * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.0001, d * 15);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

    // Set Master Camera Matrix (looking at origin)
    mat4.identity(mvMatrix);
    mat4.lookAt(mvMatrix, camPos, [0, 0, 0], [0, 0, 1]);

    // Bind common buffers
=======
    // Ανάγνωση τιμών από το UI
    let viewAngle = parseFloat(document.getElementById("viewAngle").value) || 60;
    let d = parseFloat(document.getElementById("camOrthoDistance").value) || 9;

    // Υπολογισμός θέσης κάμερας βάσει των Radio Buttons (Βήμα 3 & 4)
    let camPos = [d, d, d];
    if (document.getElementById("LFT").checked) camPos = [-d, d, d];
    if (document.getElementById("LFB").checked) camPos = [-d, d, -d];
    if (document.getElementById("LBT").checked) camPos = [-d, -d, d];
    if (document.getElementById("LBB").checked) camPos = [-d, -d, -d];
    if (document.getElementById("RFT").checked) camPos = [d, d, d];
    if (document.getElementById("RFB").checked) camPos = [d, d, -d];
    if (document.getElementById("RBT").checked) camPos = [d, -d, d];
    if (document.getElementById("RBB").checked) camPos = [d, -d, -d];

    // Ορισμός Προοπτικής με παραμετρικό μακρινό κατώφλι (d * 15) ώστε να φαίνεται όλη η σκηνή
    mat4.perspective(pMatrix, viewAngle * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.0001, d * 15);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

    // Αρχικοποίηση κάμερας με lookAt (Κορυφή προς Z+)
    mat4.identity(mvMatrix);
    mat4.lookAt(mvMatrix, camPos, [0, 0, 0], [0, 0, 1]);

    // Σύνδεση κοινών buffers γεωμετρίας
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

<<<<<<< HEAD
    // --- PHASE 5: COLOR PALETTE ---
=======
    // --- ΠΑΛΕΤΑ ΧΡΩΜΑΤΩΝ (Βήμα 5: Αποχρώσεις του κόκκινου και του κίτρινου) ---
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
    const redTorso  = [0.75, 0.15, 0.15, 1.0];
    const redNeck   = [0.65, 0.12, 0.12, 1.0];
    const redHead   = [0.85, 0.20, 0.20, 1.0];
    const yelLimb   = [0.90, 0.75, 0.15, 1.0];
    const yelPaw    = [0.80, 0.65, 0.10, 1.0];
    const yelEarTail= [0.95, 0.85, 0.20, 1.0];

<<<<<<< HEAD
    // --- PHASE 5: ASSEMBLE THE DOG ---
    // Ground is z=0, the paws bounding box center is at (0,0,0)

    // 1. Torso
    drawComponent([0, 0, 9], [8, 14, 6], redTorso);

    // 2. Neck
    drawComponent([0, 5, 13.5], [2, 2, 3], redNeck);

    // 3. Head
    drawComponent([0, 4, 17], [6, 8, 4], redHead);

    // 4. Ears
    drawComponent([-4, 2, 17], [2, 2, 4], yelEarTail); // Left
    drawComponent([ 4, 2, 17], [2, 2, 4], yelEarTail); // Right

    // 5. Tail
    drawComponent([0, -6, 14], [2, 2, 4], yelEarTail);

    // 6. Paws (Resting on z=0 to z=2)
    drawComponent([-4.5, -5.5, 1], [3, 5, 2], yelPaw); // Back Left
    drawComponent([ 4.5, -5.5, 1], [3, 5, 2], yelPaw); // Back Right
    drawComponent([-4.5,  5.5, 1], [3, 5, 2], yelPaw); // Front Left
    drawComponent([ 4.5,  5.5, 1], [3, 5, 2], yelPaw); // Front Right

    // 7. Legs
    drawComponent([-4.5, -5.5, 4], [2, 3, 4], yelLimb); // Back Left
    drawComponent([ 4.5, -5.5, 4], [2, 3, 4], yelLimb); // Back Right
    drawComponent([-4.5,  5.5, 4], [2, 3, 4], yelLimb); // Front Left
    drawComponent([ 4.5,  5.5, 4], [2, 3, 4], yelLimb); // Front Right
=======
    // --- ΣΥΝΑΡΜΟΛΟΓΗΣΗ ΤΟΥ ΣΚΥΛΟΥ ---
    // Οι συντεταγμένες υπολογίστηκαν ώστε οι πατούσες να πατάνε στο z=0 
    // και η βάση να εκτείνεται ακριβώς από το (-6, -8, 0) έως το (6, 8, 0)

    // 1. Κορμός (Torso): Πλάτος(X)=8, Μήκος(Y)=14, Ύψος(Z)=6. Ξεκινάει πάνω από τα πόδια (z=6)
    drawComponent([0, 0, 9], [8, 14, 6], redTorso);

    // 2. Λαιμός (Neck): Πλάτος=2, Μήκος=2, Ύψος=3. Τοποθετημένος μπροστά και πάνω στον κορμό
    drawComponent([0, 5, 13.5], [2, 2, 3], redNeck);

    // 3. Κεφάλι (Head): Πλάτος=6, Μήκος=8, Ύψος=4. Πάνω στο λαιμό, εκτείνεται προς τα εμπρός
    drawComponent([0, 4, 17], [6, 8, 4], redHead);

    // 4. Αυτιά (Ears): Πλάτος=2, Μήκος=2, Ύψος=4. Στα πλαϊνά του κεφαλιού
    drawComponent([-4, 2, 17], [2, 2, 4], yelEarTail); // Αριστερό Αυτί
    drawComponent([ 4, 2, 17], [2, 2, 4], yelEarTail); // Δεξί Αυτί

    // 5. Ουρά (Tail): Πλάτος=2, Μήκος=2, Ύψος=4. Στο πίσω-πάνω μέρος του κορμού
    drawComponent([0, -6, 14], [2, 2, 4], yelEarTail);

    // 6. Πατούσες (Paws): Πλάτος=3, Μήκος=5, Ύψος=2. Πατάνε στο έδαφος (z=0 έως z=2)
    drawComponent([-4.5, -5.5, 1], [3, 5, 2], yelPaw); // Πίσω Αριστερή
    drawComponent([ 4.5, -5.5, 1], [3, 5, 2], yelPaw); // Πίσω Δεξιά
    drawComponent([-4.5,  5.5, 1], [3, 5, 2], yelPaw); // Μπροστά Αριστερή
    drawComponent([ 4.5,  5.5, 1], [3, 5, 2], yelPaw); // Μπροστά Δεξιά

    // 7. Πόδια (Legs): Πλάτος=2, Μήκος=3, Ύψος=4. Συνδέουν τις πατούσες με τον κορμό (z=2 έως z=6)
    drawComponent([-4.5, -5.5, 4], [2, 3, 4], yelLimb); // Πίσω Αριστερό Πόδι
    drawComponent([ 4.5, -5.5, 4], [2, 3, 4], yelLimb); // Πίσω Δεξί Πόδι
    drawComponent([-4.5,  5.5, 4], [2, 3, 4], yelLimb); // Μπροστά Αριστερό Πόδι
    drawComponent([ 4.5,  5.5, 4], [2, 3, 4], yelLimb); // Μπροστά Δεξί Πόδι
>>>>>>> 02e26177efed2f1a1b17269bda42b17cb3919caf
}