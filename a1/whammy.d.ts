declare module Whammy {
     class Video {
		constructor(speed?: number, quality?: number);
		
		// frame must be a a HTMLCanvasElement, a CanvasRenderingContext2D 
		// or a DataURI formatted string
		add(frame: HTMLCanvasElement, duration?: number);
		add(frame: CanvasRenderingContext2D, duration?: number);		
		add(frame: string, duration?: number);

		compile(outputAsArray: boolean): Uint8Array | Blob;		
	}

	function fromImageArray(images: Array<string>, fps?: number, outputAsArray?: boolean);
}

//declare var Whammy: whammy.Video;

declare module "whammy" {
	export = Whammy;
}
 