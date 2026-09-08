/**
 * Drives the sequence the brief asks for: fade in, zoom in, fade out, then fade
 * in, zoom out, fade out, repeating. One pass through the three phases is a
 * stage, and the zoom direction flips at the end of each stage. Alpha and scale
 * are returned as numbers, so the screen draws with image() and text() and
 * never calls translate().
 */
class AnimationCycle {
    /**
     * @param {number} stageDuration - Stage length in milliseconds.
     * @param {number} minScale - Small end of the zoom.
     * @param {number} maxScale - Large end of the zoom.
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
     * Restarts at the beginning of a zoom in stage.
     * @return {void}
     */
    restart() {
        this.elapsed = 0;
        this.zoomingIn = true;
    }

    /**
     * Advances the timer by one frame. The step is capped so a background tab
     * does not skip whole stages when it returns.
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
     * @return {number} Position in the current stage, 0 to 1.
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
     * @return {number} Scale for the current frame: small to large on a zoom
     *     in stage, large to small on a zoom out.
     */
    scaleFactor() {
        const p = this.progress();
        return this.zoomingIn
            ? lerp(this.minScale, this.maxScale, p)
            : lerp(this.maxScale, this.minScale, p);
    }

    /**
     * @return {string} Phase in progress, for the HUD.
     */
    phaseName() {
        const p = this.progress();
        const zoom = this.zoomingIn ? "zoom in" : "zoom out";
        if (p < this.fadeFraction) return "fade in";
        if (p > 1 - this.fadeFraction) return "fade out";
        return zoom;
    }
}
