import { AirtableService } from "../services/AirtableService.js";

export class ReviewModel {
    constructor() {
        this.reviews = [];
        this.restaurantId = null;
        this.observers = [];
    }
    //s'abonne
    subscribe(fn) {
        this.observers.push(fn);
    }
    //et prévient les abonnés
    notify() {
        this.observers.forEach(fn => fn(this.reviews));
    }
    //charge les avis du restau
    async loadForRestaurant(restaurantId) {
        this.restaurantId = restaurantId;
        this.reviews = await AirtableService.getReviewsByRestaurant(restaurantId);
        this.notify();
    }
    //ajoute avis
    async addReview(data) {
        const created = await AirtableService.createReview({
            ...data,
            restaurantId: this.restaurantId
        });

        this.reviews.unshift(created);
        this.notify();
        return created;
    }
    //moyenne
    getAverage() {
        const values = this.reviews
            .map(r => Number(r.fields.value))
            .filter(v => !isNaN(v));

        if (!values.length) return null;

        return values.reduce((a, b) => a + b, 0) / values.length;
    }
}
