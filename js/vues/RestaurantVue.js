export class RestaurantVue {
    constructor() {
        this.container = document.getElementById("restaurantList");
    }

    render(restaurants) {
        this.container.innerHTML = "";

        restaurants.forEach(r => {
            const isFav = this.isFavorite ? this.isFavorite(r.id) : false;
            const flagUrl = this.getFlagUrl ? this.getFlagUrl(r.fields.country) : null;

            const div = document.createElement("div");
            div.classList.add("fade-in");
            console.log("Restaurant country =", r.fields.country, "flagUrl =", flagUrl);
            div.innerHTML = `
            <h3>
                ${r.fields.Name}
                <button class="btn-fav" data-id="${r.id}">
                ${isFav ? "⭐" : "☆"}
                </button>
            </h3>

            <p>Cuisine : ${r.fields.typeOfCuisine}</p>
            <p>Pays : 
                ${flagUrl ? `<img src="${flagUrl}" width="24" alt="${r.fields.country}">` : ""}
            </p>
            <p>Note : ${r.fields.note ?? "Non noté"}</p>

            <button class="btn-reviews" data-id="${r.id}">Avis</button>
            <button class="btn-update" data-id="${r.id}">Modifier</button>
            <button class="btn-delete" data-id="${r.id}">Supprimer</button>
            `;

            this.container.appendChild(div);
        });
    }
}