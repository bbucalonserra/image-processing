/**
 * Turns two centroids into one of the eight directions. The shift is
 * dx = Cx2 - Cx1 and dy = Cy2 - Cy1, and an axis only counts once it clears a
 * dead zone, which stops noise in the edge image reporting a diagonal when the
 * motion is horizontal or vertical.
 */
class MotionEstimator {
    /**
     * @param {number} deadZone - Pixels an axis must clear to count.
     */
    constructor(deadZone) {
        this.deadZone = deadZone;
    }

    /**
     * Arrow angles in degrees, measured the way the screen runs: x grows to
     * the right and y grows downwards.
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
     * Compares the centroid of Frame A with the centroid of Frame B.
     * @param {object} centroidA - {x, y} centroid of Frame A.
     * @param {object} centroidB - {x, y} centroid of Frame B.
     * @return {object} {dx, dy, label, angle, distance}. The label is NONE
     *     when neither axis clears the dead zone.
     */
    estimate(centroidA, centroidB) {
        const dx = centroidB.x - centroidA.x;
        const dy = centroidB.y - centroidA.y;

        let horizontal = "";
        if (dx > this.deadZone) horizontal = "RIGHT";
        else if (dx < -this.deadZone) horizontal = "LEFT";

        let vertical = "";
        if (dy > this.deadZone) vertical = "DOWN";
        else if (dy < -this.deadZone) vertical = "UP";

        let label = "NONE";
        if (horizontal && vertical) label = vertical + "-" + horizontal;
        else if (horizontal) label = horizontal;
        else if (vertical) label = vertical;

        return {
            dx: dx,
            dy: dy,
            label: label,
            // The arrow follows the reported label, not the raw vector, so
            // overlay and label cannot disagree.
            angle: label === "NONE" ? 0 : MotionEstimator.ANGLES[label],
            distance: Math.sqrt(dx * dx + dy * dy)
        };
    }
}
