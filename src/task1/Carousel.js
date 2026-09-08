/**
 * Class holding the processed entries and scrolling them horizontally, the
 * row of covers a streaming service shows under its feature panel.
 */
class Carousel {
    /**
     * @param {number} cardWidth - Width of one card in pixels.
     * @param {number} cardGap - Gap between two cards in pixels.
     * @param {number} speed - Scroll speed in pixels per second.
     */
    constructor(cardWidth, cardGap, speed) {
        this.cardWidth = cardWidth;
        this.cardGap = cardGap;
        this.speed = speed;

        /** @type {Array<CarouselItem>} Entries currently in the row. */
        this.items = [];
        /** @type {number} Index of the entry shown on the stage. */
        this.featuredIndex = 0;
        this.offset = 0;
    }

    /**
     * Replaces the row with a new set of entries.
     * @param {Array<CarouselItem>} items - The processed entries.
     * @return {void}
     */
    setItems(items) {
        this.items = items;
        this.featuredIndex = 0;
        this.offset = 0;
    }

    /**
     * @return {boolean} Whether any entry has been loaded yet.
     */
    isLoaded() {
        return this.items.length > 0;
    }

    /**
     * @return {CarouselItem|null} The entry currently on the stage.
     */
    featuredItem() {
        if (!this.isLoaded()) return null;
        return this.items[this.featuredIndex];
    }

    /**
     * Moves the stage on to the next entry, wrapping at the end of the row.
     * @return {void}
     */
    advanceFeatured() {
        if (!this.isLoaded()) return;
        this.featuredIndex = (this.featuredIndex + 1) % this.items.length;
    }

    /**
     * Advances the smooth scroll of the row and wraps it by one card pitch.
     * @return {void}
     */
    update() {
        if (!this.isLoaded()) return;
        const pitch = this.cardWidth + this.cardGap;
        this.offset += (this.speed * Math.min(deltaTime, 100)) / 1000;
        this.offset = this.offset % pitch;
    }

    /**
     * Draws the scrolling row inside a strip, repeating the entries so the row
     * never runs out of cards on either side.
     * @param {number} x - Left edge of the strip.
     * @param {number} y - Top edge of the strip.
     * @param {number} stripW - Strip width in pixels.
     * @param {number} stripH - Strip height in pixels.
     * @return {void}
     */
    draw(x, y, stripW, stripH) {
        push();
        noStroke();
        fill(18, 20, 26);
        rect(x, y, stripW, stripH);
        pop();

        if (!this.isLoaded()) return;

        const pitch = this.cardWidth + this.cardGap;
        const slots = Math.ceil(stripW / pitch) + 2;

        for (let slot = 0; slot < slots; slot++) {
            const cardX = x + slot * pitch - this.offset - pitch;
            if (cardX > x + stripW || cardX + this.cardWidth < x) continue;

            const item = this.items[this.itemIndexForSlot(slot)];
            item.draw(
                cardX,
                y + 10,
                this.cardWidth,
                stripH - 20,
                item === this.featuredItem()
            );
        }
    }

    /**
     * Maps a visible slot onto an entry, so the row repeats endlessly.
     * @param {number} slot - Slot position counted from the left.
     * @return {number} Index of the entry to draw in that slot.
     */
    itemIndexForSlot(slot) {
        const count = this.items.length;
        return ((slot % count) + count) % count;
    }
}
