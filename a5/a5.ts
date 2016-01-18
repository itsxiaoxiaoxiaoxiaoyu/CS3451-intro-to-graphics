///<reference path='./typings/tsd.d.ts'/>
///<reference path="./localTypings/webglutils.d.ts"/>
//get start by stuff not in shaders
//
/*
 * Portions of this code are
 * Copyright 2015, Blair MacIntyre.
 * 
 * Portions of this code taken from http://webglfundamentals.org, at https://github.com/greggman/webgl-fundamentals
 * and are subject to the following license.  In particular, from 
 *    http://webglfundamentals.org/webgl/webgl-less-code-more-fun.html
 *    http://webglfundamentals.org/webgl/resources/primitives.js
 * 
 * Those portions Copyright 2014, Gregg Tavares.
 * All rights reserved.
 */

import loader = require('./loader');

////////////////////////////////////////////////////////////////////////////////////////////
// stats module by mrdoob (https://github.com/mrdoob/stats.js) to show the performance 

////////////////////////////////////////////////////////////////////////////////////////////
// utilities
var rand = function(min: number, max?: number) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

var randInt = function(range) {
  return Math.floor(Math.random() * range);
};

////////////////////////////////////////////////////////////////////////////////////////////
// get some of our canvas elements that we need
var canvas = <HTMLCanvasElement>document.getElementById("webgl");  

////////////////////////////////////////////////////////////////////////////////////////////
// some simple interaction using the mouse.
// we are going to get small motion offsets of the mouse, and use these to rotate the object
//
// our offset() function from assignment 0, to give us a good mouse position in the canvas 
function offset(e: MouseEvent): GLM.IArray {
    e = e || <MouseEvent> window.event;

    var target = <Element> e.target || e.srcElement,
        rect = target.getBoundingClientRect(),
        offsetX = e.clientX - rect.left,
        offsetY = e.clientY - rect.top;

    return vec2.fromValues(offsetX, offsetY);
}
var mouseDown = undefined;
var pressFromKeyboard = undefined;
// the amount the mouse has moved // angle offset corresponding to mouse movement

// start things off with a down press
canvas.onmousedown = (ev: MouseEvent) => {
  mouseDown = offset(ev);
}

// stop things with a mouse release

// if we're moving and the mouse is down        
document.onkeypress = (ev:KeyboardEvent) => {
  pressFromKeyboard = ev.keyCode;
  if (ev.keyCode == 32) {
    ev.preventDefault();
  }
  var effect = new Howl({
    urls: ['sounds/typing.mp3']
  }).play();
}
document.onkeydown = (ev: KeyboardEvent) => {
  pressFromKeyboard = ev.keyCode;
  if (ev.keyCode == 8) {
    ev.preventDefault();
  }
}
// stop things if you move out of the window

////////////////////////////////////////////////////////////////////////////////////////////
// start things off by calling initWebGL
initWebGL();

function initWebGL() {
  // get the rendering context for webGL
  var gl: WebGLRenderingContext = getWebGLContext(canvas);
  if (!gl) {
    return;  // no webgl!  Bye bye
  }

  // turn on backface culling and zbuffering
  //gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // attempt to download and set up our GLSL shaders.  When they download, processed to the next step
  // of our program, the "main" routing
  // 
  // YOU SHOULD MODIFY THIS TO DOWNLOAD ALL YOUR SHADERS and set up all four SHADER PROGRAMS,
  // THEN PASS AN ARRAY OF PROGRAMS TO main().  You'll have to do other things in main to deal
  // with multiple shaders and switch between them
  loader.loadFiles(['shaders/a3-shader.vert', 'shaders/a3-shader.frag',
    'shaders/shaders-line.vert', 'shaders/shaders-line.frag'],function (shaderText) {
    // var program = createProgramFromSources(gl, [shaderText[0], shaderText[1]]);
    main(gl, shaderText);
  }, function (url) {
      alert('Shader failed to download "' + url + '"');
  });
}

