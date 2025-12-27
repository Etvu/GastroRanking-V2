import { MessageService } from "../services/MessageService.js";
export class RestaurantController {

    constructor(model, view, reviewController) {
        this.model = model;
        this.view = view;
        this.reviewController = reviewController;

        this.lastRestaurants = [];
        this.filters = { country: "", cuisine: "", favOnly: false, sort: "name-asc" };

        //Je récup le DOM
        this.countrySelect = document.getElementById("filterCountry");
        this.cuisineSelect = document.getElementById("filterCuisine");
        this.favCheckbox = document.getElementById("filterFav");
        this.sortSelect = document.getElementById("sortBy");

        //Je gère les filtres 
        this.countrySelect.addEventListener("change", () => {
            this.filters.country = this.countrySelect.value;
            this.renderFiltered(); //je réafiche la liste
        });

        this.cuisineSelect.addEventListener("change", () => {
            this.filters.cuisine = this.cuisineSelect.value;
            this.renderFiltered();
        });

        this.favCheckbox.addEventListener("change", () => {
            this.filters.favOnly = this.favCheckbox.checked;
            this.renderFiltered();
        });

        this.sortSelect.addEventListener("change", () => {
            this.filters.sort = this.sortSelect.value;
            this.renderFiltered();
        });

        //favori ou pas 
        this.view.isFavorite = (id) => this.model.isFavorite(id);
        //recup l'url du drapeau
        this.view.getFlagUrl = (countryCode) => {
            const key = String(countryCode ?? "").trim().toUpperCase();
            return this.model.countryFlags[key];
        };

        this.editingId = null;
        const form = document.getElementById("restaurantForm");

        //envoie du form
        form.addEventListener("submit", async (e) => {
            //bloque le refresh
            e.preventDefault();

            const formData = new FormData(form);
            const restaurant = {
                name: formData.get("name").trim(),
                typeOfCuisine: formData.get("typeOfCuisine").trim(),
                country: formData.get("country").trim(),
                note: formData.get("note") ? Number(formData.get("note")) : null
            };

            //gère les erreurs
            try {
                if (this.editingId) {
                    await this.model.updateRestaurant(this.editingId, restaurant);
                    MessageService.show("Restaurant modifié ✅");
                    this.editingId = null;
                } else {
                    await this.model.addRestaurant(restaurant);
                    MessageService.show("Restaurant ajouté ✅");
                }

                form.reset();
            } catch (err) {
                console.error(err);
                MessageService.show("Erreur lors de l'enregistrement ❌", "error");
            }
        });

        //ecoute delete
        this.view.container.addEventListener("click", async (e) => {
            const btn = e.target.closest(".btn-delete");
            if (!btn) return;

            const id = btn.dataset.id;
            if (!id) return;

            const ok = confirm("Supprimer ce restaurant ?");
            if (!ok) return;

            try {
                await this.model.deleteRestaurant(id);
                MessageService.show("Restaurant supprimé 🗑️");
            } catch (err) {
                console.error(err);
                MessageService.show("Erreur suppression ❌", "error");
            }
        });

        //ecoute update
        this.view.container.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn-update");
            if (!btn) return;

            const id = btn.dataset.id;
            if (!id) return;

            //trouve le restaurant dans le model
            const restaurant = this.model.restaurants.find(r => r.id === id);
            if (!restaurant) return;

            //pré-remplir le formulaire
            const form = document.getElementById("restaurantForm");
            form.elements["name"].value = restaurant.fields.Name ?? "";
            form.elements["typeOfCuisine"].value = restaurant.fields.typeOfCuisine ?? "";
            form.elements["country"].value = restaurant.fields.country ?? "";
            form.elements["note"].value = restaurant.fields.note ?? "";

            this.editingId = id;
        });

        //ecoute fav
        this.view.container.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn-fav");
            if (!btn) return;

            const id = btn.dataset.id;
            if (!id) return;

            this.model.toggleFavorite(id);
        });

        //ecoute review
        this.view.container.addEventListener("click", (e) => {
            const btn = e.target.closest(".btn-reviews");
            if (!btn) return;

            const id = btn.dataset.id;
            const restaurant = this.model.restaurants.find(r => r.id === id);
            if (!restaurant) return;

            this.reviewController.openForRestaurant(restaurant);
        });

        //ecoute recherche
        this.searchInput = document.getElementById("searchInput");

        this.searchInput.addEventListener("input", () => {
            this.model.setSearchQuery(this.searchInput.value);
        });

    }


    onRestaurantsChanged(restaurants) {
        this.lastRestaurants = restaurants;
        this.fillFilterOptions(restaurants);
        //reafiche la liste changé
        this.renderFiltered();
    }

    renderFiltered() {
        let list = [...this.lastRestaurants];

        //recherche
        const q = this.model.normalize(this.model.getSearchQuery());
        if (q) {
            list = list.filter(r =>
                this.model.normalize(r.fields.Name ?? "").includes(q)
            );
        }

        //fav
        if (this.filters.favOnly) {
            list = list.filter(r => this.model.isFavorite(r.id));
        }

        //pays
        if (this.filters.country) {
            list = list.filter(r => (r.fields.country ?? "") === this.filters.country);
        }

        //cuisine
        if (this.filters.cuisine) {
            list = list.filter(r => (r.fields.typeOfCuisine ?? "") === this.filters.cuisine);
        }

        //trier
        if (this.filters.sort === "name-asc") {
            list.sort((a, b) => String(a.fields.Name ?? "").localeCompare(String(b.fields.Name ?? "")));
        } else if (this.filters.sort === "name-desc") {
            list.sort((a, b) => String(b.fields.Name ?? "").localeCompare(String(a.fields.Name ?? "")));
        } else if (this.filters.sort === "note-desc") {
            list.sort((a, b) => (Number(b.fields.note) || 0) - (Number(a.fields.note) || 0));
        } else if (this.filters.sort === "note-asc") {
            list.sort((a, b) => (Number(a.fields.note) || 0) - (Number(b.fields.note) || 0));
        }

        this.view.render(list);
    }

    fillFilterOptions(restaurants) {
        const countries = [...new Set(restaurants.map(r => r.fields.country).filter(Boolean))].sort();
        const cuisines = [...new Set(restaurants.map(r => r.fields.typeOfCuisine).filter(Boolean))].sort();

        this.countrySelect.innerHTML =
            `<option value="">Tous les pays</option>` +
            countries.map(c => `<option value="${c}">${c}</option>`).join("");

        this.cuisineSelect.innerHTML =
            `<option value="">Toutes les cuisines</option>` +
            cuisines.map(c => `<option value="${c}">${c}</option>`).join("");
    }
}

