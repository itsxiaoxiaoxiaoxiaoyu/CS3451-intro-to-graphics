
/*
 * convenience functions for loading shaders, and loading meshes in a simple JSON format.
 * 
 * loadFile/loadFiles from http://stackoverflow.com/questions/4878145/javascript-and-webgl-external-scripts
 * loadMesh adapted from various loaders in http://threejs.org
 */


function loadFile(url, data, callback, errorCallback) {
	// Set up an asynchronous request
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	// Hook the event that gets called as the request progresses
	request.onreadystatechange = function () {
		// If the request is "DONE" (completed or failed)
		if (request.readyState == 4) {
			// If we got HTTP status 200 (OK)
			if (request.status == 200) {
				callback(request.responseText, data)
			} else { // Failed
				errorCallback(url);
			}
		}
	};

	request.send(null);    
}

export function loadFiles(urls, callback, errorCallback) {
	var numUrls = urls.length;
	var numComplete = 0;
	var result = [];

	// Callback for a single file
	function partialCallback(text, urlIndex) {
		result[urlIndex] = text;
		numComplete++;

		// When all files have downloaded
		if (numComplete == numUrls) {
			callback(result);
		}
	}

	for (var i = 0; i < numUrls; i++) {
		loadFile(urls[i], i, partialCallback, errorCallback);
	}
}



/*
 * Load a Mesh file asynchronously from a file stored on the web.
 * The results will be provided to the "onLoad" callback, and are a Mesh object
 * with an array of vertices and an array of triangles as members.
 * 
 * For example:  
 * var onLoad = function (mesh: loader.Mesh) {
 *  	console.log("got a mesh: " + mesh);
 * }
 * var onProgress = function (progress: ProgressEvent) {
 *  	console.log("loading: " + progress.loaded + " of " + progress.total + "...");
 * }
 * var onError = function (error: ErrorEvent) {
 *  	console.log("error! " + error);
 * }
 * 
 * loader.loadMesh("models/venus.json", onLoad, onProgress, onError);
 * 
 */

export type Vertex = [number, number, number];
export type Triangle = [number, number, number];

export interface Mesh {
	v: Array<Vertex>;
	t: Array<Triangle>;
}

// if there is a current request outstanding, this will be set to it
var currentRequest = undefined;

export function loadMesh ( url: string, 
					onLoad: (data: any) => void, 
					onProgress?: (progress: ProgressEvent) => void, 
					onError?: (error: ErrorEvent) => void ): XMLHttpRequest {

    // if there is a request in progress, abort it.
    if (currentRequest !== undefined) {
		request.abort();
		currentRequest = undefined;
	}

	// set up the new request	
	var request = new XMLHttpRequest();
	request.open( 'GET', url, true );
	currentRequest = request;  // save it, so we can abort if another request is made by the user
	
	request.addEventListener( 'load', function ( event ) {
		// finished with the current request now
		currentRequest = undefined;
		
		//var json = this.response;  /// already in JSON format, don't need: 
		var json = JSON.parse( this.response );

		// we'll put a metadata field in the object, just to be sure it's one of ours
		var metadata = json.metadata;
		if ( metadata !== undefined ) {
			if ( metadata.type !== 'triangles' ) {
				console.error( 'Loader: ' + url + ' should be a "triangles" files.' );
				return;
			}
		} else {
			console.error( 'Loader: ' + url + ' does not have a metadata field.' );
			return;				
		}

		var object = validate( json, url );
		
		if (object !== undefined) {
			console.log("Loader: " + url + " contains " + object.v.length + " vertices " +
				" and " + object.t.length + " triangles.")
		}
		onLoad( object );
	}, false );

	if ( onProgress !== undefined ) {
		request.addEventListener( 'progress', function ( event ) {
			onProgress( event );
		}, false );
	}

	if ( onError !== undefined) {
		request.addEventListener( 'error', function ( event ) {
			currentRequest = undefined; // request failed, clear the current request field
			if ( onError ) onError( event );
		}, false );
	}

	// ask for a "json" file
	//request.responseType = "json";
	request.send( null );

	return request;
}

// validate the received JSON, just to make sure it's what we are expecting (and thus avoid
// bugs down the road in our code)
function validate(json: any, url: string): Mesh {
	if (json instanceof Object && 
			json.hasOwnProperty('t') &&
			json.t instanceof Array && 	
			json.hasOwnProperty('v') &&
			json.v instanceof Array) {

	    var numV = json.v.length;
		for (var i in json.t) {
			if (!(json.t[i] instanceof Array &&
				json.t[i].length == 3 &&
				typeof json.t[i][0] == "number" &&
				typeof json.t[i][1] == "number" &&
				typeof json.t[i][2] == "number" && 
				json.t[i][0] < numV &&
				json.t[i][1] < numV &&
				json.t[i][2] < numV)) {
				console.log("Loader: json file " + url + ", invalid t[" + i + "].");
				return undefined;						  
			}
		} 
		for (var i in json.v) {
			if (!(json.v[i] instanceof Array &&
				json.v[i].length == 3 &&
				typeof json.v[i][0] == "number" &&
				typeof json.v[i][1] == "number" &&
				typeof json.v[i][2] == "number")) {
				console.log("Loader: json file " + url + ", invalid v[" + i + "].");
				return undefined;						  
			}
			i++;
		} 
		return <Mesh>json;  
	} else {
		console.log("Loader: json file " + url + " does not have .t and .v members.");
		return undefined;
	}
}