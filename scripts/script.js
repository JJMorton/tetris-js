'use strict';


const game = new Game(document.getElementById('game-canvas'));


/* Key capture to prevent infinitely fast spam */

const keys = [

    new Key("ArrowDown", 130, () => {
        game.currentScore++;
        game.update(game.ctx);
    }),

    new Key("ArrowLeft", 130, () => {
        if (game.playing && game.tileActive) game.tileActive.moveLeft(game);
    }),

    new Key("ArrowRight", 130, () => {
        if (game.playing && game.tileActive) game.tileActive.moveRight(game);
    }),

    new Key("ArrowUp", 0, () => {
        if (game.playing && game.tileActive) game.tileActive.rotate(game);
    }),

    new Key("Enter", 0, () => {
        if (!game.playing) game.init();
    })
]


/* Checks the grid for any full rows and clears them */

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

    /* Adjust score */
    if (rows.length > 0) {
        const basePoints = [40, 100, 300, 1200];
        game.currentScore += basePoints[rows.length - 1] * (game.level + 1);
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

    // Add score
    game.totalScore += game.currentScore;
    game.currentScore = 0;

    return !game.tileActive.detectCollision(game, x => x);
};

game.resizeCanvas = function() {
    const container = document.getElementById('game');
    game.cellSize = container.offsetWidth / game.grid.width;
    return {
        width: container.offsetWidth - 1,
        height: container.offsetHeight
    };
};

game.update = function(ctx) {

    game.lastUpdate = performance.now();

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
            document.getElementById('game-over').setAttribute('style', 'display: block;');
        }
    }
};

game.init = function() {

    document.getElementById('game-over').setAttribute('style', '');

    game.updatePeriod = 500;
    game.lastUpdate = performance.now();

    game.level = 0;
    game.totalScore = 0;
    game.currentScore = 0;

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

    const currentTime = performance.now();

    /* Update fps meter */
    
    document.getElementById('fps').innerText = Math.round(1000 / game.delta);


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


    /* Handle keypresses */

    keys.forEach(k => k.update(currentTime));


    /* Move active tile down every 'updatePeriod' ms */

    if (currentTime - game.lastUpdate >= game.updatePeriod) game.update(ctx);


    /* Redraw the active tile */

    game.tileActive.render(ctx, game.cellSize);


    /* Update DOM */

    document.getElementById('score-total').innerText = game.totalScore;
    document.getElementById('score-current').innerText = game.currentScore;

};

game.start();


/* Next tile preview */

const preview = new Game(document.getElementById('preview-canvas'));

preview.resizeCanvas = function() {
    const size = document.getElementById('preview-container').offsetWidth;
    return { width: size, height: size };
};

preview.tick = function({ canvas, ctx }) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (game.tilesBuffer.length > 0) {
        game.tilesBuffer[0].renderPreview(ctx);
    }
};

preview.start();


/* Effects canvas */

const effects = new Game(document.getElementById('effects-canvas'));

effects.particles = [];

effects.resizeCanvas = function() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    };
};

effects.tick = function({ canvas, ctx, frameCount }) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effects.particles.forEach((particle, i) => {
        particle.tick();
        particle.render(ctx);
        if (particle.finished) effects.particles.splice(i, 1);
    });
};

effects.start();
