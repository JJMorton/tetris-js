'use strict';

class Particle {

    constructor(x, y, colour) {
        this.vel = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.7) * 8 };
        this.pos = {x, y};
        this.colour = colour;
        this.finished = false;
    }

    tick() {
        this.vel.y += 0.1;

        this.pos.y += this.vel.y;
        this.pos.x += this.vel.x;

        if (this.pos.y > window.innerHeight || this.pos.x < 0 || this.pos.x > window.innerWidth) {
            this.finished = true;
        }
    }

    render(ctx) {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.pos.x, this.pos.y, 4, 4);
    }

}
