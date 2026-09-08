/**
 * Class scrolling the stage backdrop from left to right. Two copies of the
 * image are drawn side by side and the offset wraps, which gives a seamless
 * loop without translate().
 */
class ScrollingBackground {
    /**
     * @param {p5.Image} image - The backdrop, seamless on its left and right.
     * @param {number} speed - Pixels travelled per second.
     */
    constructor(image, speed) {
        this.image = image;
        this.speed = speed;
        this.offset = 0;
    }

    /**
     * Advances the scroll offset and wraps it once a full copy has passed.
     * @param {number} tileWidth - Width one copy is drawn at.
     * @return {void}
     */
    update(tileWidth) {
        this.offset += (this.speed * Math.min(deltaTime, 100)) / 1000;
        this.offset = this.offset % tileWidth;
    }

    /**
     * Draws the backdrop across a box, dimmed so the subject stays readable.
     * @param {number} x - Left edge of the box.
     * @param {number} y - Top edge of the box.
     * @param {number} boxW - Box width in pixels.
     * @param {number} boxH - Box height in pixels.
     * @return {void}
     */
    draw(x, y, boxW, boxH) {
        const tileWidth = boxH * (this.image.width / this.image.height);
        this.update(tileWidth);

        push();
        // The first copy trails the box so the gap it leaves while moving
        // right is always covered by the copy behind it.
        for (let start = x - tileWidth; start < x + boxW; start += tileWidth) {
            image(this.image, start + this.offset, y, tileWidth, boxH);
        }
        noStroke();
        fill(10, 14, 22, 110);
        rect(x, y, boxW, boxH);
        pop();
    }
}
