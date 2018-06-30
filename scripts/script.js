'use strict';

let update, redraw, lastUpdate;
const updatePeriod = 500;

const game = new Game();

game.checkForLines = function() {
    let rows = new Array(game.grid.height).fill(0);
    for (const tile of game.tiles) {
        for (const cell of tile) {
            if (cell.filled) rows[cell.y]++;
        }
    }

    rows = rows
        .map((x, i) => x === game.grid.width ? i : -1)
        .filter(x => x >= 0);
    
    if (rows.length > 0) redraw = true;

    const toAnimate = new Set();
    
    for (const lineIndex of rows) {
        for (const tile of game.tiles) {
            const removeIndex = lineIndex - tile.pos.y;
            if (removeIndex >= 0 && removeIndex < tile.structure.length) {
                // Empty row
                tile.structure.splice(removeIndex, 1);
                tile.pos.y++;
                toAnimate.add(tile);
            }
            else if (removeIndex >= tile.structure.length) {
                // Move entire tile down one
                tile.pos.y++;
                toAnimate.add(tile);
            }
        }
    }

    for (const tile of toAnimate) {
        game.animations.push(createEaseAnimation(tile.drawPos, 'y', tile.pos.y, 300));
    }
};

game.addAnimation = function(animation) {
    // Remove existing animations for target
    game.animations.forEach((other, i) => {
        if (other.target === animation.target) {
            game.animations.splice(i, 1);
        }
    });
    game.animations.push(animation);
};

game.newTile = function() {
    // Add falling tile to fallen
    if (game.tileActive) game.tiles.push(game.tileActive);

    // Check for lines
    game.checkForLines();

    // Make first tile in buffer fall
    game.tileActive = game.tilesBuffer.shift();

    // Add new tile to buffer
    game.tilesBuffer.push(new Tile(game.grid, Tile.randomTile()));

    return !game.tileActive.detectCollision(game, x => x);
};

game.resizeCanvas = function() {
    const container = document.getElementById('game');
    game.cellSize = container.offsetWidth / game.grid.width;
    return {
        width: container.offsetWidth - 1,
        height: container.offsetHeight
    }
};

game.init = function() {

    document.getElementById('game-over').setAttribute('style', '');

    update = true;
    redraw = true;
    lastUpdate = 0;

    // Initialise grid + tile arrays
    game.grid = { width: 10, height: 20 };
    game.tiles = []; // Fallen tiles
    game.tilesBuffer = new Array(2).fill(null).map(x => new Tile(game.grid, Tile.randomTile())); // Reserve tiles
    game.tileActive = undefined;

    // Running animations
    game.animations = [];

    // Create first tile
    game.newTile();
    // game.tileActive.pos.y = -1; // Just a hack to make the first tile start at the top

    game.playing = true;
};

game.tick = function({canvas, ctx}) {

    /* Update performance stats */
    document.getElementById('fps').innerText = Math.round(1000 / game.delta);

    const currentTime = performance.now();

    game.animations.forEach((animation, i) => {
        // Remove the animation if it finished
        if (animation(currentTime)) game.animations.splice(i, 1);
    });

    if (!game.playing) return;

    if (currentTime - lastUpdate >= updatePeriod) update = true;

    // if (update || redraw) {

        /* Clear cells */

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const updateTile = function(tile) {
            ctx.fillStyle = tile.colour;
            for (const cell of tile) {
                if (cell.filled) {
                    ctx.fillRect(cell.drawX * game.cellSize, cell.drawY * game.cellSize, game.cellSize, game.cellSize);
                }
            }
        }

        for (const tile of game.tiles) updateTile(tile);

        redraw = false;


        if (update) {

            lastUpdate = currentTime;

            // Move active tile down one
            const prevActive = game.tileActive;
            const moved = game.tileActive.moveDown(game);
            // If there was a collision with the falling tile
            if (!moved) {
                // The previously falling tile will need an update as it is now static so won't be updated otherwise
                if (prevActive) updateTile(prevActive);
                // Make a new falling tile
                if (!game.newTile()) {
                    // If there is no space, game over
                    game.playing = false;
                    document.getElementById('game-over').setAttribute('style', 'display: inline;');
                }
            }
        }

        update = false;

        updateTile(game.tileActive);

    // }

};

game.start();

window.addEventListener('keydown', e => {
    switch (e.key) {
        case "ArrowRight":
            if (!game.playing || !game.tileActive) return;
            if (game.tileActive.moveRight(game)) redraw = true;
            break;
        case "ArrowLeft":
            if (!game.playing || !game.tileActive) return;
            if (game.tileActive.moveLeft(game)) redraw = true;
            break;
        case "ArrowUp":
            if (!game.playing || !game.tileActive) return;
            if (game.tileActive.rotate(game)) redraw = true;
            break;
        case "ArrowDown":
            if (!game.playing || !game.tileActive) return;
            if (game.tileActive.moveDown(game)) redraw = true;
            break;
        case "Enter":
            if (game.playing) return;
            game.init();
    }
});
