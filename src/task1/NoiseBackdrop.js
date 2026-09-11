/**
 * Builds the carousel backdrop from 3D Perlin noise (week 7) read around a
 * circle (week 8), so its left and right edges join.
 */
class NoiseBackdrop {
    /**
     * @param {number} w - Buffer width in pixels.
     * @param {number} h - Buffer height in pixels.
     * @param {number} seed - Noise seed, so every run gives the same backdrop.
     * @param {number} radius - Radius of the circle the noise is read along.
     *     Larger values give smaller features.
     * @param {number} rowStep - Step taken down the noise field per row.
     */
    constructor(w, h, seed, radius, rowStep) {
        this.w = w;
        this.h = h;
        this.seed = seed;
        this.radius = radius;
        this.rowStep = rowStep;
    }

    /**
     * The three colours the noise is mapped onto.
     * @return {Array<Array<number>>} Low, middle and high [r, g, b] stops.
     */
    static get STOPS() {
        return [
            [16, 22, 46],
            [42, 88, 138],
            [206, 116, 84]
        ];
    }

    /**
     * Mixes the three stops into one colour.
     * @param {number} value - Position in the ramp, 0 to 1.
     * @return {Array<number>} The [r, g, b] colour.
     */
    rampColour(value) {
        const stops = NoiseBackdrop.STOPS;
        const half = value < 0.5 ? 0 : 1;
        const local = value < 0.5 ? value * 2 : (value - 0.5) * 2;

        const from = stops[half];
        const to = stops[half + 1];
        return [
            lerp(from[0], to[0], local),
            lerp(from[1], to[1], local),
            lerp(from[2], to[2], local)
        ];
    }

    /**
     * Renders the backdrop once into an off-screen buffer (week 12) through
     * the pixel array (week 13). The buffer is smaller than the panel it
     * fills and is drawn stretched.
     * @return {p5.Graphics} The finished backdrop.
     */
    render() {
        noiseSeed(this.seed);
        // Four octaves, the p5 default, set so the value is on record.
        noiseDetail(4, 0.5);

        const buffer = createGraphics(this.w, this.h);
        buffer.loadPixels();

        for (let y = 0; y < this.h; y++) {
            // The top of the panel is lighter than the bottom.
            const height01 = 1 - y / this.h;
            for (let x = 0; x < this.w; x++) {
                const angle = (x / this.w) * TWO_PI;
                const level = noise(
                    Math.cos(angle) * this.radius + this.radius,
                    Math.sin(angle) * this.radius + this.radius,
                    y * this.rowStep
                );

                const colour = this.rampColour(level * 0.7 + height01 * 0.3);
                const index = PixelUtilities.pixelIndex(x, y, this.w);
                buffer.pixels[index] = colour[0];
                buffer.pixels[index + 1] = colour[1];
                buffer.pixels[index + 2] = colour[2];
                buffer.pixels[index + 3] = 255;
            }
        }

        buffer.updatePixels();
        return buffer;
    }
}
