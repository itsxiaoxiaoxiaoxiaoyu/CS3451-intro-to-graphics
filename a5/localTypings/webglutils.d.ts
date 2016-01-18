  /**
   * @typedef {Object} AttribInfo
   * @property {number} [numComponents] the number of components for this attribute.
   * @property {number} [size] the number of components for this attribute.
   * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
   * @property {boolean} [normalized] whether or not to normalize the data. Default = false
   * @property {number} [offset] offset into buffer in bytes. Default = 0
   * @property {number} [stride] the stride in bytes per element. Default = 0
   * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
   * @memberOf module:webgl-utils
   */
  
 interface AttribInfo {
   buffer: WebGLBuffer;
   numComponents: number;
   type: number;
   normalize: boolean;
 }
 
 /**
   * Creates a set of attribute data and WebGLBuffers from set of arrays
   *
   * Given
   *
   *      var arrays = {
   *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
   *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *      };
   *
   * returns something like
   *
   *      var attribs = {
   *        a_position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        a_texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        a_normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        a_color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
   *      };
   *
   * @param {WebGLRenderingContext} gl The webgl rendering context.
   * @param {Object.<string, array|typedarray>} arrays The arrays
   * @param {Object.<string, string>} [opt_mapping] mapping from attribute name to array name.
   *     if not specified defaults to "a_name" -> "name".
   * @return {Object.<string, module:webgl-utils.AttribInfo>} the attribs
   * @memberOf module:webgl-utils
   */
declare function createAttribsFromArrays(gl: WebGLRenderingContext, 
                  arrays: any, opt_mapping?): any;

 /**
   * Creates buffers from typed arrays
   *
   * Given something like this
   *
   *     var arrays = {
   *        positions: [1, 2, 3],
   *        normals: [0, 0, 1],
   *     }
   *
   * returns something like
   *
   *     buffers = {
   *       positions: WebGLBuffer,
   *       normals: WebGLBuffer,
   *     }
   *
   * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
   *
   * @param {WebGLRenderingContext) gl A WebGLRenderingContext.
   * @param {Object<string, array|typedarray>} arrays
   * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
   * @memberOf module:webgl-utils
   */
declare function createBuffersFromArrays (gl: WebGLRenderingContext, 
                  arrays: any): any;

  /**
   * @typedef {Object} BufferInfo
   * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
   * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
   * @property {Object.<string, module:webgl-utils.AttribInfo>} attribs The attribs approriate to call `setAttributes`
   * @memberOf module:webgl-utils
   */
