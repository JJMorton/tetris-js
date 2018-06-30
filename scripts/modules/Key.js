'use strict';

class Key {

    constructor(key, period, onPress = function() {}) {
        this.updatePeriod = period;
        this.lastUpdate = -period;
        this.pressed = false;
        this.onPress = onPress;

        window.addEventListener('keydown', e => {
            if (e.key === key) {
                this.pressed = true;
                // Setting a period of 0 just executes the action whenever it is pressed
                if (this.updatePeriod === 0) this.onPress();
            }
        });

        window.addEventListener('keyup', e => {
            if (e.key === key) this.pressed = false;
        });
    }

    update(time) {
        if (this.updatePeriod > 0 && this.pressed && time - this.lastUpdate >= this.updatePeriod) {
            this.onPress();
            this.lastUpdate = time;
        }
    }

}
