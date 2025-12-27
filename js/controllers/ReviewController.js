export class ReviewController {
    constructor(model, view, restaurantModel) {
        this.model = model;
        this.view = view;
        this.restaurantModel = restaurantModel;

        //quand reviews change on affiche
        this.model.subscribe(reviews => this.view.render(reviews));

        this.view.bindSubmit(async (data) => {
            await this.model.addReview(data);
            //moyenne et update
            const avg = this.model.getAverage();
            if (avg !== null) {
                await this.restaurantModel.updateRestaurant(
                    this.model.restaurantId,
                    { note: avg }
                );
            }
        });
    }

    async openForRestaurant(restaurant) {
        this.view.show(`Avis – ${restaurant.fields.Name}`);
        await this.model.loadForRestaurant(restaurant.id);
    }
}