interface BufferInfo {
  numElements: number;
  indicies?: WebGLBuffer;
  attribs: any; 
}

  /**
   * Creates a BufferInfo from an object of arrays.
   *
   * This can be passed to {@link module:webgl-utils.setBuffersAndAttributes} and to
   * {@link module:webgl-utils:drawBufferInfo}.
   *
   * Given an object like
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *     };
   *
   *  Creates an BufferInfo like this
   *
   *     bufferInfo = {
   *       numElements: 4,        // or whatever the number of elements is
   *       indices: WebGLBuffer,  // this property will not exist if there are no indices
   *       attribs: {
   *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
   *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
   *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
   *       },
   *     };
   *
   *  The properties of arrays can be JavaScript arrays in which case the number of components
   *  will be guessed.
   *
   *     var arrays = {
   *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
   *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
   *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
   *        indices:  [0, 1, 2, 1, 2, 3],
   *     };
   *
   *  They can also by TypedArrays
   *
   *     var arrays = {
   *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
   *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
   *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
   *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
   *     };
   *
   *  Or augmentedTypedArrays
   *
   *     var positions = createAugmentedTypedArray(3, 4);
   *     var texcoords = createAugmentedTypedArray(2, 4);
   *     var normals   = createAugmentedTypedArray(3, 4);
   *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
   *
   *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
   *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
   *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
   *     indices.push([0, 1, 2, 1, 2, 3]);
   *
   *     var arrays = {
   *        position: positions,
   *        texcoord: texcoords,
   *        normal:   normals,
   *        indices:  indices,
   *     };
   *
   * For the last example it is equivalent to
   *
   *     var bufferInfo = {
   *       attribs: {
   *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
   *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
   *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
   *       },
   *       indices: gl.createBuffer(),
   *       numElements: 6,
   *     };
   *
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
   *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {Object.<string, array|object|typedarray>} arrays Your data
   * @param {Object.<string, string>} [opt_mapping] an optional mapping of attribute to array name.
   *    If not passed in it's assumed the array names will be mapped to an attibute
   *    of the same name with "a_" prefixed to it. An other words.
   *
   *        var arrays = {
   *           position: ...,
   *           texcoord: ...,
   *           normal:   ...,
   *           indices:  ...,
   *        };
   *
   *        bufferInfo = createBufferInfoFromArrays(gl, arrays);
   *
   *    Is the same as
   *
   *        var arrays = {
   *           position: ...,
   *           texcoord: ...,
   *           normal:   ...,
   *           indices:  ...,
   *        };
   *
   *        var mapping = {
   *          a_position: "position",
   *          a_texcoord: "texcoord",
   *          a_normal:   "normal",
   *        };
   *
   *        bufferInfo = createBufferInfoFromArrays(gl, arrays, mapping);
   *
   * @return {module:webgl-utils.BufferInfo} A BufferInfo
   * @memberOf module:webgl-utils
   */
declare function createBufferInfoFromArrays (gl: WebGLRenderingContext, 
                          arrays: any, opt_mapping?: any): BufferInfo;

/**
   * Creates setter functions for all attributes of a shader
   * program. You can pass this to {@link module:webgl-utils.setBuffersAndAttributes} to set all your buffers and attributes.
   *
   * @see {@link module:webgl-utils.setAttributes} for example
   * @param {WebGLProgram} program the program to create setters for.
   * @return {Object.<string, function>} an object with a setter for each attribute by name.
   * @memberOf module:webgl-utils
   */
 
declare function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram): any;

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @memberOf module:webgl-utils
   */
declare function createProgram(gl: WebGLRenderingContext, shaders: WebGLShader[],
                            opt_attribs?: string[], opt_locations?: number[], 
                            opt_errorCallback?: (string) => void): WebGLProgram;


  /**
   * Creates a program from 2 script tags.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderScriptIds Array of ids of the script
   *        tags for the shaders. The first is assumed to be the
   *        vertex shader, the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:webgl-utils
   */
declare function createProgramFromScripts(gl: WebGLRenderingContext, 
                            shaderScriptIds: string[],
                            opt_attribs?: string[], opt_locations?: number[], 
                            opt_errorCallback?: (string) => void): WebGLProgram;


  /**
   * Creates a program from 2 sources.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:webgl-utils
   */
declare function createProgramFromSources(gl: WebGLRenderingContext, 
                            shaderSources: string[],
                            opt_attribs?: string[], opt_locations?: number[], 
                            opt_errorCallback?: (string) => void): WebGLProgram;
  /**
   * @typedef {Object} ProgramInfo
   * @property {WebGLProgram} program A shader program
   * @property {Object<string, function>} uniformSetters: object of setters as returned from createUniformSetters,
   * @property {Object<string, function>} attribSetters: object of setters as returned from createAttribSetters,
   * @memberOf module:webgl-utils
   */
interface ProgramInfo {
  program: WebGLProgram;
  uniformSetters: any;
  attribSetters: any;
}

  /**
   * Creates a ProgramInfo from 2 sources.
   *
   * A ProgramInfo contains
   *
   *     programInfo = {
   *        program: WebGLProgram,
   *        uniformSetters: object of setters as returned from createUniformSetters,
   *        attribSetters: object of setters as returned from createAttribSetters,
   *     }
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders or ids. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {module:webgl-utils.ProgramInfo} The created program.
   * @memberOf module:webgl-utils
   */

