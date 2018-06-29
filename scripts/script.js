'use strict';

import { Game } from "./modules/Game.js";
import { Tile } from "./modules/Tile.js";

let update, redraw, lastUpdate;
const updatePeriod = 500;

const game = new Game();

game.getCellState = function(x, y) {
    const row = document.getElementById('game').children[y];
    if (!row) return false;
    const cell = row.children[x];
    if (!cell) return false;
    return cell.classList.contains("enabled");
}

game.newTile = function() {
    // Add falling tile to fallen
    if (game.tileActive) game.tiles.push(game.tileActive);

    // Make first tile in buffer fall
    game.tileActive = game.tilesBuffer.shift();

    // Add new tile to buffer
    game.tilesBuffer.push(new Tile(game.grid, Tile.randomTile()));

    return !game.tileActive.detectCollision(game, x => x);
}

game.init = function() {

    document.getElementById('game-over').setAttribute('style', '');

    update = true;
    redraw = true;
    lastUpdate = 0;

    // Initialise empty grid
    game.grid = { width: 10, height: 20 };
    game.tiles = []; // Fallen tiles
    game.tilesBuffer = new Array(2).fill(null).map(x => new Tile(game.grid, Tile.randomTile())); // Reserve tiles
    game.tileActive = undefined;

    // Create first tile
    game.newTile();
    game.tileActive.pos.y = -1; // Just a hack to make the first tile start at the top


    // Initialise document structure
    const frag = document.createDocumentFragment();
    for (let i = 0; i < game.grid.height; i++) {
        const row = document.createElement('div');
        row.className = "row";
        for (let j = 0; j < game.grid.width; j++) {
            const cell = document.createElement('div');
            cell.className = "cell disabled";
            row.appendChild(cell);
        }
        frag.appendChild(row);
    }
    const container = document.getElementById('game');
    container.innerHTML = "";
    container.appendChild(frag);

    game.playing = true;
};

game.tick = function({delta}) {

    /* Update performance stats */
    document.getElementById('fps').innerText = Math.round(1000 / delta);

    if (!game.playing) return;

    const currentTime = performance.now();
    if (currentTime - lastUpdate >= updatePeriod) update = true;

    if (update || redraw) {

        /* Clear cells */

        const container = document.getElementById('game');
        for (const row of container.childNodes) {
            for (const cell of row.childNodes) {
                cell.className = 'cell disabled';
                cell.setAttribute('style', '');
            }
        }

        const updateTile = function(tile) {
            for (const cell of tile) {
                if (cell.filled) {
                    const active = container.childNodes[cell.y].childNodes[cell.x];
                    if (!active) return;
                    active.className = 'cell enabled ' + tile.getSides(cell.relX, cell.relY);
                    active.setAttribute('style', `background-color: ${tile.colour};`);
                }
            }
        }

        for (const tile of game.tiles) updateTile(tile);

        redraw = false;


        if (update) {

            /* Update cells */

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

    }

};

game.start();

addEventListener('keydown', e => {
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
