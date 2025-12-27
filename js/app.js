import { RestaurantModel } from "./models/RestaurantModel.js";
import { RestaurantVue } from "./vues/RestaurantVue.js";
import { ReviewModel } from "./models/ReviewModel.js";
import { ReviewVue } from "./vues/ReviewVue.js";
import { RestaurantController } from "./controllers/RestaurantController.js";
import { ReviewController } from "./controllers/ReviewController.js";

//models
const restaurantModel = new RestaurantModel();
const reviewModel = new ReviewModel();

//views
const restaurantVue = new RestaurantVue();
const reviewVue = new ReviewVue();

//reviewController
const reviewController = new ReviewController(reviewModel, reviewVue, restaurantModel);

// restaurantController
const restaurantController = new RestaurantController(restaurantModel, restaurantVue, reviewController);

//abonnement du model → controller
restaurantModel.subscribe(data => restaurantController.onRestaurantsChanged(data));

//charge les données
restaurantModel.loadCountries();
restaurantModel.loadRestaurants();