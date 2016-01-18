# Assignment 4: Shaders

## Due: Monday Nov 9th, 5pm

## Assignment Details

For this project, you will be programming the GPU using *vertex* and *fragment* hardware shaders to accomplish various visual effects.  As we discussed in class:

* Fragment shaders are used to render individual "fragments" on the screen (basically, they render individual pixels). They are typically used to modify the coloring and lighting of the polygons being rendered.
* Vertex shaders are used to modify the vertex positions ```(x,y,z)``` of the polygons being rendered. 

Vertex shaders cannot introduce additional vertices, or delete existing ones -- they are limited by the meshes they are given. (Unlike geometry shaders, which are outside the scope of this project).

Vertex and fragment shaders are typically used together in pairs, as a *shader program* -- that is, you use one vertex shader and one fragment shader to render something in a particular style, where the outputs of the vertex shader and the inputs of the fragment shader are coordinated.

## Requirements

**For this project, you will be implementing four shader programs**. Three of them will have most of the work in the fragment shader, and one of them will have most of the work in the vertex shader. You have several options for each of the four shaders, so you can choose whichever seems most interesting to you.

**Include a description in your A4.html web page describing what shaders you chose to implement, and any details about how you chose to implement them!**

1. **Texture Generation (fragment shader)**

   Modify the fragment shader to generate a texture on the fly (i.e., do not pass in a texture), from one of the following options:
	
  1. Mandlebrot fractal
	
	Draw the fractal known as the Mandelbrot Set. Display a white or black Mandelbrot set on some colored background. The colors (and possibly color bands) for the background are for you to decide. Let ```z(n+1) = z(n)^2 + c```, where ```z``` and ```c``` are both complex numbers. The Mandelbrot set is essentially a map of what happens when using different values of ```c``` (which correspond to different locations in the plane). Let ```z(0) = (0,0)```, and look at the values ```z(1)=z(0)^2+c, z(2)=z(1)^2+c```, and so on. Plugging the result of a function back into itself is called iteration. If these iterated values stay near zero (never leave a circle of radius ```2```), then draw a white or black dot at the location ```c```. If the values do leave the circle, color them something else. Do this for all the values for values of ```c``` such that ```cx``` is in ```[-2,2]``` and ```cy``` is in ```[-2,2]```. The result is the Mandelbrot Set. Use at least 20 iterations of the function to create your Mandelbrot set.
	
	To get more interesting color bands, you can color the fragment differently depending on how many iterating it takes for the values to leave the radius.  Here's an example of what the texture might look like:

    ![Mandelbrot](https://github.gatech.edu/pages/cs3451f15/a4/img/mandelbrot-image.png)
	
  2. Julia set fractal ```z(n+1) = z(n)^2 + c, where c = (0, sin(time))```
	
	This fractal of the Julia set is in some sense the inverse of the Mandlebrot Set. To make a Julia set fractal, use the same equations and iterations as above, but start ```z``` at the current texture coordinate instead of ```(0,0)```, and set ```c = (0, f(sin(time)))```. 
	
	To get the time, you can pass it in as a uniform variable. As a result you will get a whole bunch of variations of the Julia fractal, animating over time.

    ![Julia](https://github.gatech.edu/pages/cs3451f15/a4/img/julia-z2.png)
	
  3. Julia set fractal ```z(n+1) = z(n)^6 + c, where c = (0, sin(time)/2.0 + 0.5)```
	
	Same as (2), but with a different formula to update ```z``` and ```c```.
	
	Note that ```z^6``` is just computed as the complex multiplication ```z * z * z * z * z * z```, which is easy to write with a for-loop.

    ![Julia](https://github.gatech.edu/pages/cs3451f15/a4/img/julia-z6.png)
	
2. **Transparency (fragment shader)**

	Modify the fragment shader to do something interesting with transparency, from one of the following options:

 1. Turn the plane into *swiss cheese* by adding transparent holes all over it. 
	
	Hint: you can use the *discard* glsl function to "throw away" a particular pixel in a fragment shader, so that it won't be rendered at all). The holes should be circular, but you have some discretion with their radius and spacing.
	
 2. Simulate an "x-ray light"
	
	Make the plane transparent where the light is brightest. Make the size of the transparent hole "pulse" by changing its size as a smooth function of time (i.e., make the brightness threshold a function of time).
	
3. **Image Manipulation (fragment shader)**

	Modify the fragment shader to accept two image textures and do some form of image manipulation to blend two image textures, picking from one of the following options:

 1. Green Screen Removal
	
    Blend the images using green screen removal.  One should be of a "green screen" scene (e.g., like this [picture of Ewan McGregor](http://www.justjared.com/photo-gallery/2777540/ewan-mcgregor-green-screen-fun-with-jimmy-fallon-12/fullsize/)). 
	The other should be the image you want to blend the green screen image on top of.  
	
	Green screen removal works by replacing all "predominantly green" pixels in the first image with the pixels from the second image.
	
    Will need to pay attention to two details.  First, you cannot assume all green pixels are a specific pixel value;  rather, you should check the pixels 
	to see how "green" they are and come up with a (simple) metric for when to replace a pixel.  Second, you should try to
	do some blending at the border between green and non-green 
	(hint: look at the webglfundamentals.org discussion of image manipulation and convolution kernels).
	You should sample the pixels around the target pixel in your green screened image, to see if it is at the boundary of green and non-green values, 
	and if so set a transparency value to blend the pixels from the two images.  In other words, in an area of all green, you should display the 
	background image, and in an area of no green, you should display the green-screen image;  in the boundary, you should blend between the two.  The blend 
	should be heavily biased to the background to avoid having a green halo around non-green parts of the image.

 2. Brightness based blending
 
    Blend the images using the "lightness" of one image to determine the blend.  
	    
	You can compute a grey-scale "lightness" value of a pixel as a weighted-average of its ```r,g,b''' components: ```0.2 r + 0.7 g + 0.1 b'''. The three components are *not* weighted equally, because the human eye is better at seeing green than red or blue.
	
	You should use the "Y" position of the mouse over the window to control the blend (convert Y to a ```0 ... 1``` value and use it as a threshold).  
	You should have a small window around the threshold value through which blending occurs (e.g., if the threshold is .5, and the window is .1 wide, 
	then values below .45 are from one image, values above .55 are from the other, and values from .45 to .55 smoothly blend from one image to the other.
	 	
4. **Vertex Shader**

	Modify the vertex shader to deform the objects, from one of the following options. **For this part of the assignment you are additionally required to sub-divide the quad into a grid of smaller quads**, otherwise the vertex shader won't have enough vertices to play with.
	
 1. Warble

	Modify the vertices of the quad so that it "warbles" by moving the *y* or *z* component of each vertex with a ```sin``` function of some 
	combination of the *x* component and time (or mouse position). Modify the normal vectors to make the waves darker where they bend.
	
 2. Ripple

	Like (a), but make the vertices ripple ``outward'' radially from the center of the plane, like a pebble dropped into a pond. 
	A new wave should start when you press the space key, and last for a few seconds, getting smaller as it moves toward the edge of the quad.
	
	Modify the normal vectors to make the waves darker where they bend.
	
 3. Orbit

	Make the shapes smaller, and move them in a circle on the ```x,y``` plane (translating, not rotating) as a function of time or mouse position.

 4. Light phobia

	Make the shapes "afraid" of the light by moving points away from the light based on the proximity of the specular highlight to
	the vertex (this will make a larger area where the light is bright). 

## Sample Code

The sample code is quite similar to the code for A3, but displays a single quadrilateral (quad).  
We have replaced the model loading and subdivide buttons with 4 "effect" buttons.  
You should change the text on each button to reflect what the shader effect you chose is, and add text below the WebGL canvas describing 
what each effect is.
   
The starting shader code are the shaders from A3. 

## Reference material/help

Resources that might be helpful include

* https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf  (WebGL quick reference card)
* https://en.wikipedia.org/wiki/Mandelbrot_set
* https://en.wikipedia.org/wiki/Julia_set
* http://www.wikihow.com/Plot-the-Mandelbrot-Set-By-Hand

## IMPORTANT: you must use "gulp" 

Because the sample program loads data from a webserver using HTTP requests, similarly to A3, you cannot run the sample program by opening it directly.  You must either copy all the data to a web server, or using the gulp command (with the provided gulpfile.js) to run a node server directly.

We have set up the gulpfile so that if you modify any of the .ts files, it will rebuild them using your tsconfig.json file and make them available to it's web server. Therefore, you can run ```gulp watch``` from the command line to build your files and serve them up at ```http://localhost:8080/a4.html```.

## Submission

Your grade will be based on satisfying the requirements described above.  You should submit your entire code directory (WITHOUT the ```node_modules``` or ```typings``` directories generated by npm and tsd) in a clean zip file, as in the first three assignments.  

Make sure you submit any assests, such as image files you load in as textures.

You can probably implement the whole assignment wihtout adding any more .ts files, but if you add any .ts files, the tsconfig.json should be updated to include them.  **Use the file names we have requested.** (a4.html, a4.ts).  The TAs need to be able to test your program as follows:

1. cd into the directory and run ```npm install``` and ```tsd install```
2. compile and start the server with ```gulp watch```
3. open and view the web page ```localhost:8080/a4.html```
