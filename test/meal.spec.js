var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');
var Food = require('../models').Food;
var Meal = require('../models').Meal;
var MealFood = require('../models').MealFood;

describe('api', () => {
  beforeAll(() => {
    shell.exec('npx sequelize db:create')
  });
  beforeEach(() => {
      shell.exec('npx sequelize db:migrate')
    });
  afterEach(() => {
    shell.exec('npx sequelize db:migrate:undo:all')
  });

  describe('Test Meal Paths', () => {
    describe('POST /api/v1/meals/:meal_id/foods/:id', () => {
      test('success', async function() {
        let meal = await Meal.create({"name":"breakfast"});
        let food = await Food.create({"name":"food1", "calories":100});

        let message = `Successfully added ${food.name} to ${meal.name}`
        return request(app)
                .post(`/api/v1/meals/${meal.id}/foods/${food.id}`)
                .then(async function(response) {
                  expect(response.statusCode).toBe(201);
                  expect(response.body).toHaveProperty("message", message);
                  let r = await Food.findByPk(1);
                  let relation = await MealFood.findOne({where: {
                    MealId: meal.id,
                    FoodId: food.id
                  }})
                  expect(relation).not.toBe(null);
                })
      })

      test('incorrect meal id; failure', async function(){
        let meal = await Meal.create({"name":"breakfast"});
        let food = await Food.create({"name":"food1", "calories":100});

        return request(app)
                .post(`/api/v1/meals/${meal.id+5}/foods/${food.id}`)
                .then(response => {
                  expect(response.statusCode).toBe(404);
                  expect(response.body).toHaveProperty("error", "Invalid Parameters");
                })
      })

      test('incorrect food id; failure', async function(){
        let meal = await Meal.create({"name":"breakfast"});
        let food = await Food.create({"name":"food1", "calories":100});

        return request(app)
                .post(`/api/v1/meals/${meal.id}/foods/${food.id + 5}`)
                .then(response => {
                  expect(response.statusCode).toBe(404);
                  expect(response.body).toHaveProperty("error", "Invalid Parameters");
                })
      })

      test('incorrect meal and food ids; failure', async function(){
        let meal = await Meal.create({"name":"breakfast"});
        let food = await Food.create({"name":"food1", "calories":100});

        return request(app)
                .post(`/api/v1/meals/${meal.id + 5}/foods/${food.id + 5}`)
                .then(response => {
                  expect(response.statusCode).toBe(404);
                  expect(response.body).toHaveProperty("error", "Invalid Parameters");
                })
      })

    })
  })

});
