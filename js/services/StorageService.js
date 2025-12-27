const FAVORITES_KEY = "favoriteRestaurants";

export const StorageService = {
    getFavorites() {
        const data = localStorage.getItem(FAVORITES_KEY);
        return data ? JSON.parse(data) : [];
    },

    isFavorite(id) {
        return this.getFavorites().includes(id);
    },

    addFavorite(id) {
        const favorites = this.getFavorites();
        if (!favorites.includes(id)) {
            favorites.push(id);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    },

    removeFavorite(id) {
        const favorites = this.getFavorites().filter(favId => favId !== id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
};