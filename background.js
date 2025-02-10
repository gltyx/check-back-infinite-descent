const canvas = document.getElementById('backgroundCanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (game.backgroundDisabled) {canvas.style.display = 'none';}
else {canvas.style.display = 'block';}

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;

    void main()
    {
        vec2 uv = -1.0 + 2.0*gl_FragCoord.xy / resolution.xy;
        uv.x *=  resolution.x / resolution.y;
        vec3 color = vec3(0.0);
        for( int i=0; i<128; i++ )
        {
            float pha =      sin(float(i)*546.13+1.0)*0.5 + 0.5;
            float siz = pow( sin(float(i)*651.74+5.0)*0.5 + 0.5, 4.0 );
            float pox =      sin(float(i)*321.55+4.1) * resolution.x / resolution.y;
            float rad = 0.1+0.5*siz+sin(pha+siz)/4.0;
            vec2  pos = vec2( pox+sin(time/15.+pha+siz), -1.0-rad + (2.0+2.0*rad)*mod(pha+0.3*(time/7.)*(0.2+0.8*siz),1.0));
            float dis = length( uv - pos );
            vec3  col = mix( vec3(0.194*sin(time/6.0)+0.3,0.2,0.3*pha), vec3(1.1*sin(time/9.0)+0.3,0.2*pha,0.4), 0.5+0.5*sin(float(i)));
            float f = length(uv-pos)/rad;
            f = sqrt(clamp(1.0+(sin((time)*siz)*0.5)*f,0.0,1.0));
            color += col.zyx *(1.0-smoothstep( rad*0.15, rad, dis ));
        }
        color *= sqrt(1.5-0.5*length(uv));
        gl_FragColor = vec4(color,1.0);
    }

`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        console.error('Shader source:', source);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Function to create and link a shader program
function createShaderProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    //if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    //    console.error('Error linking program:', gl.getProgramInfoLog(program));
    //    return null;
    //}
    
    return program;
}

const vertices = new Float32Array([
  -1, -1,
  1, -1,
  -1, 1,
  1, 1
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Function to initialize the shader program
function initShaderProgram() {
    shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    
    if (!shaderProgram) return;
    gl.useProgram(shaderProgram);
    const a_position = gl.getAttribLocation(shaderProgram, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'resolution');
    timeUniformLocation = gl.getUniformLocation(shaderProgram, 'time');
    //backgroundColor1UniformLocation = gl.getUniformLocation(shaderProgram, 'u_color1');
    //backgroundColor2UniformLocation = gl.getUniformLocation(shaderProgram, 'u_color2');
    //backgroundColor3UniformLocation = gl.getUniformLocation(shaderProgram, 'u_color3');
}

// Initialize shaders and buffer
initShaderProgram();    

let backgroundColor1 = [0.4,1,1];
let backgroundColor2  = [0,0.2,0.2];
let backgroundColor3  = [0.2,0,0.4];
function render(timestamp) {
    if (game.backgroundDisabled) {requestAnimationFrame(render); return;}
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform1f(timeUniformLocation, timestamp / 1000.0);
   // gl.uniform3f(backgroundColor1UniformLocation,  backgroundColor1[0], backgroundColor1[1], backgroundColor1[2]);
    //gl.uniform3f(backgroundColor2UniformLocation, backgroundColor2[0], backgroundColor2[1], backgroundColor2[2]);
    //gl.uniform3f(backgroundColor3UniformLocation, backgroundColor3[0], backgroundColor3[1], backgroundColor3[2]);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0,0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);

function enableDisableBackground() {
    game.backgroundDisabled = !game.backgroundDisabled;
    if (game.backgroundDisabled) {canvas.style.display = 'none';}
    else {canvas.style.display = 'block';}
}

function setBackgroundColors(a,b,c) {
    backgroundColor1 = a;
    backgroundColor2 = b;
    backgroundColor3 = c;
}
//setBackgroundColors([0.4,1,1],[0,0.2,0.2],[0.2,0,0.4]) //default
//setBackgroundColors([0,1,1],[0,1,1],[0,0,1]) //blue
//setBackgroundColors([1,1,0.4],[0.2,0.2,0],[0.4,0,0]) //Orange
//setBackgroundColors([1.8,0,2],[0,0,1],[1,0,1])//Purple