declare function createProgramInfo(gl: WebGLRenderingContext, 
                            shaderSources: string[],
                            opt_attribs?: string[], opt_locations?: number[], 
                            opt_errorCallback?: (string) => void): ProgramInfo;

  /**
   * @typedef {Object.<string, function>} Setters
   */

  /**
   * Creates setter functions for all uniforms of a shader
   * program.
   *
   * @see {@link module:webgl-utils.setUniforms}
   *
   * @param {WebGLProgram} program the program to create setters for.
   * @returns {Object.<string, function>} an object with a setter by name for each uniform
   * @memberOf module:webgl-utils
   */
  
declare function createUniformSetters(gl: WebGLRenderingContext, 
                        program: WebGLProgram): any;


  /**
   * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
   *
   * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
   * but calling this means if you switch from indexed data to non-indexed
   * data you don't have to remember to update your draw call.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {enum} type eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
   * @param {module:webgl-utils.BufferInfo} bufferInfo as returned from createBufferInfoFromArrays
   * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
   * @param {number} [offset] An optional offset. Defaults to 0.
   * @memberOf module:webgl-utils
   */
  
declare function drawBufferInfo(gl: WebGLRenderingContext, type: number, 
          bufferInfo: BufferInfo, count?: number, offset?: number);

  /**
   * @typedef {Object} DrawObject
   * @property {module:webgl-utils.ProgramInfo} programInfo A ProgramInfo as returned from createProgramInfo
   * @property {module:webgl-utils.BufferInfo} bufferInfo A BufferInfo as returned from createBufferInfoFromArrays
   * @property {Object<string, ?>} uniforms The values for the uniforms
   * @memberOf module:webgl-utils
   */
interface DrawObject {
  programInfo: ProgramInfo;
  bufferInfo: BufferInfo;
  uniforms: any;
}

  /**
   * Draws a list of objects
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {DrawObject[]} objectsToDraw an array of objects to draw.
   * @memberOf module:webgl-utils
   */
declare function drawObjectList(gl: WebGLRenderingContext, 
                    objectsToDraw: DrawObject[]): void;

  /**
   * @typedef {Object} GetWebGLContextOptions
   * @property {boolean} [dontResize] by default `getWebGLContext` will resize the canvas to match the size it's displayed.
   * @property {boolean} [noTitle] by default inserts a copy of the `<title>` content into the page
   * @memberOf module:webgl-utils
   */
interface GetWebGLContextOptions {
  dontResize?: boolean;
  noTitle?: boolean;
}
  /**
   * Gets a WebGL context.
   * makes its backing store the size it is displayed.
   * @param {HTMLCanvasElement} canvas a canvas element.
   * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
   * @param {module:webgl-utils.GetWebGLContextOptions} [opt_options] options
   * @memberOf module:webgl-utils
   */
declare function getWebGLContext(canvas: HTMLCanvasElement, 
          opt_attribs?: any, 
          opt_options?: GetWebGLContextOptions): WebGLRenderingContext;

/** update the css className if we're displayed in an iFrame */
declare function updateCSSIfInIFrame(): void;

  /**
   * Given an extension name like WEBGL_compressed_texture_s3tc
   * returns the supported version extension, like
   * WEBKIT_WEBGL_compressed_teture_s3tc
   * @param {string} name Name of extension to look for
   * @return {WebGLExtension} The extension or undefined if not
   *     found.
   * @memberOf module:webgl-utils
   */
declare function getExtensionWithKnownPrefixes(gl: WebGLRenderingContext, 
          name: string): any;

  /**
   * Resize a canvas to match the size its displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {boolean} true if the canvas was resized.
   * @memberOf module:webgl-utils
   */
