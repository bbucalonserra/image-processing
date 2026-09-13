/** Holds the processed entries and scrolls them horizontally. */
class Carousel {
    /** Card width, gap between cards and how fast the scroll catches up. */
    constructor(cardWidth, cardGap, easeRate) {
        this.cardWidth = cardWidth;
        this.cardGap = cardGap;
        this.easeRate = easeRate;

        /** @type {Array<CarouselItem>} Entries currently in the row. */
        this.items = [];
        /** @type {number} Index of the entry shown on the stage. */
        this.featuredIndex = 0;
        this.offset = 0;
    }

    /** Replaces the row with a new set of entries. */
    setItems(items) {
        this.items = items;
        this.featuredIndex = 0;
        this.offset = 0;
    }

    /** True once entries have been loaded. */
    isLoaded() {
        return this.items.length > 0;
    }

    /** The entry shown on the stage, or null when the row is empty. */
    featuredItem() {
        if (!this.isLoaded()) return null;
        return this.items[this.featuredIndex];
    }

    /** Moves to the next entry, wrapping at the end of the row. */
    advanceFeatured() {
        if (!this.isLoaded()) return;
        this.featuredIndex = (this.featuredIndex + 1) % this.items.length;
    }

    /** Moves to the previous entry, wrapping at the start of the row. */
    retreatFeatured() {
        if (!this.isLoaded()) return;
        const count = this.items.length;
        this.featuredIndex = (this.featuredIndex + count - 1) % count;
    }

    /** Scroll position that centres the featured entry, nearest copy first. */
    targetOffset(stripW) {
        const pitch = this.cardWidth + this.cardGap;
        const count = this.items.length;
        const centred = (this.offset + stripW / 2 - this.cardWidth / 2) / pitch;

        let index = Math.round(centred);
        let gap = ((this.featuredIndex - index) % count + count) % count;
        if (gap > count / 2) gap -= count;

        index += gap;
        return index * pitch + this.cardWidth / 2 - stripW / 2;
    }

    /** Eases the scroll towards the featured entry. */
    update(stripW) {
        if (!this.isLoaded()) return;
        const step = Math.min(deltaTime, 100) / 1000;
        this.offset = lerp(
            this.offset,
            this.targetOffset(stripW),
            Math.min(1, this.easeRate * step)
        );
    }

    /** Draws the row. Cards shrink and dim with their distance from centre. */
    draw(x, y, stripW, stripH) {
        push();
        noStroke();
        fill(18, 20, 26);
        rect(x, y, stripW, stripH);
        pop();

        if (!this.isLoaded()) return;

        const pitch = this.cardWidth + this.cardGap;
        const slots = Math.ceil(stripW / pitch) + 2;
        const first = Math.floor(this.offset / pitch) - 1;
        const centre = x + stripW / 2;
        const fullHeight = stripH - 20;

        for (let slot = 0; slot < slots; slot++) {
            const index = first + slot;
            const cardX = x + index * pitch - this.offset;
            if (cardX > x + stripW || cardX + this.cardWidth < x) continue;

            const cardCentre = cardX + this.cardWidth / 2;
            const away = Math.min(
                1, Math.abs(cardCentre - centre) / (stripW / 2)
            );
            const depth = lerp(1, 0.78, away);
            const cardW = this.cardWidth * depth;
            const cardH = fullHeight * depth;
            const entry = this.itemIndexForSlot(index);

            this.items[entry].draw(
                cardCentre - cardW / 2,
                y + 10 + (fullHeight - cardH) / 2,
                cardW,
                cardH,
                entry === this.featuredIndex,
                lerp(255, 110, away)
            );
        }
    }

    /** Maps a card position onto an entry, which makes the row repeat. */
    itemIndexForSlot(index) {
        const count = this.items.length;
        return ((index % count) + count) % count;
    }
}
