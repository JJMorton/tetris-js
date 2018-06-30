const createLinearAnimation = function(obj, prop, final, length) {
    const startTime = performance.now();
    const initial = obj[prop];
    const anim = function(currentTime) {
        if (!obj) return true;
        obj[prop] = initial + ((currentTime - startTime) / length) * (final - initial);
        if (currentTime >= startTime + length) obj[prop] = final;
        return obj[prop] === final;
    }
    anim.target = obj;
    return anim;
};

const createEaseAnimation = function(obj, prop, final, length) {
    const startTime = performance.now();
    const initial = obj[prop];
    const anim = function(currentTime) {
        if (!obj) return true;
        const time = ((currentTime - startTime) / length);
        obj[prop] = initial + (Math.sin(Math.PI*(time - 0.5)) + 1) * (final - initial) / 2;
        if (currentTime >= startTime + length) obj[prop] = final;
        return obj[prop] === final;
    }
    anim.target = obj;
    return anim;
};
