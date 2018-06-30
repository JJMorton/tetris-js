'use strict';


/* Variables to keep track of timing */

let redraw, lastUpdate, lastKeyUpdate;
const updatePeriod = 500;
const keyUpdatePeriod = 150;
let downKeyState = false;


/* Main game */

const game = new Game(document.getElementById('game-canvas'));

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

        const gameContainer = document.getElementById('game-container');
        const pOffset = { x: gameContainer.offsetLeft, y: gameContainer.offsetTop };

        for (const tile of game.tiles) {
            const removeIndex = lineIndex - tile.pos.y;

            /* Particle effects */
            if (removeIndex >= 0 && removeIndex < tile.structure.length) {
                tile.structure[removeIndex].forEach((filled, i) => {
                    if (!filled) return;
                    for (let j = 0; j < 5; j++) effects.particles.push(
                        new Particle(pOffset.x + (i + tile.pos.x + 0.5) * game.cellSize, pOffset.y + (lineIndex + 0.5) * game.cellSize, tile.colour)
                    );
                });
            }

            /* Remove cells */
            if (removeIndex === tile.structure.length - 1) {
                // Line through last row of tile
                tile.structure.pop();
                tile.pos.y++;
                toAnimate.add(tile);
            }
            else if (removeIndex >= 0 && removeIndex < tile.structure.length) {
                // Line through middle of tile
                const newTile = new Tile(game.grid, { structure: [0], colour: tile.colour });
                newTile.structure = tile.structure.splice(lineIndex - tile.pos.y + 1);
                newTile.pos = { x: tile.pos.x, y: lineIndex + 1 };
                newTile.drawPos = { x: tile.pos.x, y: lineIndex + 1 };
                game.tiles.push(newTile);

                tile.structure.pop();
                tile.pos.y++;
                toAnimate.add(tile);
            }
            else if (removeIndex >= tile.structure.length) {
                // Line below tile
                tile.pos.y++;
                toAnimate.add(tile);
            }
        }
    }

    /* Create animations */
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
    if (game.tileActive) {
        game.tiles.push(game.tileActive);
        game.tileActive.trimEmpty();
    }

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

    redraw = true;
    lastUpdate = performance.now();
    lastKeyUpdate = performance.now();

    // Initialise grid + tile arrays
    game.grid = { width: 10, height: 20 };
    game.tiles = []; // Fallen tiles
    game.tilesBuffer = new Array(2).fill(null).map(x => new Tile(game.grid, Tile.randomTile())); // Reserve tiles
    game.tileActive = undefined;

    // Running animations
    game.animations = [];

    // Create first tile
    game.newTile();

    game.playing = true;
};

game.tick = function({canvas, ctx}) {

    /* Update performance stats */
    
    document.getElementById('fps').innerText = Math.round(1000 / game.delta);
    const currentTime = performance.now();


    /* Carry out animations */
    
    game.animations.forEach((animation, i) => {
        // Remove the animation if it finished
        animation(currentTime);
        if (animation.finished) game.animations.splice(i, 1);
    });


    if (!game.playing) return;


    /* Redraw all static tiles */

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.tiles.forEach(t => t.render(ctx, game.cellSize));
    redraw = false;


    /* Move active tile down every 'updatePeriod' ms */

    if (downKeyState && currentTime - lastKeyUpdate >= keyUpdatePeriod || currentTime - lastUpdate >= updatePeriod) {

        lastKeyUpdate = currentTime;
        lastUpdate = currentTime;

        // Move active tile down one
        const prevActive = game.tileActive;
        const moved = game.tileActive.moveDown(game);
        // If there was a collision with the falling tile
        if (!moved) {
            // The previously falling tile will need an update as it is now static so won't be updated otherwise
            if (prevActive) prevActive.render(ctx, game.cellSize);
            // Make a new falling tile
            if (!game.newTile()) {
                // If there is no space, game over
                game.playing = false;
                document.getElementById('game-over').setAttribute('style', 'display: inline;');
            }
        }
    }


    /* Redraw the active tile */

    game.tileActive.render(ctx, game.cellSize);

};

game.start();


/* Keyboard event listeners */

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
            downKeyState = true;
            break;
        case "Enter":
            if (game.playing) return;
            game.init();
    }
});

window.addEventListener('keyup', e => {
    if (e.key === "ArrowDown") downKeyState = false;
});


/* Effects canvas */

const effects = new Game(document.getElementById('effects-canvas'));

effects.particles = [];

effects.resizeCanvas = function() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    }
}

effects.tick = function({ canvas, ctx, frameCount }) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effects.particles.forEach((particle, i) => {
        particle.tick();
        particle.render(ctx);
        if (particle.finished) effects.particles.splice(i, 1);
    });
}

effects.start();
