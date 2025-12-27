import { AIRTABLE_CONFIG } from "../config/airtable.config.js";

const API_KEY = AIRTABLE_CONFIG.API_KEY;
const BASE_ID = AIRTABLE_CONFIG.BASE_ID;
const TABLE_RESTAURANT = AIRTABLE_CONFIG.TABLE_RESTAURANT;
const TABLE_REVIEW = AIRTABLE_CONFIG.TABLE_REVIEW;

export const AirtableService = {
    //on récup les restau via airtable
    getRestaurants: async () => {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_RESTAURANT}`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();
            return data.records;  // Retourne les enregistrements
        } catch (error) {
            console.error("Erreur Airtable:", error);
            return [];
        }
    },
    //crée restau dans airtable
    createRestaurant: async (restaurant) => {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_RESTAURANT}`;
        //les champs dans airtable
        const payload = {
            fields: {
                Name: restaurant.name,
                typeOfCuisine: restaurant.typeOfCuisine,
                country: restaurant.country,
                note: restaurant.note ?? null,
                favorite: false,
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Airtable create failed ${response.status}: ${errText}`);
        }

        return await response.json(); // renvoie le record créé (id + fields)
    },
    //supp
    deleteRestaurant: async (id) => {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_RESTAURANT}/${id}`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${API_KEY}`
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Airtable delete failed ${response.status}: ${errText}`);
        }

        return await response.json();
    },
    //update
    updateRestaurant: async (id, restaurant) => {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_RESTAURANT}/${id}`;

        const fields = {
            Name: restaurant.name,
            typeOfCuisine: restaurant.typeOfCuisine,
            country: restaurant.country
        };

        if (restaurant.note !== null) fields.note = restaurant.note;

        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Update failed ${response.status}: ${errText}`);
        }

        return await response.json();
    },
    //recup les pays
    getCountries: async () => {
        let all = [];
        let offset = null;
        //on lance une requetes
        do {
            const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${AIRTABLE_CONFIG.TABLE_COUNTRY}`);
            url.searchParams.set("pageSize", "100");
            if (offset) url.searchParams.set("offset", offset);

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Airtable getCountries failed ${response.status}: ${errText}`);
            }

            const data = await response.json();
            all = all.concat(data.records);
            offset = data.offset;

        } while (offset); // tant que ça renvoie un offset

        return all;
    },
    //recup les avis du restau
    getReviewsByRestaurant: async (restaurantId) => {
        const formula = encodeURIComponent(`FIND("${restaurantId}", ARRAYJOIN({restaurant}))`);
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_REVIEW}?filterByFormula=${formula}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        return data.records;
    },

    //ajouter un avis
    createReview: async (review) => {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_REVIEW}`;

        const payload = {
            fields: {
                Name: review.user,
                restaurant: [review.restaurantId], // linked record
                value: review.value,
                comment: review.comment,
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return await response.json();
    }


}