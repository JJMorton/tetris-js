'use strict';

class Cell {

    constructor({relX, relY, x, y, drawX, drawY, filled}) {
        this.relX = relX;
        this.relY = relY;
        this.x = x;
        this.y = y;
        this.drawX = drawX;
        this.drawY = drawY;
        this.filled = filled;
    }

    render(ctx, size, sides) {

        const jointSize = 0.4;

        if (sides[0]) {
            ctx.fillRect(size * (this.drawX + 0.5 - jointSize/2), size * (this.drawY - 0.5), size * jointSize, size);
        }
        if (sides[1]) {
            ctx.fillRect(size * (this.drawX + 0.5), size * (this.drawY + 0.5 - jointSize/2), size, size * jointSize);
        }

        ctx.fillRect(size * (this.drawX + 0.1), size * (this.drawY + 0.1), size * 0.8, size * 0.8);
    }

}