declare function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean;

  /**
   * Sets attributes and binds buffers (deprecated... use {@link module:webgl-utils.setBuffersAndAttributes})
   *
   * Example:
   *
   *     var program = createProgramFromScripts(
   *         gl, ["some-vs", "some-fs");
   *
   *     var attribSetters = createAttributeSetters(program);
   *
   *     var positionBuffer = gl.createBuffer();
   *     var texcoordBuffer = gl.createBuffer();
   *
   *     var attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the buffers AND set the
   * attributes.
   *
   *     setAttributes(attribSetters, attribs);
   *
   * Properties of attribs. For each attrib you can add
   * properties:
   *
   * *   type: the type of data in the buffer. Default = gl.FLOAT
   * *   normalize: whether or not to normalize the data. Default = false
   * *   stride: the stride. Default = 0
   * *   offset: offset into the buffer. Default = 0
   *
   * For example if you had 3 value float positions, 2 value
   * float texcoord and 4 value uint8 colors you'd setup your
   * attribs like this
   *
   *     var attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *       a_color: {
   *         buffer: colorBuffer,
   *         numComponents: 4,
   *         type: gl.UNSIGNED_BYTE,
   *         normalize: true,
   *       },
   *     };
   *
   * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
   * @param {Object.<string, module:webgl-utils.AttribInfo>} buffers AttribInfos mapped by attribute name.
   * @memberOf module:webgl-utils
   * @deprecated use {@link module:webgl-utils.setBuffersAndAttributes}
   */
declare function setAttributes(setters: any, buffers: any): void;

  /**
   * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
   *
   * Example:
   *
   *     var programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs");
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *     };
   *
   *     var bufferInfo = createBufferInfoFromArrays(gl, arrays);
   *
   *     gl.useProgram(programInfo.program);
   *
   * This will automatically bind the buffers AND set the
   * attributes.
   *
   *     setBuffersAndAttributes(programInfo.attribSetters, bufferInfo);
   *
   * For the example above it is equivilent to
   *
   *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   *     gl.enableVertexAttribArray(a_positionLocation);
   *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
   *     gl.enableVertexAttribArray(a_texcoordLocation);
   *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
   * @param {Object.<string, function>} setters Attribute setters as returned from `createAttributeSetters`
   * @param {module:webgl-utils.BufferInfo} buffers a BufferInfo as returned from `createBufferInfoFromArrays`.
   * @memberOf module:webgl-utils
   */
  declare function setBuffersAndAttributes(gl: WebGLRenderingContext, setters: any, buffers: any): void;

  /**
   * Set uniforms and binds related textures.
   *
   * example:
   *
   *     var programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs");
   *
   *     var tex1 = gl.createTexture();
   *     var tex2 = gl.createTexture();
   *
   *     ... assume we setup the textures with data ...
   *
   *     var uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the textures AND set the
   * uniforms.
   *
   *     setUniforms(programInfo.uniformSetters, uniforms);
   *
   * For the example above it is equivalent to
   *
   *     var texUnit = 0;
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex1);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex2);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
   *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
   *     gl.uniformMatrix4fv(u_someMatrix, false, [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ]);
   *
   * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
   *
   *     var uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *     };
   *
   *     var moreUniforms {
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     setUniforms(programInfo.uniformSetters, uniforms);
   *     setUniforms(programInfo.uniformSetters, moreUniforms);
   *
   * @param {Object.<string, function>} setters the setters returned from
   *        `createUniformSetters`.
   * @param {Object.<string, value>} an object with values for the
   *        uniforms.
   * @memberOf module:webgl-utils
   */
declare function setUniforms(setters: any, values: any): void;

  /**
   * Creates a webgl context. If creation fails it will
   * change the contents of the container of the <canvas>
   * tag to an error message with the correct links for WebGL.
   * @param {HTMLCanvasElement} canvas. The canvas element to
   *     create a context from.
   * @param {WebGLContextCreationAttirbutes} opt_attribs Any
   *     creation attributes you want to pass in.
   * @return {WebGLRenderingContext} The created context.
   * @memberOf module:webgl-utils
   */
declare function setupWebGL(canvas: HTMLCanvasElement, 
          opt_attribs?: any): WebGLRenderingContext;
