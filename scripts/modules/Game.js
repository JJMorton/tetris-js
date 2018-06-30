'use strict';

class Game {
    
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.frameCount = 0;
        this.delta = 0;
        this.deltaMin = 0;
        this.lastFrameTime = 0;
        this.playing = false;

        window.addEventListener('resize', this._resizeCanvas.bind(this));
    }

    animate() {
        /*
         * Changing the tick property allows for rendering
         * of different scenes that can be defined as separate
         * functions in the main file
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
        this._resizeCanvas();
        this.animate();
    }

    _resizeCanvas() {
        const size = this.resizeCanvas();
        this.canvas.width = size.width;
        this.canvas.height = size.height;
    }


    /* Override in main file */
    
    resizeCanvas() {} // -> { width, height }
    init() {}
    tick() {}

}
