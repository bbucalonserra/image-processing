/** Scrolls the stage backdrop left to right, without translate(). */
class ScrollingBackground {
    /** Takes the backdrop image and the speed in pixels per second. */
    constructor(image, speed) {
        this.image = image;
        this.speed = speed;
        this.offset = 0;
    }

    /** Width one copy is drawn at. */
    tileWidth(boxH) {
        return boxH * (this.image.width / this.image.height);
    }

    /** Advances the offset and wraps it after one copy has passed. */
    update(boxH) {
        const tile = this.tileWidth(boxH);
        this.offset += (this.speed * Math.min(deltaTime, 100)) / 1000;
        this.offset = this.offset % tile;
    }

    /** Draws the backdrop across a box, dimmed. */
    draw(x, y, boxW, boxH) {
        const tile = this.tileWidth(boxH);

        push();
        // The first copy starts behind the box, so no gap is left.
        for (let start = x - tile; start < x + boxW; start += tile) {
            image(this.image, start + this.offset, y, tile, boxH);
        }
        noStroke();
        fill(10, 14, 22, 110);
        rect(x, y, boxW, boxH);
        pop();
    }
}
