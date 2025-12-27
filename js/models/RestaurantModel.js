import { AirtableService } from "../services/AirtableService.js";
import { StorageService } from "../services/StorageService.js";

export class RestaurantModel {
    constructor() {
        this.restaurants = [];
        this.observers = []; //observer
        this.countryFlags = {};
        this.searchQuery = "";
    }

    normalize(str = "") {
        return String(str)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    setSearchQuery(query = "") {
        this.searchQuery = query;
        this.notify();
    }

    getSearchQuery() {
        return this.searchQuery;
    }
    //charge les restaurants depuis airtable
    async loadRestaurants() {
        this.restaurants = await AirtableService.getRestaurants();
        this.notify(); // prévient les vues
    }

    subscribe(fn) {
        this.observers.push(fn);
    }
    //quand un restau change on met a jour 
    notify() {
        this.observers.forEach(fn => fn(this.restaurants));
    }

    //ajouter les restaurants dans airtable
    async addRestaurant(restaurantData) {
        const createdRecord = await AirtableService.createRestaurant(restaurantData);

        //met à jour la liste locale
        this.restaurants.unshift(createdRecord); // ou push
        this.notify();
    }
    //supp
    async deleteRestaurant(id) {
        await AirtableService.deleteRestaurant(id);

        this.restaurants = this.restaurants.filter(r => r.id !== id);
        this.notify();
    }
    //update
    async updateRestaurant(id, data) {
        const updated = await AirtableService.updateRestaurant(id, data);

        this.restaurants = this.restaurants.map(r =>
            r.id === id ? updated : r
        );

        this.notify();
    }
    //passe par storageservice
    isFavorite(id) {
        return StorageService.isFavorite(id);
    }

    //re-render après changement du localstorage
    toggleFavorite(id) {
        if (StorageService.isFavorite(id)) {
            StorageService.removeFavorite(id);
        } else {
            StorageService.addFavorite(id);
        }

        this.notify(); // met à jour la vue
    }

    //charge les pays
    async loadCountries() {
        const countries = await AirtableService.getCountries();

        this.countryFlags = {};
        countries.forEach(c => {
            const code = c.fields.code;   //"ID"
            const flag = c.fields.flag;   //url
            if (code && flag) {
                this.countryFlags[String(code).trim().toUpperCase()] = flag;
            }
        });

        console.log("FLAGS MAP SIZE:", Object.keys(this.countryFlags).length);
        this.notify();
    }
}
