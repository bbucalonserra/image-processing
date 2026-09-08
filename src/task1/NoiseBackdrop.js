/**
 * Builds the carousel backdrop with Perlin noise instead of loading a picture,
 * so no image outside the provided set is needed.
 *
 * The backdrop has to join at its left and right edges, because the carousel
 * scrolls it in a loop, and Perlin noise does not repeat. The fix is to read
 * the noise field around a circle rather than along a straight line: the
 * column is turned into an angle, and the two horizontal inputs of the noise
 * become the cosine and the sine of that angle (polar coordinates, week 8).
 * After a full turn the sample returns to where it started, so the two edges
 * match. The row supplies the third input, which makes this the 3D noise of
 * week 7. The result is drawn once into an off-screen buffer (week 12) and the
 * pixels are written through the pixel array (week 13).
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
     * The three colours the noise is mapped onto, dark at the bottom of the
     * range and warm at the top.
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
     * Renders the backdrop. The buffer is deliberately smaller than the panel
     * it fills, because the image is soft and stretching it costs nothing,
     * while a noise call per screen pixel would hold up the sketch on start.
     * @return {p5.Graphics} The finished backdrop.
     */
    render() {
        noiseSeed(this.seed);
        // Four octaves is the p5 default, set here so the value is on record.
        noiseDetail(4, 0.5);

        const buffer = createGraphics(this.w, this.h);
        buffer.loadPixels();

        for (let y = 0; y < this.h; y++) {
            // The top of the panel is lighter, which keeps the cut out subject
            // readable against it.
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
