/**
 * Class drawing the large direction arrow. The outline is written once in the
 * local space of an arrow pointing right, then every point is rotated by the
 * reported angle with sine and cosine (week 8) and offset to the panel centre,
 * so the overlay needs no transformation stack.
 */
class ArrowOverlay {
    /**
     * @param {number} length - Overall length of the arrow in pixels.
     * @param {number} shaftHalf - Half thickness of the shaft in pixels.
     * @param {number} headLength - Length of the arrow head in pixels.
     * @param {number} headHalf - Half width of the arrow head in pixels.
     */
    constructor(length, shaftHalf, headLength, headHalf) {
        this.length = length;
        this.shaftHalf = shaftHalf;
        this.headLength = headLength;
        this.headHalf = headHalf;
    }

    /**
     * The outline of an arrow pointing along the positive x axis, listed
     * clockwise from the back of the shaft.
     * @return {Array<Array<number>>} Local [x, y] points of the outline.
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
     * Draws the arrow pointing in the given direction.
     * @param {number} centreX - Centre of the arrow on the x axis.
     * @param {number} centreY - Centre of the arrow on the y axis.
     * @param {number} angleDegrees - Direction the arrow points at.
     * @param {p5.Color} fillColour - Colour the arrow is filled with.
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
     * Draws the marker used when no motion cleared the dead zone.
     * @param {number} centreX - Centre of the marker on the x axis.
     * @param {number} centreY - Centre of the marker on the y axis.
     * @param {p5.Color} strokeColour - Colour of the marker.
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
