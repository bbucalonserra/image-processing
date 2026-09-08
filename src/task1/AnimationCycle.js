/**
 * Class driving the animation sequence the brief asks for: fade in, zoom in,
 * fade out, then fade in, zoom out, fade out, and so on. One pass through the
 * three phases is called a stage, and the zoom direction flips at the end of
 * every stage. The alpha and the scale are read back as plain numbers so the
 * screen can draw with image() and text() alone, without translate().
 */
class AnimationCycle {
    /**
     * @param {number} stageDuration - Length of one stage in milliseconds.
     * @param {number} minScale - Scale at the small end of the zoom.
     * @param {number} maxScale - Scale at the large end of the zoom.
     * @param {number} fadeFraction - Share of the stage spent fading, 0 to 0.5.
     */
    constructor(stageDuration, minScale, maxScale, fadeFraction) {
        this.stageDuration = stageDuration;
        this.minScale = minScale;
        this.maxScale = maxScale;
        this.fadeFraction = fadeFraction;

        this.elapsed = 0;
        /** @type {boolean} True while the stage is zooming in. */
        this.zoomingIn = true;
    }

    /**
     * Restarts the sequence at the beginning of a zoom in stage.
     * @return {void}
     */
    restart() {
        this.elapsed = 0;
        this.zoomingIn = true;
    }

    /**
     * Advances the timer by one frame. The step is capped so a browser tab
     * left in the background does not skip whole stages on its return.
     * @return {boolean} Whether a stage finished on this frame.
     */
    update() {
        this.elapsed += Math.min(deltaTime, 100);
        if (this.elapsed < this.stageDuration) return false;

        this.elapsed -= this.stageDuration;
        this.zoomingIn = !this.zoomingIn;
        return true;
    }

    /**
     * @return {number} Position within the current stage, 0 to 1.
     */
    progress() {
        return this.elapsed / this.stageDuration;
    }

    /**
     * @return {number} Opacity for the current frame, 0 to 255.
     */
    alpha() {
        const p = this.progress();
        if (p < this.fadeFraction) {
            return map(p, 0, this.fadeFraction, 0, 255);
        }
        if (p > 1 - this.fadeFraction) {
            return map(p, 1 - this.fadeFraction, 1, 255, 0);
        }
        return 255;
    }

    /**
     * @return {number} Scale for the current frame, running from the small to
     *     the large end on a zoom in stage and the other way on a zoom out.
     */
    scaleFactor() {
        const p = this.progress();
        return this.zoomingIn
            ? lerp(this.minScale, this.maxScale, p)
            : lerp(this.maxScale, this.minScale, p);
    }

    /**
     * @return {string} Name of the phase in progress, for the HUD.
     */
    phaseName() {
        const p = this.progress();
        const zoom = this.zoomingIn ? "zoom in" : "zoom out";
        if (p < this.fadeFraction) return "fade in";
        if (p > 1 - this.fadeFraction) return "fade out";
        return zoom;
    }
}
