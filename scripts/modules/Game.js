export class Game {
    
    constructor() {
        this.frameCount = 0;
        this.delta = 0;
        this.deltaMin = 0;
        this.lastFrameTime = 0;
        this.playing = false;
    }

    animate() {
        /*
         * Changing the draw property allows for rendering
         * of different scenes that can be defined as separate
         * draw functions in the main file
         */

        // Timing calculations
        const currentTime = performance.now();
        this.delta = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Rendering
        this.tick(this);

        // Next frame
        this.deltaMin = performance.now() - this.lastFrameTime;
        this.frameCount++;
        requestAnimationFrame(this.animate.bind(this));
    }

    start() {
        this.init();
        this.animate();
    }


    /* Override in main file */
    
    init() {}
    tick() {}

}
