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
define(["require", "exports", './loader'], function (require, exports, loader) {
    ////////////////////////////////////////////////////////////////////////////////////////////
    // stats module by mrdoob (https://github.com/mrdoob/stats.js) to show the performance 
    ////////////////////////////////////////////////////////////////////////////////////////////
    // utilities
    var rand = function (min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    };
    var randInt = function (range) {
        return Math.floor(Math.random() * range);
    };
    ////////////////////////////////////////////////////////////////////////////////////////////
    // get some of our canvas elements that we need
    var canvas = document.getElementById("webgl");
    ////////////////////////////////////////////////////////////////////////////////////////////
    // some simple interaction using the mouse.
    // we are going to get small motion offsets of the mouse, and use these to rotate the object
    //
    // our offset() function from assignment 0, to give us a good mouse position in the canvas 
    function offset(e) {
        e = e || window.event;
        var target = e.target || e.srcElement, rect = target.getBoundingClientRect(), offsetX = e.clientX - rect.left, offsetY = e.clientY - rect.top;
        return vec2.fromValues(offsetX, offsetY);
    }
    var mouseDown = undefined;
    var pressFromKeyboard = undefined;
    // the amount the mouse has moved // angle offset corresponding to mouse movement
    // start things off with a down press
    canvas.onmousedown = function (ev) {
        mouseDown = offset(ev);
    };
    // stop things with a mouse release
    // if we're moving and the mouse is down        
    document.onkeypress = function (ev) {
        pressFromKeyboard = ev.keyCode;
        if (ev.keyCode == 32) {
            ev.preventDefault();
        }
        var effect = new Howl({
            urls: ['sounds/typing.mp3']
        }).play();
    };
    document.onkeydown = function (ev) {
        pressFromKeyboard = ev.keyCode;
        if (ev.keyCode == 8) {
            ev.preventDefault();
        }
    };
    // stop things if you move out of the window
    ////////////////////////////////////////////////////////////////////////////////////////////
    // start things off by calling initWebGL
    initWebGL();
    function initWebGL() {
        // get the rendering context for webGL
        var gl = getWebGLContext(canvas);
        if (!gl) {
            return; // no webgl!  Bye bye
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
            'shaders/shaders-line.vert', 'shaders/shaders-line.frag'], function (shaderText) {
            // var program = createProgramFromSources(gl, [shaderText[0], shaderText[1]]);
            main(gl, shaderText);
        }, function (url) {
            alert('Shader failed to download "' + url + '"');
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////
    // webGL is set up, and our Shader program has been created.  Finish setting up our webGL application       
    function main(gl, shaderText) {
        var textures = [];
        var letters = [];
        for (var ii = 0; ii < 26; ii++) {
            var curr = new Image();
            textures.push(curr);
            curr.onload = function () {
                letters[ii].src = this.src;
            };
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
            normal: { numComponents: 3, data: [], },
            indices: { numComponents: 3, data: [], },
        };
        var center = vec4.fromValues(70 * scaleFactor, 0, 0, 0);
        var scaleFactor = 10;
        var lineArrays = { position: { numComponents: 3, data: [0, 1, 0, 0, -1, 0] },
            indices: { numComponents: 1, data: [0, 1] } };
        // console.log(newPosition);
        var n = 2;
        for (var ii = 0; ii < n; ii++) {
            for (var jj = 0; jj < n; jj++) {
                arrays.position.data.push.apply(arrays.position.data, [jj * (10 / (n - 1)), ii * (10 / (n - 1)), 0]);
                arrays.normal.data.push.apply(arrays.normal.data, [0, 0, -1]);
                arrays.texcoord.data.push(jj * 1 / (n - 1), ii * (1 / (n - 1)));
                if (ii != n - 1 && jj != n - 1) {
                    arrays.indices.data.push(jj + ii * n, jj + ii * n + 1, jj + (ii + 1) * n);
                    arrays.indices.data.push(jj + ii * n + 1, jj + (ii + 1) * n, jj + (ii + 1) * n + 1);
                }
            }
        }
        for (var ii = 0; ii < arrays.texcoord.data.length / 2; ii++) {
            var tempt = arrays.texcoord.data[ii];
            arrays.texcoord.data[ii] = arrays.texcoord.data[arrays.texcoord.data.length - ii - 1];
            arrays.texcoord.data[arrays.texcoord.data.length - ii - 1] = tempt;
        }
        for (var ii = 0; ii < arrays.texcoord.data.length; ii += 2) {
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
            u_lightWorldPos: [0, 0, -100],
            u_viewInverse: mat4.create(),
            u_lightColor: [1, 1, 1, 1],
            u_ambient: [0.1, 0.1, 0.1, 0.1],
        };
        var uniformsThatAreComputedForEachObject = {
            u_worldViewProjection: mat4.create(),
            u_world: mat4.create(),
            u_worldInverseTranspose: mat4.create(),
        };
        // var texture = .... create a texture of some form
        var baseColor = rand(240);
        var objectState = {
            materialUniforms: {
                u_colorMult: chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
                u_colorOfLetter: chroma.hsv(rand(baseColor, baseColor + 120), 0.5, 1).gl(),
                //u_diffuse:               texture,
                u_specular: [1, 1, 1, 1],
                u_shininess: 450,
                u_specularFactor: 0.75,
                u_disToCenter: undefined,
                u_verticalPos: undefined
            }
        };
        // some variables we'll reuse below
        var projectionMatrix = mat4.create();
        var viewMatrix = mat4.create();
        var rotationMatrix = mat4.create();
        var matrix = mat4.create(); // a scratch matrix
        var invMatrix = mat4.create();
        var axisVector = vec3.create();
        var capacity = 14;
        var spacing = 0;
        requestAnimationFrame(drawScene);
        // Draw the scene.
        function drawScene(time) {
            time *= 0.001;
            var program = createProgramFromSources(gl, [shaderText[0], shaderText[1]]);
            var lineProgram = createProgramFromSources(gl, [shaderText[2], shaderText[3]]);
            var uniformSetters = createUniformSetters(gl, program);
            var attribSetters = createAttributeSetters(gl, program);
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
            mat4.perspective(projectionMatrix, fieldOfViewRadians, aspect, 1, 2000);
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
                rotateZ: mat4.create(),
                rotateX: mat4.create(),
                isSpinning: false,
                spinningSpeed: 0.0,
                height: 0.0,
                u_colorMult: chroma.hsv(rand(baseColor - 100, baseColor + 100), 0.5, 0.5).gl(),
                texture: undefined,
                angle: 0.0,
                positionX: undefined,
                time: 0.0,
                spinningAngle: 0.0
            };
            var texture;
            if (pressFromKeyboard != undefined) {
                curr.letter = pressFromKeyboard;
                curr.height = rand(-80, 0);
                if (pressFromKeyboard == 8) {
                    letters.pop();
                    pressFromKeyboard = undefined;
                }
                else {
                    if (pressFromKeyboard == 13) {
                        letters = [];
                        pressFromKeyboard = undefined;
                    }
                    else {
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
                            }
                            else {
                                letters[i].spinningSpeed = letters[i].spinningSpeed / 2.0;
                                letters[i].time--;
                                letters[i].spinningAngle = 0.0;
                            }
                        }
                        else {
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
                        mousePosition = mousePosition / 717;
                        for (var i = 0; i < letters.length; i++) {
                            if (Math.abs(mousePosition - letters[i].positionX) < currDist) {
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
                u_worldViewProjection: mat4.create(),
                u_colorMult: [0, 0, 0, 1],
                u_horizontalPos: vec4.create(),
                u_height: 0.0
            };
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
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImE1LnRzIl0sIm5hbWVzIjpbIm9mZnNldCIsImluaXRXZWJHTCIsIm1haW4iLCJtYWluLmRlZ1RvUmFkIiwibWFpbi5kcmF3U2NlbmUiXSwibWFwcGluZ3MiOiJBQUFBLHlDQUF5QztBQUN6QyxxREFBcUQ7QUFDckQsbUNBQW1DO0FBQ25DLEVBQUU7QUFDRjs7Ozs7Ozs7Ozs7R0FXRzs7SUFJSCw0RkFBNEY7SUFDNUYsdUZBQXVGO0lBRXZGLDRGQUE0RjtJQUM1RixZQUFZO0lBQ1osSUFBSSxJQUFJLEdBQUcsVUFBUyxHQUFXLEVBQUUsR0FBWTtRQUMzQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0QixHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ1YsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNWLENBQUM7UUFDRCxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUM7SUFFRixJQUFJLE9BQU8sR0FBRyxVQUFTLEtBQUs7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQztJQUVGLDRGQUE0RjtJQUM1RiwrQ0FBK0M7SUFDL0MsSUFBSSxNQUFNLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFakUsNEZBQTRGO0lBQzVGLDJDQUEyQztJQUMzQyw0RkFBNEY7SUFDNUYsRUFBRTtJQUNGLDJGQUEyRjtJQUMzRixnQkFBZ0IsQ0FBYTtRQUN6QkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBaUJBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBRW5DQSxJQUFJQSxNQUFNQSxHQUFhQSxDQUFDQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxVQUFVQSxFQUMzQ0EsSUFB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QVVBLENBQUNBLEVBQUVBLEdBQUdBLFdBQVdBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hEQSxJQUFJQSxXQUFXQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNyQkEsSUFBSUEsVUFBVUEsR0FBR0EsRUFBQ0EsUUFBUUEsRUFBRUEsRUFBRUEsYUFBYUEsRUFBRUEsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBQ0E7WUFDNURBLE9BQU9BLEVBQUVBLEVBQUNBLGFBQWFBLEVBQUVBLENBQUNBLEVBQUVBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUNBLEVBQUNBLENBQUNBO1FBQ3pEQSw0QkFBNEJBO1FBQzVCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNWQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUN6QkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0E7Z0JBQzlCQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckdBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM5REEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9EQSxFQUFFQSxDQUFDQSxDQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDcENBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO29CQUN4RUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xGQSxDQUFDQTtZQUNQQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUVEQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUM1REEsSUFBSUEsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RGQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNyRUEsQ0FBQ0E7UUFDREEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsRUFBRUEsR0FBR0EsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsSUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDekRBLElBQUlBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1lBQ3ZDQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4REEsTUFBTUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDckNBLENBQUNBO1FBR0RBLElBQUlBLFVBQVVBLEdBQUdBLDBCQUEwQkEsQ0FBQ0EsRUFBRUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDeERBLElBQUlBLFdBQVdBLEdBQUdBLDBCQUEwQkEsQ0FBQ0EsRUFBRUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLGtCQUFrQkEsQ0FBQ0E7WUFDakJDLE1BQU1BLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLEdBQUdBLENBQUNBO1FBQzNCQSxDQUFDQTtRQUVERCxJQUFJQSxrQkFBa0JBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3JDQSxJQUFJQSxrQkFBa0JBLEdBQUdBLFFBQVFBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3RDQSxJQUFJQSxZQUFZQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUV0QkEsSUFBSUEsbUNBQW1DQSxHQUFHQTtZQUN4Q0EsZUFBZUEsRUFBVUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7WUFDckNBLGFBQWFBLEVBQVlBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBO1lBQ3RDQSxZQUFZQSxFQUFhQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUNyQ0EsU0FBU0EsRUFBZ0JBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBO1NBQzlDQSxDQUFDQTtRQUVGQSxJ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QUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO29CQUN2QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQzFCQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFhQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTs0QkFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO2dDQUMvQ0EsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsVUFBVUEsRUFBRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0NBQ3RGQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFhQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFhQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTtnQ0FDL0VBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLE1BQU1BLEVBQUVBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBOzRCQUMzRUEsQ0FBQ0E7NEJBQUNBLElBQUlBLENBQUNBLENBQUNBO2dDQUNOQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFhQSxHQUFHQSxPQUFP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QSxDQUFDQTtvQkFDeERBLFdBQVdBLENBQUNBLGNBQWNBLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO29CQUM3Q0EsRUFBRUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2xCQSxFQUFFQSxDQUFDQSxZQUFZQSxDQUFDQSxFQUFFQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxjQUFjQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckRBLENBQUNBO1lBQ0RBLENBQUNBO1lBRURBLHFCQUFxQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLENBQUNBO0lBQ0hGLENBQUNBIiwiZmlsZSI6ImE1LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vPHJlZmVyZW5jZSBwYXRoPScuL3R5cGluZ3MvdHNkLmQudHMnLz5cbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4vbG9jYWxUeXBpbmdzL3dlYmdsdXRpbHMuZC50c1wiLz5cbi8vZ2V0IHN0YXJ0IGJ5IHN0dWZmIG5vdCBpbiBzaGFkZXJzXG4vL1xuLypcbiAqIFBvcnRpb25zIG9mIHRoaXMgY29kZSBhcmVcbiAqIENvcHlyaWdodCAyMDE1LCBCbGFpciBNYWNJbnR5cmUuXG4gKiBcbiAqIFBvcnRpb25zIG9mIHRoaXMgY29kZSB0YWtlbiBmcm9tIGh0dHA6Ly93ZWJnbGZ1bmRhbWVudGFscy5vcmcsIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi93ZWJnbC1mdW5kYW1lbnRhbHNcbiAqIGFuZCBhcmUgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGxpY2Vuc2UuICBJbiBwYXJ0aWN1bGFyLCBmcm9tIFxuICogICAgaHR0cDovL3dlYmdsZnVuZGFtZW50YWxzLm9yZy93ZWJnbC93ZWJnbC1sZXNzLWNvZGUtbW9yZS1mdW4uaHRtbFxuICogICAgaHR0cDovL3dlYmdsZnVuZGFtZW50YWxzLm9yZy93ZWJnbC9yZXNvdXJjZXMvcHJpbWl0aXZlcy5qc1xuICogXG4gKiBUaG9zZSBwb3J0aW9ucyBDb3B5cmlnaHQgMjAxNCwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKi9cblxuaW1wb3J0IGxvYWRlciA9IHJlcXVpcmUoJy4vbG9hZGVyJyk7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBzdGF0cyBtb2R1bGUgYnkgbXJkb29iIChodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3N0YXRzLmpzKSB0byBzaG93IHRoZSBwZXJmb3JtYW5jZSBcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIHV0aWxpdGllc1xudmFyIHJhbmQgPSBmdW5jdGlvbihtaW46IG51bWJlciwgbWF4PzogbnVtYmVyKSB7XG4gIGlmIChtYXggPT09IHVuZGVmaW5lZCkge1xuICAgIG1heCA9IG1pbjtcbiAgICBtaW4gPSAwO1xuICB9XG4gIHJldHVybiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbik7XG59O1xuXG52YXIgcmFuZEludCA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByYW5nZSk7XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gZ2V0IHNvbWUgb2Ygb3VyIGNhbnZhcyBlbGVtZW50cyB0aGF0IHdlIG5lZWRcbnZhciBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbFwiKTsgIFxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gc29tZSBzaW1wbGUgaW50ZXJhY3Rpb24gdXNpbmcgdGhlIG1vdXNlLlxuLy8gd2UgYXJlIGdvaW5nIHRvIGdldCBzbWFsbCBtb3Rpb24gb2Zmc2V0cyBvZiB0aGUgbW91c2UsIGFuZCB1c2UgdGhlc2UgdG8gcm90YXRlIHRoZSBvYmplY3Rcbi8vXG4vLyBvdXIgb2Zmc2V0KCkgZnVuY3Rpb24gZnJvbSBhc3NpZ25tZW50IDAsIHRvIGdpdmUgdXMgYSBnb29kIG1vdXNlIHBvc2l0aW9uIGluIHRoZSBjYW52YXMgXG5mdW5jdGlvbiBvZmZzZXQoZTogTW91c2VFdmVudCk6IEdMTS5JQXJyYXkge1xuICAgIGUgPSBlIHx8IDxNb3VzZUV2ZW50PiB3aW5kb3cuZXZlbnQ7XG5cbiAgICB2YXIgdGFyZ2V0ID0gPEVsZW1lbnQ+IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCxcbiAgICAgICAgcmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgb2Zmc2V0WCA9IGUuY2xpZW50WCAtIHJlY3QubGVmdCxcbiAgICAgICAgb2Zmc2V0WSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgcmV0dXJuIHZlYzIuZnJvbVZhbHVlcyhvZmZzZXRYLCBvZmZzZXRZKTtcbn1cbnZhciBtb3VzZURvd24gPSB1bmRlZmluZWQ7XG52YXIgcHJlc3NGcm9tS2V5Ym9hcmQgPSB1bmRlZmluZWQ7XG4vLyB0aGUgYW1vdW50IHRoZSBtb3VzZSBoYXMgbW92ZWQgLy8gYW5nbGUgb2Zmc2V0IGNvcnJlc3BvbmRpbmcgdG8gbW91c2UgbW92ZW1lbnRcblxuLy8gc3RhcnQgdGhpbmdzIG9mZiB3aXRoIGEgZG93biBwcmVzc1xuY2FudmFzLm9ubW91c2Vkb3duID0gKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gIG1vdXNlRG93biA9IG9mZnNldChldik7XG59XG5cbi8vIHN0b3AgdGhpbmdzIHdpdGggYSBtb3VzZSByZWxlYXNlXG5cbi8vIGlmIHdlJ3JlIG1vdmluZyBhbmQgdGhlIG1vdXNlIGlzIGRvd24gICAgICAgIFxuZG9jdW1lbnQub25rZXlwcmVzcyA9IChldjpLZXlib2FyZEV2ZW50KSA9PiB7XG4gIHByZXNzRnJvbUtleWJvYXJkID0gZXYua2V5Q29kZTtcbiAgaWYgKGV2LmtleUNvZGUgPT0gMzIpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIHZhciBlZmZlY3QgPSBuZXcgSG93bCh7XG4gICAgdXJsczogWydzb3VuZHMvdHlwaW5nLm1wMyddXG4gIH0pLnBsYXkoKTtcbn1cbmRvY3VtZW50Lm9ua2V5ZG93biA9IChldjogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICBwcmVzc0Zyb21LZXlib2FyZCA9IGV2LmtleUNvZGU7XG4gIGlmIChldi5rZXlDb2RlID09IDgpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59XG4vLyBzdG9wIHRoaW5ncyBpZiB5b3UgbW92ZSBvdXQgb2YgdGhlIHdpbmRvd1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gc3RhcnQgdGhpbmdzIG9mZiBieSBjYWxsaW5nIGluaXRXZWJHTFxuaW5pdFdlYkdMKCk7XG5cbmZ1bmN0aW9uIGluaXRXZWJHTCgpIHtcbiAgLy8gZ2V0IHRoZSByZW5kZXJpbmcgY29udGV4dCBmb3Igd2ViR0xcbiAgdmFyIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgPSBnZXRXZWJHTENvbnRleHQoY2FudmFzKTtcbiAgaWYgKCFnbCkge1xuICAgIHJldHVybjsgIC8vIG5vIHdlYmdsISAgQnllIGJ5ZVxuICB9XG5cbiAgLy8gdHVybiBvbiBiYWNrZmFjZSBjdWxsaW5nIGFuZCB6YnVmZmVyaW5nXG4gIC8vZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcblxuICAvLyBhdHRlbXB0IHRvIGRvd25sb2FkIGFuZCBzZXQgdXAgb3VyIEdMU0wgc2hhZGVycy4gIFdoZW4gdGhleSBkb3dubG9hZCwgcHJvY2Vzc2VkIHRvIHRoZSBuZXh0IHN0ZXBcbiAgLy8gb2Ygb3VyIHByb2dyYW0sIHRoZSBcIm1haW5cIiByb3V0aW5nXG4gIC8vIFxuICAvLyBZT1UgU0hPVUxEIE1PRElGWSBUSElTIFRPIERPV05MT0FEIEFMTCBZT1VSIFNIQURFUlMgYW5kIHNldCB1cCBhbGwgZm91ciBTSEFERVIgUFJPR1JBTVMsXG4gIC8vIFRIRU4gUEFTUyBBTiBBUlJBWSBPRiBQUk9HUkFNUyBUTyBtYWluKCkuICBZb3UnbGwgaGF2ZSB0byBkbyBvdGhlciB0aGluZ3MgaW4gbWFpbiB0byBkZWFsXG4gIC8vIHdpdGggbXVsdGlwbGUgc2hhZGVycyBhbmQgc3dpdGNoIGJldHdlZW4gdGhlbVxuICBsb2FkZXIubG9hZEZpbGVzKFsnc2hhZGVycy9hMy1zaGFkZXIudmVydCcsICdzaGFkZXJzL2EzLXNoYWRlci5mcmFnJyxcbiAgICAnc2hhZGVycy9zaGFkZXJzLWxpbmUudmVydCcsICdzaGFkZXJzL3NoYWRlcnMtbGluZS5mcmFnJ10sZnVuY3Rpb24gKHNoYWRlclRleHQpIHtcbiAgICAvLyB2YXIgcHJvZ3JhbSA9IGNyZWF0ZVByb2dyYW1Gcm9tU291cmNlcyhnbCwgW3NoYWRlclRleHRbMF0sIHNoYWRlclRleHRbMV1dKTtcbiAgICBtYWluKGdsLCBzaGFkZXJUZXh0KTtcbiAgfSwgZnVuY3Rpb24gKHVybCkge1xuICAgICAgYWxlcnQoJ1NoYWRlciBmYWlsZWQgdG8gZG93bmxvYWQgXCInICsgdXJsICsgJ1wiJyk7XG4gIH0pO1xufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gd2ViR0wgaXMgc2V0IHVwLCBhbmQgb3VyIFNoYWRlciBwcm9ncmFtIGhhcyBiZWVuIGNyZWF0ZWQuICBGaW5pc2ggc2V0dGluZyB1cCBvdXIgd2ViR0wgYXBwbGljYXRpb24gICAgICAgXG5mdW5jdGlvbiBtYWluKGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQsIHNoYWRlclRleHQpIHtcbiAgdmFyIHRleHR1cmVzID0gW107XG4gIHZhciBsZXR0ZXJzID0gW107XG4gIGZvciAodmFyIGlpID0gMDsgaWkgPCAyNjsgaWkrKykge1xuICAgIHZhciBjdXJyID0gbmV3IEltYWdlKCk7XG4gICAgdGV4dHVyZXMucHVzaChjdXJyKTtcbiAgICBjdXJyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0dGVyc1tpaV0uc3JjID0gdGhpcy5zcmM7XG4gICAgfVxuICAgIGN1cnIuc3JjID0gXCJsZXR0ZXJzL1wiICsgXCJteWxldHRlclwiICsgaWkudG9TdHJpbmcoKSArIFwiLmpwZ1wiO1xuICB9XG4gIC8vIGltYWdlcy5wdXNoKGltYWdlMik7XG4gIC8vIHVzZSB0aGUgd2ViZ2wtdXRpbHMgbGlicmFyeSB0byBjcmVhdGUgc2V0dGVycyBmb3IgYWxsIHRoZSB1bmlmb3JtcyBhbmQgYXR0cmlidXRlcyBpbiBvdXIgc2hhZGVycy5cbiAgLy8gSXQgZW51bWVyYXRlcyBhbGwgb2YgdGhlIHVuaWZvcm1zIGFuZCBhdHRyaWJ1dGVzIGluIHRoZSBwcm9ncmFtLCBhbmQgY3JlYXRlcyB1dGlsaXR5IGZ1bmN0aW9ucyB0byBcbiAgLy8gYWxsb3cgXCJzZXRVbmlmb3Jtc1wiIGFuZCBcInNldEF0dHJpYnV0ZXNcIiAoYmVsb3cpIHRvIHNldCB0aGUgc2hhZGVyIHZhcmlhYmxlcyBmcm9tIGEgamF2YXNjcmlwdCBvYmplY3QuIFxuICAvLyBUaGUgb2JqZWN0cyBoYXZlIGEga2V5IGZvciBlYWNoIHVuaWZvcm0gb3IgYXR0cmlidXRlLCBhbmQgYSB2YWx1ZSBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGVcbiAgLy8gc2V0dGVyIGZ1bmN0aW9uXG4gIC8vIHZhciBwcm9ncmFtID0gY3JlYXRlUHJvZ3JhbUZyb21Tb3VyY2VzKGdsLCBbc2hhZGVyVGV4dFtlZmZlY3RJXSwgc2hhZGVyVGV4dFtlZmZlY3RJICsgMV1dKTtcbiAgLy8gdmFyIHVuaWZvcm1TZXR0ZXJzID0gY3JlYXRlVW5pZm9ybVNldHRlcnMoZ2wsIHByb2dyYW0pO1xuICAvLyB2YXIgYXR0cmliU2V0dGVycyAgPSBjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzKGdsLCBwcm9ncmFtKTtcblxuICAvLyBhbiBpbmRleGVkIHF1YWRcbiAgdmFyIGFycmF5cyA9IHtcbiAgICAgcG9zaXRpb246IHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogW10sIH0sXG4gICAgIHRleGNvb3JkOiB7IG51bUNvbXBvbmVudHM6IDIsIGRhdGE6IFtdLCB9LFxuICAgICBub3JtYWw6ICAgeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbXSwgfSxcbiAgICAgaW5kaWNlczogIHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogW10sIH0sXG4gIH07XG4gIHZhciBjZW50ZXIgPSB2ZWM0LmZyb21WYWx1ZXMoNzAgKiBzY2FsZUZhY3RvciwgMCwgMCwgMCk7XG4gIHZhciBzY2FsZUZhY3RvciA9IDEwO1xuICB2YXIgbGluZUFycmF5cyA9IHtwb3NpdGlvbjogeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbMCwgMSwgMCwgMCwgLTEsIDBdfSxcbiAgICAgICAgICAgICAgICBpbmRpY2VzOiB7bnVtQ29tcG9uZW50czogMSwgZGF0YTogWzAsIDFdfX07XG4gIC8vIGNvbnNvbGUubG9nKG5ld1Bvc2l0aW9uKTtcbiAgdmFyIG4gPSAyO1xuICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbjtpaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGpqID0gMDsgamogPCBuOyBqaisrKSB7XG4gICAgICAgICAgYXJyYXlzLnBvc2l0aW9uLmRhdGEucHVzaC5hcHBseShhcnJheXMucG9zaXRpb24uZGF0YSwgW2pqICogKDEwIC8gKG4gLSAxKSksIGlpICogKDEwIC8gKG4gLSAxKSksIDBdKTtcbiAgICAgICAgICBhcnJheXMubm9ybWFsLmRhdGEucHVzaC5hcHBseShhcnJheXMubm9ybWFsLmRhdGEsIFswLCAwLCAtMV0pO1xuICAgICAgICAgIGFycmF5cy50ZXhjb29yZC5kYXRhLnB1c2goamogKiAxIC8gKG4gLTEpLCBpaSAqICgxIC8gKG4gLSAxKSkpO1xuICAgICAgICAgIGlmICggaWkgIT0gbiAtIDEgJiYgamogIT0gbiAtIDEpIHtcbiAgICAgICAgYXJyYXlzLmluZGljZXMuZGF0YS5wdXNoKGpqICsgaWkgKiBuLCBqaiArIGlpKm4gKyAxLCBqaiArIChpaSArIDEpICogbik7XG4gICAgICAgIGFycmF5cy5pbmRpY2VzLmRhdGEucHVzaChqaiArIGlpICogbiArIDEsIGpqICsgKGlpICsgMSkgKiBuLCBqaiArIChpaSArIDEpICogbiArIDEpO1xuICAgICAgICAgIH0gXG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGFycmF5cy50ZXhjb29yZC5kYXRhLmxlbmd0aCAvIDI7IGlpKyspIHtcbiAgICB2YXIgdGVtcHQgPSBhcnJheXMudGV4Y29vcmQuZGF0YVtpaV07XG4gICAgYXJyYXlzLnRleGNvb3JkLmRhdGFbaWldID0gYXJyYXlzLnRleGNvb3JkLmRhdGFbYXJyYXlzLnRleGNvb3JkLmRhdGEubGVuZ3RoIC0gaWkgLSAxXTtcbiAgICBhcnJheXMudGV4Y29vcmQuZGF0YVthcnJheXMudGV4Y29vcmQuZGF0YS5sZW5ndGggLSBpaSAtIDFdID0gdGVtcHQ7XG4gIH1cbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGFycmF5cy50ZXhjb29yZC5kYXRhLmxlbmd0aDsgaWkrPTIpIHtcbiAgICB2YXIgdGVtcHQgPSBhcnJheXMudGV4Y29vcmQuZGF0YVtpaV07XG4gIGFycmF5cy50ZXhjb29yZC5kYXRhW2lpXSA9IGFycmF5cy50ZXhjb29yZC5kYXRhW2lpICsgMV07XG4gIGFycmF5cy50ZXhjb29yZC5kYXRhW2lpICsgMV0gPSB0ZW1wdDtcbiAgfVxuXG5cbiAgdmFyIGJ1ZmZlckluZm8gPSBjcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyhnbCwgYXJyYXlzKTtcbiAgdmFyIGJ1ZmZlckluZm8wID0gY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXMoZ2wsIGxpbmVBcnJheXMpO1xuICBmdW5jdGlvbiBkZWdUb1JhZChkKSB7XG4gICAgcmV0dXJuIGQgKiBNYXRoLlBJIC8gMTgwO1xuICB9XG5cbiAgdmFyIGNhbWVyYUFuZ2xlUmFkaWFucyA9IGRlZ1RvUmFkKDApO1xuICB2YXIgZmllbGRPZlZpZXdSYWRpYW5zID0gZGVnVG9SYWQoNjApO1xuICB2YXIgY2FtZXJhSGVpZ2h0ID0gNTA7XG5cbiAgdmFyIHVuaWZvcm1zVGhhdEFyZVRoZVNhbWVGb3JBbGxPYmplY3RzID0ge1xuICAgIHVfbGlnaHRXb3JsZFBvczogICAgICAgICBbMCwgMCwgLTEwMF0sXG4gICAgdV92aWV3SW52ZXJzZTogICAgICAgICAgIG1hdDQuY3JlYXRlKCksXG4gICAgdV9saWdodENvbG9yOiAgICAgICAgICAgIFsxLCAxLCAxLCAxXSxcbiAgICB1X2FtYmllbnQ6ICAgICAgICAgICAgICAgWzAuMSwgMC4xLCAwLjEsIDAuMV0sXG4gIH07XG5cbiAgdmFyIHVuaWZvcm1zVGhhdEFyZUNvbXB1dGVkRm9yRWFjaE9iamVjdCA9IHtcbiAgICB1X3dvcmxkVmlld1Byb2plY3Rpb246ICAgbWF0NC5jcmVhdGUoKSxcbiAgICB1X3dvcmxkOiAgICAgICAgICAgICAgICAgbWF0NC5jcmVhdGUoKSxcbiAgICB1X3dvcmxkSW52ZXJzZVRyYW5zcG9zZTogbWF0NC5jcmVhdGUoKSxcbiAgfTtcblxuXG4gIC8vIHZhciB0ZXh0dXJlID0gLi4uLiBjcmVhdGUgYSB0ZXh0dXJlIG9mIHNvbWUgZm9ybVxuXG4gIHZhciBiYXNlQ29sb3IgPSByYW5kKDI0MCk7XG4gIHZhciBvYmplY3RTdGF0ZSA9IHsgXG4gICAgICBtYXRlcmlhbFVuaWZvcm1zOiB7XG4gICAgICAgIHVfY29sb3JNdWx0OiAgICAgICAgICAgICBjaHJvbWEuaHN2KHJhbmQoYmFzZUNvbG9yLCBiYXNlQ29sb3IgKyAxMjApLCAwLjUsIDEpLmdsKCksXG4gICAgICAgIHVfY29sb3JPZkxldHRlcjogICAgICAgICBjaHJvbWEuaHN2KHJhbmQoYmFzZUNvbG9yLCBiYXNlQ29sb3IgKyAxMjApLCAwLjUsIDEpLmdsKCksXG4gICAgICAgIC8vdV9kaWZmdXNlOiAgICAgICAgICAgICAgIHRleHR1cmUsXG4gICAgICAgIHVfc3BlY3VsYXI6ICAgICAgICAgICAgICBbMSwgMSwgMSwgMV0sXG4gICAgICAgIHVfc2hpbmluZXNzOiAgICAgICAgICAgICA0NTAsXG4gICAgICAgIHVfc3BlY3VsYXJGYWN0b3I6ICAgICAgICAwLjc1LFxuICAgICAgICB1X2Rpc1RvQ2VudGVyOiAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICB1X3ZlcnRpY2FsUG9zOiAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgfVxuICB9O1xuXG4gIC8vIHNvbWUgdmFyaWFibGVzIHdlJ2xsIHJldXNlIGJlbG93XG4gIHZhciBwcm9qZWN0aW9uTWF0cml4ID0gbWF0NC5jcmVhdGUoKTtcbiAgdmFyIHZpZXdNYXRyaXggPSBtYXQ0LmNyZWF0ZSgpO1xuICB2YXIgcm90YXRpb25NYXRyaXggPSBtYXQ0LmNyZWF0ZSgpO1xuICB2YXIgbWF0cml4ID0gbWF0NC5jcmVhdGUoKTsgIC8vIGEgc2NyYXRjaCBtYXRyaXhcbiAgdmFyIGludk1hdHJpeCA9IG1hdDQuY3JlYXRlKCk7XG4gIHZhciBheGlzVmVjdG9yID0gdmVjMy5jcmVhdGUoKTtcblxuXG4gIHZhciBjYXBhY2l0eSA9IDE0O1xuICB2YXIgc3BhY2luZyA9IDA7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXdTY2VuZSk7XG5cbiAgLy8gRHJhdyB0aGUgc2NlbmUuXG4gIGZ1bmN0aW9uIGRyYXdTY2VuZSh0aW1lOiBudW1iZXIpIHtcbiAgICB0aW1lICo9IDAuMDAxO1xuICAgICAgXG4gICB2YXIgcHJvZ3JhbSA9IGNyZWF0ZVByb2dyYW1Gcm9tU291cmNlcyhnbCwgW3NoYWRlclRleHRbMF0sIHNoYWRlclRleHRbMV1dKTtcbiAgIHZhciBsaW5lUHJvZ3JhbSA9IGNyZWF0ZVByb2dyYW1Gcm9tU291cmNlcyhnbCwgW3NoYWRlclRleHRbMl0sIHNoYWRlclRleHRbM11dKTtcbiAgIHZhciB1bmlmb3JtU2V0dGVycyA9IGNyZWF0ZVVuaWZvcm1TZXR0ZXJzKGdsLCBwcm9ncmFtKTtcbiAgIHZhciBhdHRyaWJTZXR0ZXJzICA9IGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMoZ2wsIHByb2dyYW0pO1xuXG4gICAgLy8gbWVhc3VyZSB0aW1lIHRha2VuIGZvciB0aGUgbGl0dGxlIHN0YXRzIG1ldGVyXG5cbiAgICAvLyBpZiB0aGUgd2luZG93IGNoYW5nZWQgc2l6ZSwgcmVzZXQgdGhlIFdlYkdMIGNhbnZhcyBzaXplIHRvIG1hdGNoLiAgVGhlIGRpc3BsYXllZCBzaXplIG9mIHRoZSBjYW52YXNcbiAgICAvLyAoZGV0ZXJtaW5lZCBieSB3aW5kb3cgc2l6ZSwgbGF5b3V0LCBhbmQgeW91ciBDU1MpIGlzIHNlcGFyYXRlIGZyb20gdGhlIHNpemUgb2YgdGhlIFdlYkdMIHJlbmRlciBidWZmZXJzLCBcbiAgICAvLyB3aGljaCB5b3UgY2FuIGNvbnRyb2wgYnkgc2V0dGluZyBjYW52YXMud2lkdGggYW5kIGNhbnZhcy5oZWlnaHRcbiAgICByZXNpemVDYW52YXNUb0Rpc3BsYXlTaXplKGNhbnZhcyk7XG5cbiAgICAvLyBTZXQgdGhlIHZpZXdwb3J0IHRvIG1hdGNoIHRoZSBjYW52YXNcbiAgICBnbC52aWV3cG9ydCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgIC8vIENsZWFyIHRoZSBjYW52YXMgQU5EIHRoZSBkZXB0aCBidWZmZXIuXG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgcHJvamVjdGlvbiBtYXRyaXhcbiAgICB2YXIgYXNwZWN0ID0gY2FudmFzLmNsaWVudFdpZHRoIC8gY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICBtYXQ0LnBlcnNwZWN0aXZlKHByb2plY3Rpb25NYXRyaXgsZmllbGRPZlZpZXdSYWRpYW5zLCBhc3BlY3QsIDEsIDIwMDApO1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgY2FtZXJhJ3MgbWF0cml4IHVzaW5nIGxvb2sgYXQuXG4gICAgdmFyIGNhbWVyYVBvc2l0aW9uID0gWzAsIDAsIC0yMDBdO1xuICAgIHZhciB0YXJnZXQgPSBbMCwgMCwgMF07XG4gICAgdmFyIHVwID0gWzAsIDEsIDBdO1xuICAgIHZhciBjYW1lcmFNYXRyaXggPSBtYXQ0Lmxvb2tBdCh1bmlmb3Jtc1RoYXRBcmVUaGVTYW1lRm9yQWxsT2JqZWN0cy51X3ZpZXdJbnZlcnNlLCBjYW1lcmFQb3NpdGlvbiwgdGFyZ2V0LCB1cCk7XG5cbiAgICAvLyBNYWtlIGEgdmlldyBtYXRyaXggZnJvbSB0aGUgY2FtZXJhIG1hdHJpeC5cbiAgICBtYXQ0LmludmVydCh2aWV3TWF0cml4LCBjYW1lcmFNYXRyaXgpO1xuICAgIFxuICAgIC8vIHRlbGwgV2ViR0wgdG8gdXNlIG91ciBzaGFkZXIgcHJvZ3JhbSAod2lsbCBuZWVkIHRvIGNoYW5nZSB0aGlzKVxuICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG4gICAgc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXMoZ2wsIGF0dHJpYlNldHRlcnMsIGJ1ZmZlckluZm8pO1xuXG4gICAgLy8gU2V0IHRoZSB1bmlmb3JtcyB0aGF0IGFyZSB0aGUgc2FtZSBmb3IgYWxsIG9iamVjdHMuICBVbmxpa2UgdGhlIGF0dHJpYnV0ZXMsIGVhY2ggdW5pZm9ybSBzZXR0ZXJcbiAgICAvLyBpcyBkaWZmZXJlbnQsIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiB0aGUgdW5pZm9ybSB2YXJpYWJsZS4gIExvb2sgaW4gd2ViZ2wtdXRpbC5qcyBmb3IgdGhlXG4gICAgLy8gaW1wbGVtZW50YXRpb24gb2YgIHNldFVuaWZvcm1zIHRvIHNlZSB0aGUgZGV0YWlscyBmb3Igc3BlY2lmaWMgdHlwZXMgICAgICAgXG4gICAgc2V0VW5pZm9ybXModW5pZm9ybVNldHRlcnMsIHVuaWZvcm1zVGhhdEFyZVRoZVNhbWVGb3JBbGxPYmplY3RzKTtcbiAgICAvLyBDb21wdXRlIHRoZSB2aWV3IG1hdHJpeCBhbmQgY29ycmVzcG9uZGluZyBvdGhlciBtYXRyaWNlcyBmb3IgcmVuZGVyaW5nLlxuICAgIFxuICAgIC8vIGZpcnN0IG1ha2UgYSBjb3B5IG9mIG91ciByb3RhdGlvbk1hdHJpeFxuICAgIG1hdDQuY29weShtYXRyaXgsIHJvdGF0aW9uTWF0cml4KTtcbiAgdmFyIGN1cnIgPSB7XG4gICAgICAgIGxldHRlcjogdW5kZWZpbmVkLFxuICAgICAgICByb3RhdGVaIDogbWF0NC5jcmVhdGUoKSxcbiAgICAgICAgcm90YXRlWCA6IG1hdDQuY3JlYXRlKCksXG4gICAgICAgIGlzU3Bpbm5pbmc6IGZhbHNlLFxuICAgICAgICBzcGlubmluZ1NwZWVkOiAwLjAsXG4gICAgICAgIGhlaWdodDogMC4wLFxuICAgICAgICB1X2NvbG9yTXVsdDogY2hyb21hLmhzdihyYW5kKGJhc2VDb2xvciAtIDEwMCwgYmFzZUNvbG9yICsgMTAwKSwgMC41LCAwLjUpLmdsKCksXG4gICAgICAgIHRleHR1cmU6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5nbGU6IDAuMCxcbiAgICAgICAgcG9zaXRpb25YOiB1bmRlZmluZWQsXG4gICAgICAgIHRpbWU6IDAuMCxcbiAgICAgICAgc3Bpbm5pbmdBbmdsZSA6MC4wXG4gICAgICB9XG4gIHZhciB0ZXh0dXJlO1xuICAgIGlmIChwcmVzc0Zyb21LZXlib2FyZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGN1cnIubGV0dGVyID0gcHJlc3NGcm9tS2V5Ym9hcmQ7XG4gICAgICBjdXJyLmhlaWdodCA9IHJhbmQoLTgwLCAwKTtcbiAgICAgIGlmIChwcmVzc0Zyb21LZXlib2FyZCA9PSA4KSB7XG4gICAgICAgIGxldHRlcnMucG9wKCk7XG4gICAgICAgIHByZXNzRnJvbUtleWJvYXJkID0gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHByZXNzRnJvbUtleWJvYXJkID09IDEzKSB7XG4gICAgICAgICAgbGV0dGVycyA9IFtdO1xuICAgICAgICAgIHByZXNzRnJvbUtleWJvYXJkID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwcmVzc0Zyb21LZXlib2FyZCA+PSA2NSAmJiBwcmVzc0Zyb21LZXlib2FyZCA8PSAxMjIpIHtcbiAgICAgICAgICAgIGlmIChwcmVzc0Zyb21LZXlib2FyZCA+PSA5MSAmJiBwcmVzc0Zyb21LZXlib2FyZCA8PSAxMjIpIHtcbiAgICAgICAgICAgICAgcHJlc3NGcm9tS2V5Ym9hcmQgPSBwcmVzc0Zyb21LZXlib2FyZCAtIDMyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3Vyci5hbmdsZSA9IGRlZ1RvUmFkKHJhbmQoLTIwLCAyMCkpO1xuICAgICAgICAgICAgdmFyIGF4aXMgPSB2ZWMzLnRyYW5zZm9ybU1hdDQoYXhpc1ZlY3RvciwgdmVjMy5mcm9tVmFsdWVzKDAsIDAsIDEpLCBtYXQ0LmNyZWF0ZSgpKTtcbiAgICAgICAgICAgIG1hdDQucm90YXRlKGN1cnIucm90YXRlWiwgbWF0NC5jcmVhdGUoKSwgY3Vyci5hbmdsZSwgYXhpcyk7XG4gICAgICAgICAgICBjdXJyLnRleHR1cmUgPSB0ZXh0dXJlc1twcmVzc0Zyb21LZXlib2FyZCAtIDY1XTtcbiAgICAgICAgICB9XG4gICAgICBpZiAobGV0dGVycy5sZW5ndGggPiBjYXBhY2l0eSkge1xuICAgICAgICBsZXR0ZXJzLnNoaWZ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldHRlcnMucHVzaChjdXJyKTtcbiAgICAgICAgICBwcmVzc0Zyb21LZXlib2FyZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc2NhbGVGb3JMZXR0ZXJzID0gc2NhbGVGYWN0b3IgKiAwLjM7XG4gICAgXG4gICAgc3BhY2luZyA9IDE0MCAvIGNhcGFjaXR5ICogMC4yO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGV0dGVycy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChsZXR0ZXJzW2ldLmxldHRlciAhPSAzMikge1xuICAgICAgbWF0NC5jb3B5KG1hdHJpeCwgcm90YXRpb25NYXRyaXgpO1xuICAgICAgbWF0cml4ID0gbWF0NC5jcmVhdGUoKTtcbiAgICAgIGlmIChsZXR0ZXJzW2ldLmlzU3Bpbm5pbmcpIHtcbiAgICAgICAgaWYgKGxldHRlcnNbaV0udGltZSA+PSAwICYmIGxldHRlcnNbaV0uc3Bpbm5pbmdTcGVlZCA+PSAxLjApIHtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMobGV0dGVyc1tpXS5zcGlubmluZ0FuZ2xlKSA8IDM2MC4wKSB7XG4gICAgICAgICAgICB2YXIgcm90YXRlWSA9IHZlYzMudHJhbnNmb3JtTWF0NChheGlzVmVjdG9yLCB2ZWMzLmZyb21WYWx1ZXMoMCwgMSwgMCksIG1hdDQuY3JlYXRlKCkpO1xuICAgICAgICAgICAgbGV0dGVyc1tpXS5zcGlubmluZ0FuZ2xlID0gbGV0dGVyc1tpXS5zcGlubmluZ1NwZWVkICsgbGV0dGVyc1tpXS5zcGlubmluZ0FuZ2xlO1xuICAgICAgICAgICAgbWF0NC5yb3RhdGUobWF0cml4LCBtYXRyaXgsIGRlZ1RvUmFkKGxldHRlcnNbaV0uc3Bpbm5pbmdBbmdsZSksIHJvdGF0ZVkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXR0ZXJzW2ldLnNwaW5uaW5nU3BlZWQgPSBsZXR0ZXJzW2ldLnNwaW5uaW5nU3BlZWQgLyAyLjA7XG4gICAgICAgICAgICBsZXR0ZXJzW2ldLnRpbWUtLTtcbiAgICAgICAgICAgIGxldHRlcnNbaV0uc3Bpbm5pbmdBbmdsZSA9IDAuMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0dGVyc1tpXS5pc1Nwbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICBsZXR0ZXJzW2ldLnRpbWUgPSAwLjA7XG4gICAgICAgICAgbGV0dGVyc1tpXS5zcGlubmluZ1NwZWVkID0gMC4wO1xuICAgICAgICAgIG1hdHJpeCA9IG1hdDQuY3JlYXRlKCk7XG4gICAgICAgICAgbGV0dGVyc1tpXS5zcGlubmluZ1NwZWVkID0gMC4wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBtYXQ0LmNvcHkobGV0dGVyc1tpXS5yb3RhdGVYLCBtYXRyaXgpO1xuICAgICAgbWF0NC5tdWx0aXBseShtYXRyaXgsIGxldHRlcnNbaV0ucm90YXRlWCwgbGV0dGVyc1tpXS5yb3RhdGVaKTtcbiAgICAgIG1hdDQuc2NhbGUobWF0cml4LCBtYXRyaXgsIFtzY2FsZUZvckxldHRlcnMsIHNjYWxlRm9yTGV0dGVycywgc2NhbGVGb3JMZXR0ZXJzXSk7XG4gICAgICBtYXQ0LmNvcHkodW5pZm9ybXNUaGF0QXJlQ29tcHV0ZWRGb3JFYWNoT2JqZWN0LnVfd29ybGQsIG1hdHJpeCk7XG4gICAgICBtYXQ0Lm11bHRpcGx5KG1hdHJpeCwgdmlld01hdHJpeCwgdW5pZm9ybXNUaGF0QXJlQ29tcHV0ZWRGb3JFYWNoT2JqZWN0LnVfd29ybGQpO1xuICAgICAgbWF0NC5tdWx0aXBseSh1bmlmb3Jtc1RoYXRBcmVDb21wdXRlZEZvckVhY2hPYmplY3QudV93b3JsZFZpZXdQcm9qZWN0aW9uLCBwcm9qZWN0aW9uTWF0cml4LCBtYXRyaXgpO1xuICAgICAgbWF0NC50cmFuc3Bvc2UodW5pZm9ybXNUaGF0QXJlQ29tcHV0ZWRGb3JFYWNoT2JqZWN0LnVfd29ybGRJbnZlcnNlVHJhbnNwb3NlLCBtYXQ0LmludmVydChtYXRyaXgsIHVuaWZvcm1zVGhhdEFyZUNvbXB1dGVkRm9yRWFjaE9iamVjdC51X3dvcmxkKSk7XG4gICAgICBzZXRVbmlmb3Jtcyh1bmlmb3JtU2V0dGVycywgdW5pZm9ybXNUaGF0QXJlQ29tcHV0ZWRGb3JFYWNoT2JqZWN0KTtcbiAgICAgIG9iamVjdFN0YXRlLm1hdGVyaWFsVW5pZm9ybXMudV9jb2xvck11bHQgPSBsZXR0ZXJzW2ldLnVfY29sb3JNdWx0O1xub2JqZWN0U3RhdGUubWF0ZXJpYWxVbmlmb3Jtcy51X3ZlcnRpY2FsUG9zID0gdmVjNC5mcm9tVmFsdWVzKDAsIGxldHRlcnNbaV0uaGVpZ2h0LCAwLCAwKTtcbiAgICAgIGxldHRlcnNbaV0ucG9zaXRpb25YID0gc2NhbGVGYWN0b3IgKiAoaSAqIHNwYWNpbmcgLSBzcGFjaW5nICogMC41ICogKGxldHRlcnMubGVuZ3RoIC0gMSkpIC8gMjAwO1xuICAgICAgb2JqZWN0U3RhdGUubWF0ZXJpYWxVbmlmb3Jtcy51X2Rpc1RvQ2VudGVyID0gdmVjNC5mcm9tVmFsdWVzKHNjYWxlRmFjdG9yICogKGkgKiBzcGFjaW5nIC0gc3BhY2luZyAqIDAuNSAqIChsZXR0ZXJzLmxlbmd0aCAtIDEpKSwgMCwgMCwgMCk7XG4gICAgICBzZXRVbmlmb3Jtcyh1bmlmb3JtU2V0dGVycywgb2JqZWN0U3RhdGUubWF0ZXJpYWxVbmlmb3Jtcyk7XG4gICAgICB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBsZXR0ZXJzW2ldLnRleHR1cmUpO1xuICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgYnVmZmVySW5mby5udW1FbGVtZW50cywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgIH1cbiAgICB9XG4gICAgaWYgKG1vdXNlRG93biAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChjYW52YXMgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChnbCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBtb3VzZVBvc2l0aW9uID0gMC4wO1xuICAgICAgICAgIHZhciBjdXJyRGlzdCA9IEluZmluaXR5O1xuICAgICAgICAgIHZhciBjdXJySUQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICBtb3VzZVBvc2l0aW9uID0gbW91c2VEb3duWzBdIC0gNzE3O1xuICAgICAgICAgIG1vdXNlUG9zaXRpb24gPSBtb3VzZVBvc2l0aW9uLzcxNztcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxldHRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhtb3VzZVBvc2l0aW9uIC0gbGV0dGVyc1tpXS5wb3NpdGlvblgpIDwgY3VyckRpc3Qpe1xuICAgICAgICAgICAgICBjdXJySUQgPSBpO1xuICAgICAgICAgICAgICBjdXJyRGlzdCA9IE1hdGguYWJzKG1vdXNlUG9zaXRpb24gLSBsZXR0ZXJzW2ldLnBvc2l0aW9uWCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsZXR0ZXJzW2N1cnJJRF0uaXNTcGlubmluZyA9PSBmYWxzZSkge1xuICAgICAgICBsZXR0ZXJzW2N1cnJJRF0uaXNTcGlubmluZyA9IHRydWU7XG4gICAgICAgIGxldHRlcnNbY3VycklEXS50aW1lID0gY3VyckRpc3QgKiAzNjA7XG4gICAgICAgIGxldHRlcnNbY3VycklEXS5zcGlubmluZ1NwZWVkID0gbGV0dGVyc1tjdXJySURdLnRpbWUgKiAxMC4wO1xuICAgICAgICB2YXIgc291bmRFZmZlY3QgPSBuZXcgSG93bCh7XG4gICAgICAgICAgdXJsczogWydzb3VuZHMvc3Bpbi5tcDMnXVxuICAgICAgICB9KS5wbGF5KCk7XG4gICAgICAgICAgfSBcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbW91c2VEb3duID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBnbC51c2VQcm9ncmFtKGxpbmVQcm9ncmFtKTtcbiAgICB1bmlmb3JtU2V0dGVycyA9IGNyZWF0ZVVuaWZvcm1TZXR0ZXJzKGdsLCBsaW5lUHJvZ3JhbSk7XG4gICAgYXR0cmliU2V0dGVycyA9IGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMoZ2wsIGxpbmVQcm9ncmFtKTtcbiAgICB2YXIgdW5pZm9ybXNPZkxpbmVzID0ge1xuICAgICAgdV93b3JsZFZpZXdQcm9qZWN0aW9uOiAgbWF0NC5jcmVhdGUoKSxcbiAgICAgIHVfY29sb3JNdWx0OiBbMCwgMCwgMCwgMV0sXG4gICAgICB1X2hvcml6b250YWxQb3M6IHZlYzQuY3JlYXRlKCksXG4gICAgICB1X2hlaWdodDogMC4wXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGV0dGVycy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChsZXR0ZXJzW2ldLmxldHRlciAhPSAzMikge1xuICAgICAgdmFyIGhvcml6b250YWxQb3MgPSBzY2FsZUZhY3RvciAqIChpICogc3BhY2luZyAtIHNwYWNpbmcgKiAwLjUgKiAobGV0dGVycy5sZW5ndGggLSAxKSkgLyAyMDA7XG4gICAgICB1bmlmb3Jtc09mTGluZXMudV9jb2xvck11bHQgPSBsZXR0ZXJzW2ldLnVfY29sb3JNdWx0O1xuICAgICAgdW5pZm9ybXNPZkxpbmVzLnVfaG9yaXpvbnRhbFBvcyA9IHZlYzQuZnJvbVZhbHVlcyhob3Jpem9udGFsUG9zLCAwLCAwLCAwKTtcbiAgICAgIHVuaWZvcm1zT2ZMaW5lcy51X2hlaWdodCA9IGxldHRlcnNbaV0uaGVpZ2h0IC8gMjAwO1xuICAgICAgc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXMoZ2wsIGF0dHJpYlNldHRlcnMsIGJ1ZmZlckluZm8wKTtcbiAgICAgIHNldFVuaWZvcm1zKHVuaWZvcm1TZXR0ZXJzLCB1bmlmb3Jtc09mTGluZXMpO1xuICAgICAgZ2wubGluZVdpZHRoKDIuMCk7XG4gICAgICBnbC5kcmF3RWxlbWVudHMoZ2wuTElORVMsIDIsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICB9XG4gICAgfVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXdTY2VuZSk7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
