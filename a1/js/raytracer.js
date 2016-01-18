///<reference path='./whammy.d.ts'/>
define(["require", "exports"], function (require, exports) {
    // classes from the Typescript RayTracer sample
    var Vector = (function () {
        function Vector(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        Vector.times = function (k, v) { return new Vector(k * v.x, k * v.y, k * v.z); };
        Vector.minus = function (v1, v2) { return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z); };
        Vector.plus = function (v1, v2) { return new Vector(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z); };
        Vector.dot = function (v1, v2) { return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z; };
        Vector.mag = function (v) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); };
        Vector.norm = function (v) {
            var mag = Vector.mag(v);
            var div = (mag === 0) ? Infinity : 1.0 / mag;
            return Vector.times(div, v);
        };
        Vector.cross = function (v1, v2) {
            return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
        };
        return Vector;
    })();
    var Color = (function () {
        function Color(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        Color.scale = function (k, v) { return new Color(k * v.r, k * v.g, k * v.b); };
        Color.plus = function (v1, v2) { return new Color(v1.r + v2.r, v1.g + v2.g, v1.b + v2.b); };
        Color.times = function (v1, v2) { return new Color(v1.r * v2.r, v1.g * v2.g, v1.b * v2.b); };
        Color.toDrawingColor = function (c) {
            var legalize = function (d) { return d > 1 ? 1 : d; };
            return {
                r: Math.floor(legalize(c.r) * 255),
                g: Math.floor(legalize(c.g) * 255),
                b: Math.floor(legalize(c.b) * 255)
            };
        };
        Color.white = new Color(1.0, 1.0, 1.0);
        Color.grey = new Color(0.5, 0.5, 0.5);
        Color.black = new Color(0.0, 0.0, 0.0);
        Color.background = Color.black;
        Color.defaultColor = Color.black;
        return Color;
    })();
    var Camera = (function () {
        /*constructor(public pos: Vector, lookAt: Vector) */
        function Camera(pos, lookAt, distance, hsize, vsize) {
            this.pos = pos;
            this.distance = distance;
            this.forward = Vector.norm(Vector.minus(lookAt, this.pos));
            var tempt = Vector.norm(new Vector(0, -hsize, 0));
            this.right = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, tempt)));
            tempt = Vector.norm(new Vector(0, -vsize, 0));
            tempt = Vector.norm(Vector.cross(this.forward, tempt));
            this.up = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, tempt)));
            // var down = new Vector(0.0, -1.0, 0.0);
            // this.forward = Vector.norm(Vector.minus(lookAt, this.pos));
            // this.right = Vector.norm(Vector.cross(this.forward, down));
            // this.up = Vector.times(1.5, Vector.norm(Vector.cross(this.forward, this.right)));
            console.log(this.up);
            // forward Vector {x: -0.5204834387696162, y: -0.40482045237636816, z: -0.7518094115561123}
            // right:x:Vector {x: -1.2332882874656679, y: 0, z: 0.8538149682454625
            // up: x: -0.3456417616908426, y: 1.3715942924239783, z: -0.4992603224423281}
        }
        return Camera;
    })();
    var Sphere = (function () {
        function Sphere(center, radius, surface) {
            this.center = center;
            this.surface = surface;
            this.radius2 = radius * radius;
        }
        Sphere.prototype.normal = function (pos) { return Vector.norm(Vector.minus(pos, this.center)); };
        Sphere.prototype.getCenter = function (time) {
            var angle = (Math.PI * 2 * time);
            var sin = Math.sin(angle);
            sin = Math.pow(sin, 3);
            this.center.x = this.center.x + sin * 2;
            return this.center;
        };
        Sphere.prototype.intersect = function (ray, time) {
            var eo = Vector.minus(this.center, ray.start);
            var v = Vector.dot(eo, ray.dir);
            var dist = 0;
            if (v >= 0) {
                var disc = this.radius2 - (Vector.dot(eo, eo) - v * v);
                if (disc >= 0) {
                    dist = v - Math.sqrt(disc);
                }
            }
            if (dist === 0) {
                return null;
            }
            else {
                return { thing: this, ray: ray, dist: dist };
            }
        };
        return Sphere;
    })();
    var MovingSphere = (function () {
        function MovingSphere(center, radius, surface) {
            this.center = center;
            this.surface = surface;
            this.radius2 = radius * radius;
        }
        MovingSphere.prototype.normal = function (pos) { return Vector.norm(Vector.minus(pos, this.center)); };
        MovingSphere.prototype.computeCenter = function (time) {
            var angle = (Math.PI * 2 * time);
            var sin = Math.sin(angle);
            sin = Math.pow(sin, 3);
            this.center.x = this.center.x + sin * 2;
            return this.center;
        };
        MovingSphere.prototype.intersect = function (ray, time) {
            var eo = Vector.minus(this.center, ray.start);
            var v = Vector.dot(eo, ray.dir);
            var dist = 0;
            if (v >= 0) {
                var disc = this.radius2 - (Vector.dot(eo, eo) - v * v);
                if (disc >= 0) {
                    dist = v - Math.sqrt(disc);
                }
            }
            if (dist === 0) {
                return null;
            }
            else {
                return { thing: this, ray: ray, dist: dist };
            }
        };
        return MovingSphere;
    })();
    var Plane = (function () {
        function Plane(norm, offset, surface) {
            this.surface = surface;
            this.normal = function (pos) { return norm; };
            this.intersect = function (ray) {
                var denom = Vector.dot(norm, ray.dir);
                if (denom > 0) {
                    return null;
                }
                else {
                    var dist = (Vector.dot(norm, ray.start) + offset) / (-denom);
                    return { thing: this, ray: ray, dist: dist };
                }
            };
        }
        return Plane;
    })();
    var Surfaces;
    (function (Surfaces) {
        Surfaces.shiny = {
            diffuse: function (pos) { return Color.white; },
            specular: function (pos) { return Color.grey; },
            reflect: function (pos) { return 0.7; },
            roughness: 250
        };
        Surfaces.checkerboard = {
            diffuse: function (pos) {
                if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
                    return Color.white;
                }
                else {
                    return Color.black;
                }
            },
            specular: function (pos) { return Color.white; },
            reflect: function (pos) {
                if ((Math.floor(pos.z) + Math.floor(pos.x)) % 2 !== 0) {
                    return 0.1;
                }
                else {
                    return 0.7;
                }
            },
            roughness: 150
        };
    })(Surfaces || (Surfaces = {}));
    var RayTracer = (function () {
        function RayTracer() {
            this.maxDepth = 5;
            this.time = 0;
        }
        RayTracer.prototype.intersections = function (ray, scene, time) {
            var closest = +Infinity;
            var closestInter = undefined;
            for (var i = 0; i < 3; i++) {
                var inter = scene.things[i].intersect(ray, time);
                if (inter != null && inter.dist < closest) {
                    closestInter = inter;
                    closest = inter.dist;
                }
            }
            return closestInter;
        };
        RayTracer.prototype.testRay = function (ray, scene, time) {
            var isect = this.intersections(ray, scene, time);
            if (isect != null) {
                return isect.dist;
            }
            else {
                return undefined;
            }
        };
        RayTracer.prototype.traceRay = function (ray, scene, depth, time) {
            var isect = this.intersections(ray, scene, time);
            if (isect === undefined) {
                return Color.background;
            }
            else {
                return this.shade(isect, scene, depth, time);
            }
        };
        RayTracer.prototype.shade = function (isect, scene, depth, time) {
            var d = isect.ray.dir;
            var pos = Vector.plus(Vector.times(isect.dist, d), isect.ray.start);
            var normal = isect.thing.normal(pos);
            var reflectDir = Vector.minus(d, Vector.times(2, Vector.times(Vector.dot(normal, d), normal)));
            var naturalColor = Color.plus(Color.background, this.getNaturalColor(isect.thing, pos, normal, reflectDir, scene, time));
            var reflectedColor = (depth >= this.maxDepth) ? Color.grey : this.getReflectionColor(isect.thing, pos, normal, reflectDir, scene, depth, time);
            return Color.plus(naturalColor, reflectedColor);
        };
        RayTracer.prototype.getReflectionColor = function (thing, pos, normal, rd, scene, depth, time) {
            return Color.scale(thing.surface.reflect(pos), this.traceRay({ start: pos, dir: rd }, scene, depth + 1, time));
        };
        RayTracer.prototype.getNaturalColor = function (thing, pos, norm, rd, scene, time) {
            var _this = this;
            var addLight = function (col, light) {
                var ldis = Vector.minus(light.pos, pos);
                var livec = Vector.norm(ldis);
                var neatIsect = _this.testRay({ start: pos, dir: livec }, scene, time);
                var isInShadow = (neatIsect === undefined) ? false : (neatIsect <= Vector.mag(ldis));
                if (isInShadow) {
                    return col;
                }
                else {
                    var illum = Vector.dot(livec, norm);
                    var lcolor = (illum > 0) ? Color.scale(illum, light.color)
                        : Color.defaultColor;
                    var specular = Vector.dot(livec, Vector.norm(rd));
                    var scolor = (specular > 0) ? Color.scale(Math.pow(specular, thing.surface.roughness), light.color)
                        : Color.defaultColor;
                    return Color.plus(col, Color.plus(Color.times(thing.surface.diffuse(pos), lcolor), Color.times(thing.surface.specular(pos), scolor)));
                }
            };
            return scene.lights.reduce(addLight, Color.defaultColor);
        };
        // end of unmodified functions from the Typescript RayTracing sample
        // The sample render() function has been modified from the original typescript sample in two ways.
        // 1. it renders 1 line at a time, and uses requestAnimationFrame(render) to schedule 
        //    the next line.  This causes the lines to be displayed as they are rendered.
        // 2. it takes addition parameters to allow it to render a smaller # of pixels that the size
        //    of the canvas
        // 3. it takes in a Whammy.Video object and some parameters to render a movie from a sequence
        //    of frames
        RayTracer.prototype.render = function (scene, encoder, length, fps, ctx, screenWidth, screenHeight, canvasWidth, canvasHeight, grid) {
            var _this = this;
            var getPoint = function (x, y, camera) {
                var distance = camera.distance;
                var recenterX = function (x) { return ((x - (screenWidth / 2.0)) / 2.0 / screenWidth) * distance; };
                var recenterY = function (y) { return (-(y - (screenHeight / 2.0)) / 2.0 / screenHeight) * distance; };
                return Vector.norm(Vector.plus(camera.forward, Vector.plus(Vector.times(recenterX(x), camera.right), Vector.times(recenterY(y), camera.up))));
            };
            // rather than doing a for loop for y, we're going to draw each line in
            // an animationRequestFrame callback, so we see them update 1 by 1
            var pixelWidth = canvasWidth / screenWidth;
            var pixelHeight = canvasHeight / screenHeight;
            var y = 0;
            // how many frames       
            var frame = length * fps;
            var interval = length / frame;
            this.time = 0;
            var sphere = scene.things[3];
            // <<< Beginning: THIS WILL GO AWAY in your solution, when you add motion blur
            // we're going to move the sphere around
            // var sphere = <Sphere>scene.things[1];
            // easy way to get a copy of the center
            // var sphereCenter = Vector.times(1.0, sphere.center);
            // sphere.center.x = sphereCenter.x + Math.sin(0)/2;
            //sphere.center.z = sphereCenter.z + Math.cos(0)/2;
            // End >>>>: THIS WILL GO AWAY in your solution, when you add motion blur
            var renderRow = function () {
                for (var x = 0; x < screenWidth; x++) {
                    var c = undefined;
                    for (var p = 0; p < grid; p++) {
                        for (var q = 0; q < grid; q++) {
                            if (_this.time != 0) {
                                var movingsphere = scene.things[1];
                                movingsphere.center = new Vector(sphere.center.x, sphere.center.y, sphere.center.z);
                                var randtime = Math.random() * (interval);
                                randtime = randtime + _this.time;
                                movingsphere.center = scene.things[1].computeCenter(randtime / (length));
                            }
                            else if (_this.time == 0 || _this.time) {
                                var movingsphere = scene.things[1];
                                movingsphere.center = scene.things[1].computeCenter(_this.time / (length));
                            } // sphere.center = sphere.getCenter(this.time);
                            var color = _this.traceRay({ start: scene.camera.pos, dir: getPoint(x + (p + 0.5) / grid, y + (q + 0.5) / grid, scene.camera) }, scene, 0, _this.time);
                            if (!c) {
                                c = color;
                            }
                            else {
                                c = Color.plus(c, color);
                            }
                        }
                    }
                    c = Color.scale(1 / (grid * grid), c);
                    // var color = this.traceRay({ start: scene.camera.pos, dir: getPoint(x, y, scene.camera) }, scene, 0);
                    var filling = Color.toDrawingColor(c);
                    ctx.fillStyle = "rgb(" + String(filling.r) + ", " + String(filling.g) + ", " + String(filling.b) + ")";
                    ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight);
                }
                // finished the row, so increment row # and see if we are done
                y++;
                if (y < screenHeight) {
                    // finished a line, do another
                    requestAnimationFrame(renderRow);
                }
                else {
                    // finished current frame, let see if we have more to render
                    if (frame > 0) {
                        // add last frame to the video
                        encoder.add(ctx);
                        // increment frame, restart the line counter
                        y = 0;
                        frame--;
                        _this.time = _this.time + interval;
                        if (_this.time >= 2) {
                            _this.time = 0;
                        }
                        sphere.center = scene.things[3].getCenter(_this.time / (length));
                        // <<< Beginning: THIS WILL GO AWAY in your solution, when you add motion blur
                        // animate the sphere with a sin function
                        // var angle = (((2 * Math.PI) / length) / fps) * (fps * length - frame); 
                        // var sin = Math.sin(angle);
                        // sin = Math.pow(sin, 3);
                        // sphere.center.x = sphereCenter.x + sin * 2;
                        // End >>>>: THIS WILL GO AWAY in your solution, when you add motion blur
                        // start the next frame         
                        requestAnimationFrame(renderRow);
                    }
                    else {
                        // we are completely done, create the video and add to video element
                        var outputVideo = document.getElementById('output');
                        if (outputVideo) {
                            var blob = encoder.compile(false);
                            var url = URL.createObjectURL(blob);
                            outputVideo.src = url;
                        }
                    }
                }
            };
            renderRow();
        };
        return RayTracer;
    })();
    function defaultScene() {
        return {
            things: [new Plane(new Vector(0.0, 1.0, 0.0), 0.0, Surfaces.checkerboard),
                new MovingSphere(new Vector(0.0, 1.0, -0.25), 1.0, Surfaces.shiny),
                new Sphere(new Vector(-1.0, 0.5, 1.5), 0.5, Surfaces.shiny),
                new Sphere(new Vector(0.0, 1.0, -0.25), 1.0, Surfaces.shiny)],
            lights: [{ pos: new Vector(-2.0, 2.5, 0.0), color: new Color(0.49, 0.07, 0.07) },
                { pos: new Vector(1.5, 2.5, 1.5), color: new Color(0.07, 0.07, 0.49) },
                { pos: new Vector(1.5, 2.5, -1.5), color: new Color(0.07, 0.49, 0.071) },
                { pos: new Vector(0.0, 3.5, 0.0), color: new Color(0.21, 0.21, 0.35) }],
            camera: new Camera(new Vector(3.0, 2.0, 5), new Vector(-1.5, 1.5, -1.5), 3, 480, 480)
        };
    }
    function exec() {
        var canv = document.createElement("canvas");
        canv.width = 480;
        canv.height = 480;
        document.body.appendChild(canv);
        var ctx = canv.getContext("2d");
        var rayTracer = new RayTracer();
        // set up for video recording
        var length = 2; // seconds
        var fps = 10;
        var encoder = new Whammy.Video(fps);
        // start the raytracer
        rayTracer.render(defaultScene(), encoder, length, fps, ctx, 640, 640, 640, 640, 4);
    }
    exec();
});
//# sourceMappingURL=raytracer.js.map