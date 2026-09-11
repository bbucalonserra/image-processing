/**
 * Draws the direction arrow. Each outline point is rotated with sine and
 * cosine (week 8) and offset to the centre, without the transformation stack.
 */
class ArrowOverlay {
    /**
     * @param {number} length - Arrow length in pixels.
     * @param {number} shaftHalf - Half thickness of the shaft.
     * @param {number} headLength - Length of the head.
     * @param {number} headHalf - Half width of the head.
     */
    constructor(length, shaftHalf, headLength, headHalf) {
        this.length = length;
        this.shaftHalf = shaftHalf;
        this.headLength = headLength;
        this.headHalf = headHalf;
    }

    /**
     * Outline of an arrow pointing along the positive x axis, clockwise from
     * the back of the shaft.
     * @return {Array<Array<number>>} Local [x, y] points.
     */
    outline() {
        const half = this.length / 2;
        const neck = half - this.headLength;
        return [
            [-half, -this.shaftHalf],
            [neck, -this.shaftHalf],
            [neck, -this.headHalf],
            [half, 0],
            [neck, this.headHalf],
            [neck, this.shaftHalf],
            [-half, this.shaftHalf]
        ];
    }

    /**
     * Draws the arrow in the given direction.
     * @param {number} centreX - Arrow centre on the x axis.
     * @param {number} centreY - Arrow centre on the y axis.
     * @param {number} angleDegrees - Direction the arrow points at.
     * @param {p5.Color} fillColour - Fill colour.
     * @return {void}
     */
    draw(centreX, centreY, angleDegrees, fillColour) {
        const angle = radians(angleDegrees);
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);

        push();
        noStroke();
        fill(fillColour);
        beginShape();
        for (const point of this.outline()) {
            vertex(
                centreX + point[0] * cosine - point[1] * sine,
                centreY + point[0] * sine + point[1] * cosine
            );
        }
        endShape(CLOSE);
        pop();
    }

    /**
     * Draws the marker for when no axis cleared the dead zone.
     * @param {number} centreX - Marker centre on the x axis.
     * @param {number} centreY - Marker centre on the y axis.
     * @param {p5.Color} strokeColour - Marker colour.
     * @return {void}
     */
    drawStill(centreX, centreY, strokeColour) {
        push();
        noFill();
        stroke(strokeColour);
        strokeWeight(8);
        circle(centreX, centreY, this.length * 0.5);
        pop();
    }
}
