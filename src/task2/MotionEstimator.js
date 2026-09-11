/**
 * Turns a shift, dx = Cx2 - Cx1 and dy = Cy2 - Cy1, into one of the eight
 * directions. An axis only counts once it clears a dead zone.
 */
class MotionEstimator {
    /**
     * @param {number} deadZoneFraction - Share of the frame size an axis must
     *     clear to count.
     * @param {number} frameWidth - Frame width in pixels.
     * @param {number} frameHeight - Frame height in pixels.
     */
    constructor(deadZoneFraction, frameWidth, frameHeight) {
        this.deadZoneX = deadZoneFraction * frameWidth;
        this.deadZoneY = deadZoneFraction * frameHeight;
    }

    /**
     * Arrow angles in degrees, x to the right and y downwards.
     * @return {object} Angle for every direction label.
     */
    static get ANGLES() {
        return {
            "RIGHT": 0,
            "DOWN-RIGHT": 45,
            "DOWN": 90,
            "DOWN-LEFT": 135,
            "LEFT": 180,
            "UP-LEFT": 225,
            "UP": 270,
            "UP-RIGHT": 315
        };
    }

    /**
     * Classifies a shift, whichever method measured it.
     * @param {number} dx - Shift on the x axis, positive to the right.
     * @param {number} dy - Shift on the y axis, positive downwards.
     * @return {object} {dx, dy, label, angle, distance}. The label is NONE
     *     when neither axis clears the dead zone.
     */
    classify(dx, dy) {
        let horizontal = "";
        if (dx > this.deadZoneX) horizontal = "RIGHT";
        else if (dx < -this.deadZoneX) horizontal = "LEFT";

        let vertical = "";
        if (dy > this.deadZoneY) vertical = "DOWN";
        else if (dy < -this.deadZoneY) vertical = "UP";

        let label = "NONE";
        if (horizontal && vertical) label = vertical + "-" + horizontal;
        else if (horizontal) label = horizontal;
        else if (vertical) label = vertical;

        return {
            dx: dx,
            dy: dy,
            label: label,
            // The arrow follows the label, not the vector.
            angle: label === "NONE" ? 0 : MotionEstimator.ANGLES[label],
            distance: Math.sqrt(dx * dx + dy * dy)
        };
    }

    /**
     * Compares the centroid of Frame A with the centroid of Frame B.
     * @param {object} centroidA - {x, y} centroid of Frame A.
     * @param {object} centroidB - {x, y} centroid of Frame B.
     * @return {object} The classified shift.
     */
    estimate(centroidA, centroidB) {
        return this.classify(
            centroidB.x - centroidA.x,
            centroidB.y - centroidA.y
        );
    }
}