////////////////////////////////////////////////////////////////////////////////////////////
// webGL is set up, and our Shader program has been created.  Finish setting up our webGL application       
function main(gl: WebGLRenderingContext, shaderText) {
  var textures = [];
  var letters = [];
  for (var ii = 0; ii < 26; ii++) {
    var curr = new Image();
    textures.push(curr);
    curr.onload = function() {
      letters[ii].src = this.src;
    }
    curr.src = "letters/" + "myletter" + ii.toString() + ".jpg";
  }
  // images.push(image2);
  // use the webgl-utils library to create setters for all the uniforms and attributes in our shaders.
  // It enumerates all of the uniforms and attributes in the program, and creates utility functions to 
  // allow "setUniforms" and "setAttributes" (below) to set the shader variables from a javascript object. 
  // The objects have a key for each uniform or attribute, and a value containing the parameters for the
  // setter function
  // var program = createProgramFromSources(gl, [shaderText[effectI], shaderText[effectI + 1]]);
  // var uniformSetters = createUniformSetters(gl, program);
  // var attribSetters  = createAttributeSetters(gl, program);

  // an indexed quad
  var arrays = {
     position: { numComponents: 3, data: [], },
     texcoord: { numComponents: 2, data: [], },
     normal:   { numComponents: 3, data: [], },
     indices:  { numComponents: 3, data: [], },
  };
  var center = vec4.fromValues(70 * scaleFactor, 0, 0, 0);
  var scaleFactor = 10;
  var lineArrays = {position: { numComponents: 3, data: [0, 1, 0, 0, -1, 0]},
                indices: {numComponents: 1, data: [0, 1]}};
  // console.log(newPosition);
  var n = 2;
  for (var ii = 0; ii < n;ii++) {
        for (var jj = 0; jj < n; jj++) {
          arrays.position.data.push.apply(arrays.position.data, [jj * (10 / (n - 1)), ii * (10 / (n - 1)), 0]);
          arrays.normal.data.push.apply(arrays.normal.data, [0, 0, -1]);
          arrays.texcoord.data.push(jj * 1 / (n -1), ii * (1 / (n - 1)));
          if ( ii != n - 1 && jj != n - 1) {
        arrays.indices.data.push(jj + ii * n, jj + ii*n + 1, jj + (ii + 1) * n);
        arrays.indices.data.push(jj + ii * n + 1, jj + (ii + 1) * n, jj + (ii + 1) * n + 1);
          } 
    }
  }

  for (var ii = 0; ii < arrays.texcoord.data.length / 2; ii++) {
    var tempt = arrays.texcoord.data[ii];
    arrays.texcoord.data[ii] = arrays.texcoord.data[arrays.texcoord.data.length - ii - 1];
    arrays.texcoord.data[arrays.texcoord.data.length - ii - 1] = tempt;
  }
  for (var ii = 0; ii < arrays.texcoord.data.length; ii+=2) {
    var tempt = arrays.texcoord.data[ii];
  arrays.texcoord.data[ii] = arrays.texcoord.data[ii + 1];
  arrays.texcoord.data[ii + 1] = tempt;
  }


  var bufferInfo = createBufferInfoFromArrays(gl, arrays);
  var bufferInfo0 = createBufferInfoFromArrays(gl, lineArrays);
  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var cameraAngleRadians = degToRad(0);
  var fieldOfViewRadians = degToRad(60);
  var cameraHeight = 50;

  var uniformsThatAreTheSameForAllObjects = {
    u_lightWorldPos:         [0, 0, -100],
    u_viewInverse:           mat4.create(),
    u_lightColor:            [1, 1, 1, 1],
    u_ambient:               [0.1, 0.1, 0.1, 0.1],
  };

  var uniformsThatAreComputedForEachObject = {
    u_worldViewProjection:   mat4.create(),
    u_world:                 mat4.create(),
    u_worldInverseTranspose: mat4.create(),
  };


  // var texture = .... create a texture of some form

  var baseColor = rand(240);
  var objectState = { 
      materialUniforms: {
        u_colorMult:             chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
        u_colorOfLetter:         chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
        //u_diffuse:               texture,
        u_specular:              [1, 1, 1, 1],
        u_shininess:             450,
        u_specularFactor:        0.75,
        u_disToCenter:              undefined,
        u_verticalPos:            undefined
      }
  };

  // some variables we'll reuse below
  var projectionMatrix = mat4.create();
  var viewMatrix = mat4.create();
  var rotationMatrix = mat4.create();
  var matrix = mat4.create();  // a scratch matrix
  var invMatrix = mat4.create();
  var axisVector = vec3.create();


  var capacity = 14;
  var spacing = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time: number) {
    time *= 0.001;
      
   var program = createProgramFromSources(gl, [shaderText[0], shaderText[1]]);
   var lineProgram = createProgramFromSources(gl, [shaderText[2], shaderText[3]]);
   var uniformSetters = createUniformSetters(gl, program);
   var attribSetters  = createAttributeSetters(gl, program);

    // measure time taken for the little stats meter

    // if the window changed size, reset the WebGL canvas size to match.  The displayed size of the canvas
    // (determined by window size, layout, and your CSS) is separate from the size of the WebGL render buffers, 
    // which you can control by setting canvas.width and canvas.height
    resizeCanvasToDisplaySize(canvas);

    // Set the viewport to match the canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    var aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(projectionMatrix,fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, -200];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = mat4.lookAt(uniformsThatAreTheSameForAllObjects.u_viewInverse, cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    mat4.invert(viewMatrix, cameraMatrix);
    
    // tell WebGL to use our shader program (will need to change this)
    gl.useProgram(program);
    setBuffersAndAttributes(gl, attribSetters, bufferInfo);

    // Set the uniforms that are the same for all objects.  Unlike the attributes, each uniform setter
    // is different, depending on the type of the uniform variable.  Look in webgl-util.js for the
    // implementation of  setUniforms to see the details for specific types       
    setUniforms(uniformSetters, uniformsThatAreTheSameForAllObjects);
    // Compute the view matrix and corresponding other matrices for rendering.
    
    // first make a copy of our rotationMatrix
    mat4.copy(matrix, rotationMatrix);
  var curr = {
        letter: undefined,
        rotateZ : mat4.create(),
        rotateX : mat4.create(),
        isSpinning: false,
        spinningSpeed: 0.0,
        height: 0.0,
        u_colorMult: chroma.hsv(rand(baseColor - 100, baseColor + 100), 0.5, 0.5).gl(),
        texture: undefined,
        angle: 0.0,
        positionX: undefined,
        time: 0.0,
        spinningAngle :0.0
      }
  var texture;
    if (pressFromKeyboard != undefined) {
      curr.letter = pressFromKeyboard;
      curr.height = rand(-80, 0);
      if (pressFromKeyboard == 8) {
        letters.pop();
        pressFromKeyboard = undefined;
      } else {
        if (pressFromKeyboard == 13) {
          letters = [];
          pressFromKeyboard = undefined;
        } else {
          if (pressFromKeyboard >= 65 && pressFromKeyboard <= 122) {
            if (pressFromKeyboard >= 91 && pressFromKeyboard <= 122) {
              pressFromKeyboard = pressFromKeyboard - 32;
            }
            curr.angle = degToRad(rand(-20, 20));
            var axis = vec3.transformMat4(axisVector, vec3.fromValues(0, 0, 1), mat4.create());
            mat4.rotate(curr.rotateZ, mat4.create(), curr.angle, axis);
            curr.texture = textures[pressFromKeyboard - 65];
          }
      if (letters.length > capacity) {
        letters.shift();
          }
          letters.push(curr);
          pressFromKeyboard = undefined;
        }
      }
    }
    var scaleForLetters = scaleFactor * 0.3;
    
    spacing = 140 / capacity * 0.2;
    for (var i = 0; i < letters.length; i++) {
    if (letters[i].letter != 32) {
      mat4.copy(matrix, rotationMatrix);
      matrix = mat4.create();
      if (letters[i].isSpinning) {
        if (letters[i].time >= 0 && letters[i].spinningSpeed >= 1.0) {
          if (Math.abs(letters[i].spinningAngle) < 360.0) {
            var rotateY = vec3.transformMat4(axisVector, vec3.fromValues(0, 1, 0), mat4.create());
            letters[i].spinningAngle = letters[i].spinningSpeed + letters[i].spinningAngle;
            mat4.rotate(matrix, matrix, degToRad(letters[i].spinningAngle), rotateY);
          } else {
            letters[i].spinningSpeed = letters[i].spinningSpeed / 2.0;
            letters[i].time--;
            letters[i].spinningAngle = 0.0;
          }
        } else {
          letters[i].isSpnning = false;
          letters[i].time = 0.0;
          letters[i].spinningSpeed = 0.0;
          matrix = mat4.create();
          letters[i].spinningSpeed = 0.0;
        }
      }
      mat4.copy(letters[i].rotateX, matrix);
      mat4.multiply(matrix, letters[i].rotateX, letters[i].rotateZ);
      mat4.scale(matrix, matrix, [scaleForLetters, scaleForLetters, scaleForLetters]);
      mat4.copy(uniformsThatAreComputedForEachObject.u_world, matrix);
      mat4.multiply(matrix, viewMatrix, uniformsThatAreComputedForEachObject.u_world);
      mat4.multiply(uniformsThatAreComputedForEachObject.u_worldViewProjection, projectionMatrix, matrix);
      mat4.transpose(uniformsThatAreComputedForEachObject.u_worldInverseTranspose, mat4.invert(matrix, uniformsThatAreComputedForEachObject.u_world));
      setUniforms(uniformSetters, uniformsThatAreComputedForEachObject);
      objectState.materialUniforms.u_colorMult = letters[i].u_colorMult;
objectState.materialUniforms.u_verticalPos = vec4.fromValues(0, letters[i].height, 0, 0);
      letters[i].positionX = scaleFactor * (i * spacing - spacing * 0.5 * (letters.length - 1)) / 200;
      objectState.materialUniforms.u_disToCenter = vec4.fromValues(scaleFactor * (i * spacing - spacing * 0.5 * (letters.length - 1)), 0, 0, 0);
      setUniforms(uniformSetters, objectState.materialUniforms);
      texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, letters[i].texture);
      gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    }
    }
    if (mouseDown != undefined) {
      if (canvas != undefined) {
        if (gl != undefined) {
      var mousePosition = 0.0;
          var currDist = Infinity;
          var currID = undefined;

          mousePosition = mouseDown[0] - 717;
          mousePosition = mousePosition/717;
          for (var i = 0; i < letters.length; i++) {
            if (Math.abs(mousePosition - letters[i].positionX) < currDist){
              currID = i;
              currDist = Math.abs(mousePosition - letters[i].positionX);
            }
          }
          if (letters[currID].isSpinning == false) {
        letters[currID].isSpinning = true;
        letters[currID].time = currDist * 360;
        letters[currID].spinningSpeed = letters[currID].time * 10.0;
        var soundEffect = new Howl({
          urls: ['sounds/spin.mp3']
        }).play();
          } 
        }
      }
      mouseDown = undefined;
    }
    gl.useProgram(lineProgram);
    uniformSetters = createUniformSetters(gl, lineProgram);
    attribSetters = createAttributeSetters(gl, lineProgram);
    var uniformsOfLines = {
      u_worldViewProjection:  mat4.create(),
      u_colorMult: [0, 0, 0, 1],
      u_horizontalPos: vec4.create(),
      u_height: 0.0
    }
    for (var i = 0; i < letters.length; i++) {
    if (letters[i].letter != 32) {
      var horizontalPos = scaleFactor * (i * spacing - spacing * 0.5 * (letters.length - 1)) / 200;
      uniformsOfLines.u_colorMult = letters[i].u_colorMult;
      uniformsOfLines.u_horizontalPos = vec4.fromValues(horizontalPos, 0, 0, 0);
      uniformsOfLines.u_height = letters[i].height / 200;
      setBuffersAndAttributes(gl, attribSetters, bufferInfo0);
      setUniforms(uniformSetters, uniformsOfLines);
      gl.lineWidth(2.0);
      gl.drawElements(gl.LINES, 2, gl.UNSIGNED_SHORT, 0);
    }
    }

    requestAnimationFrame(drawScene);
  }
}
