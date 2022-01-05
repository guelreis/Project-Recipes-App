import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import fetchDrinkRecipe from '../services/fetchDrinkRecipes';
import AppContext from '../context/AppContext';
import fetchMealsDefault from '../services/fetchMealsDefault';
import { setDrinkInProgress } from '../services/setRecipeInProgress';

const inProgressRecipes = () => (localStorage
  .getItem('inProgressRecipes') !== null ? JSON
    .parse(localStorage.getItem('inProgressRecipes')) : { id: '' });

const doneRecipes = () => (localStorage
  .getItem('doneRecipes') !== null ? JSON
    .parse(localStorage.getItem('doneRecipes')) : [{ id: '' }]);

function DrinkDetails() {
  const { slug } = useParams();
  const { currentDrinkRecipe, setCurrentDrinkRecipe } = useContext(AppContext);
  const [mealsRecomendation, setMealsRecomendation] = useState([]);
  const ingredientsArray = [];
  const measureArray = [];
  const MAX_INGREDIENT_SIZE = 15;
  const RECOMENDATION_CARD_SIZE = 6;

  useEffect(() => {
    async function getRecipe() {
      const recipe = await fetchDrinkRecipe(slug);
      setCurrentDrinkRecipe(recipe);
    }
    async function getDefaultRecomendations() {
      const defaultRecomendation = await fetchMealsDefault();
      setMealsRecomendation(defaultRecomendation);
    }
    getRecipe();
    getDefaultRecomendations();
  }, [setCurrentDrinkRecipe, slug]);

  if (currentDrinkRecipe) {
    for (let i = 1; i <= MAX_INGREDIENT_SIZE; i += 1) {
      if (currentDrinkRecipe[`strIngredient${i}`]) {
        ingredientsArray.push(currentDrinkRecipe[`strIngredient${i}`]);
      }
      if (currentDrinkRecipe[`strIngredient${i}`]) {
        measureArray.push(currentDrinkRecipe[`strMeasure${i}`]);
      }
    }
  }

  const isRecipeDone = currentDrinkRecipe && doneRecipes()
    .some((recipes) => (recipes.id === currentDrinkRecipe.idDrink));

  return (
    <main>
      {currentDrinkRecipe && (
        <article>
          <img
            width="300px"
            src={ currentDrinkRecipe.strDrinkThumb }
            alt={ currentDrinkRecipe.strDrink }
            data-testid="recipe-photo"
          />
          <h2 data-testid="recipe-title">{currentDrinkRecipe.strDrink}</h2>
          <h4 data-testid="recipe-category">{currentDrinkRecipe.strAlcoholic}</h4>
          <button
            data-testid="share-btn"
            type="button"
          >
            Compartilhar
          </button>

          <button
            data-testid="favorite-btn"
            type="button"
          >
            Favoritar
          </button>
          <p data-testid="recipe-category">{currentDrinkRecipe.strCategory}</p>
          <div>
            <ul>
              {
                ingredientsArray.map((ingredient, index) => (
                  <li
                    key={ index }
                    data-testid={ `${index}-ingredient-name-and-measure` }
                  >
                    {ingredient}
                    {' - '}
                    {measureArray[index]}
                  </li>
                ))
              }
            </ul>
          </div>
          <p data-testid="instructions">{currentDrinkRecipe.strInstructions}</p>
          <div>
            {mealsRecomendation && mealsRecomendation.map((meal, index) => (
              index < RECOMENDATION_CARD_SIZE && (
                <Link
                  key={ meal.idMeal }
                  to={ `/comidas/${meal.idMeal}` }
                >
                  <article
                    data-testid={ `${index}-recomendation-card` }
                  >
                    <h1
                      data-testid={ `${index}-card-name` }
                    >
                      { meal.strMeal }
                    </h1>
                    <img
                      src={ meal.strMealThumb }
                      alt={ meal.strMeal }
                      data-testid={ `${index}-card-img` }
                    />
                  </article>
                </Link>
              )
            ))}
          </div>
          <Link
            to={ `/bebidas/${currentDrinkRecipe.idDrink}/in-progress` }
          >
            <button
              data-testid="start-recipe-btn"
              type="button"
              style={ {
                bottom: 0,
                position: 'fixed',
                display: isRecipeDone ? 'none' : 'block' } }
              onClick={ () => setDrinkInProgress(currentDrinkRecipe) }
            >
              {inProgressRecipes().id === currentDrinkRecipe.idDrink ? (
                'Continuar Receita'
              ) : ('Iniciar Receita')}
            </button>
          </Link>
        </article>
      )}
    </main>
  );
}

export default DrinkDetails;
