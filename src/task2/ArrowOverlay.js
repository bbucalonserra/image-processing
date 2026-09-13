/** Draws the direction arrow. Points are rotated with sin and cos. */
class ArrowOverlay {
    /** Arrow length, shaft half thickness, head length and head half width. */
    constructor(length, shaftHalf, headLength, headHalf) {
        this.length = length;
        this.shaftHalf = shaftHalf;
        this.headLength = headLength;
        this.headHalf = headHalf;
    }

    /** Outline of an arrow pointing along the positive x axis. */
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

    /** Draws the arrow in the given direction. */
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

    /** Draws the marker for when no axis cleared the dead zone. */
    drawStill(centreX, centreY, strokeColour) {
        push();
        noFill();
        stroke(strokeColour);
        strokeWeight(8);
        circle(centreX, centreY, this.length * 0.5);
        pop();
    }
}
