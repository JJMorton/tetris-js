const createAnimationType = function(timeFunc) {
    return function({ obj, prop, finalValue, startTime, duration }) {

        const initial = obj[prop];

        const anim = function(currentTime) {
            if (!obj) return true;
            const time = ((currentTime - startTime) / duration);
            obj[prop] = timeFunc(time, initial, finalValue);
            if (currentTime >= startTime + duration) obj[prop] = finalValue;
            this.finished = obj[prop] === finalValue;
        }
        anim.target = obj;
        anim.finished = false;

        return anim;

    };
};

const createLinearAnimation = createAnimationType((time, initial, final) => initial + time * (final - initial));
const createEaseAnimation = createAnimationType((time, initial, final) => initial + (Math.sin(Math.PI*(time - 0.5)) + 1) * (final - initial) / 2);
