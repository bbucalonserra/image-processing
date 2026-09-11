/**
 * Scrolls the stage backdrop from left to right. Copies are drawn side by
 * side and the offset wraps, without translate().
 */
class ScrollingBackground {
    /**
     * @param {p5.Graphics} image - Backdrop whose left and right edges join.
     * @param {number} speed - Pixels per second.
     */
    constructor(image, speed) {
        this.image = image;
        this.speed = speed;
        this.offset = 0;
    }

    /**
     * Advances the offset and wraps it after one copy has passed.
     * @param {number} tileWidth - Width one copy is drawn at.
     * @return {void}
     */
    update(tileWidth) {
        this.offset += (this.speed * Math.min(deltaTime, 100)) / 1000;
        this.offset = this.offset % tileWidth;
    }

    /**
     * Draws the backdrop across a box, dimmed.
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
        // The first copy starts behind the box, so the gap left by the
        // rightward movement is covered.
        for (let start = x - tileWidth; start < x + boxW; start += tileWidth) {
            image(this.image, start + this.offset, y, tileWidth, boxH);
        }
        noStroke();
        fill(10, 14, 22, 110);
        rect(x, y, boxW, boxH);
        pop();
    }
}
