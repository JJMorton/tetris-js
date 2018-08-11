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

    render({ ctx, size, sides, fill, stroke, offset = {x: 0, y: 0} }) {

        const jointSize = 0.4;

        const drawPos = {
            x: this.drawX + offset.x,
            y: this.drawY + offset.y
        };

        if (fill) {
            if (sides[0])
                ctx.fillRect(size * (drawPos.x + 0.5 - jointSize/2), size * (drawPos.y - 0.5), size * jointSize, size);
            if (sides[1])
                ctx.fillRect(size * (drawPos.x + 0.5), size * (drawPos.y + 0.5 - jointSize/2), size, size * jointSize);
            ctx.fillRect(size * (drawPos.x + 0.1), size * (drawPos.y + 0.1), size * 0.8, size * 0.8);
        }
        if (stroke) ctx.strokeRect(size * (drawPos.x + 0.1), size * (drawPos.y + 0.1), size * 0.8, size * 0.8);
    }

}
