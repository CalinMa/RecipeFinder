import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import InputSearch from '../components/Input/Input';
import { fetchChatGPTResponse } from './../services/api';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecipeDetail } from '../navigation/types';

const FAVORITES_STORAGE_KEY = 'favoriteRecipes';

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeDetail[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const allRecipes = useRef<{[title: string]: RecipeDetail}>({});

  const loadFavorites = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavoriteRecipes(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Eroare la încărcarea favoritelor:', error);
    }
  }, []);
  const parseGptResponse = useCallback((response: string): RecipeDetail[] => {
    const lines = response.trim().split('\n');
    return lines.map(line => {
      const parts = line.split(', time:');
      if (parts.length >= 2) {
        const titlePart = parts[0].substring(parts[0].indexOf('. ') + 2).trim();
        const timeAndRest = parts[1].split(', Ingredients:');
        const timePart = timeAndRest[0].trim().replace(' min', '').trim() + ' min';
        const ingredientsAndInstructions = timeAndRest.length > 1 ? timeAndRest[1].split(', Instructions:') : [];
        const ingredientsPart = ingredientsAndInstructions.length > 0 ? ingredientsAndInstructions[0].trim() : undefined;
        const instructionsPart = ingredientsAndInstructions.length > 1 ? ingredientsAndInstructions[1].trim() : undefined;

        const recipe = { title: titlePart || undefined, time: timePart || undefined, ingredients: ingredientsPart, instructions: instructionsPart };
        if (recipe.title) {
          allRecipes.current[recipe.title] = recipe;
        }
        return { title: titlePart || undefined, time: timePart || undefined };
      }
      return { title: undefined, time: undefined };
    }).filter((recipe): recipe is { title: string; time: string } => !!recipe.title && !!recipe.time);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );



  const saveFavorites = useCallback(async (favorites: RecipeDetail[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Eroare la salvarea favoritelor:', error);
    }
  }, []);

  const handleChangeText = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const [dislikedSuggestions, setDislikedSuggestions] = useState<string[]>([]);

  const handleClear = useCallback(() => {
    setSuggestedRecipes([]);
    handleChangeText('')
  }, [])
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSuggestedRecipes([]);
    setError(null);
    // console.log('Pushed search with:', inputText, 'Disliked:', dislikedSuggestions);

    if (inputText.length > 0) {
      const prompt = `Please generate 5 recipe titles for ${inputText}. Each title must be a maximum of 25 characters long.
      The response should include a list of recipes with title and preparation time, Ingredients, and Instructions, and be in the format 1.'....', time: 15 min, Ingredients: ...., Instructions: ....
      Avoid generating recipes with the following titles: ${dislikedSuggestions.join(', ')}. Even in case of long preparation time, respond in minutes, never in other formats such as hours.`;
      try {
        const apiResponse = await fetchChatGPTResponse(prompt);
        // console.log('GPT Response:', apiResponse);
        const parsedRecipes = parseGptResponse(apiResponse);
        setSuggestedRecipes(parsedRecipes);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('A apărut o eroare la generarea rețetelor.');
        setSuggestedRecipes([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestedRecipes([]);
      setLoading(false);
    }
  }, [inputText, dislikedSuggestions, parseGptResponse]);

  const handleDontLike = useCallback(() => {
    const dislikedTitles = suggestedRecipes.map(recipe => recipe.title).filter(title => title !== undefined) as string[];
    setDislikedSuggestions(prevDisliked => [...prevDisliked, ...dislikedTitles]);
    handleSearch();
  }, [suggestedRecipes, handleSearch]);



  const handleToggleFavorite = useCallback((recipeToAddOrRemove: RecipeDetail) => {
    const isAlreadyFavorite = favoriteRecipes.some(fav => fav.title === recipeToAddOrRemove.title);
    let newFavorites = [...favoriteRecipes];
    let newSuggestions = [...suggestedRecipes];

    if (isAlreadyFavorite) {
      newFavorites = newFavorites.filter(fav => fav.title !== recipeToAddOrRemove.title);
    } else {
      newFavorites.push(recipeToAddOrRemove);
      newSuggestions = newSuggestions.filter(suggestion => suggestion.title !== recipeToAddOrRemove.title);
    }
    setFavoriteRecipes(newFavorites);
    setSuggestedRecipes(newSuggestions);
    saveFavorites(newFavorites);
  }, [favoriteRecipes, suggestedRecipes, saveFavorites]);

  const handleRecipePress = useCallback((title: string | undefined) => {
    if (title && allRecipes.current[title]) {
      navigation.navigate('RecipeDetail', allRecipes.current[title]);
    }
  }, [navigation, allRecipes]);

  const handleFavoritePress = useCallback((recipe: RecipeDetail) => {
    navigation.navigate('RecipeDetail', recipe);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <InputSearch
        value={inputText}
        onChangeText={handleChangeText}
        placeholder="What do you feel like eating?"
        onSearch={handleSearch}
        onClear={handleClear}
        suggested={suggestedRecipes.length > 0}
      />

      {loading && <ActivityIndicator size="large" color="#65558F" style={styles.loader} />}

      {error && <Text style={styles.error}>{error}</Text>}
    {/* favorites */}
      <ScrollView style={styles.suggestionsContainer}>
        {favoriteRecipes.length > 0 && <Text style={styles.favoritesTitle}>Favorites</Text>}
        {favoriteRecipes.map((favRecipe, index) => (
          <TouchableOpacity key={index} onPress={() => handleFavoritePress(favRecipe)}>
            <RecipeCard
              title={favRecipe.title}
              time={favRecipe.time}
              isFavorite={true}
              onToggleFavorite={() => handleToggleFavorite(favRecipe)}
            />
          </TouchableOpacity>
        ))}
    {/* sugestions */}
        {suggestedRecipes.length > 0 && <Text style={styles.suggestionsTitle}>Suggested Recipes</Text>}
        {suggestedRecipes.map((recipe, index) => (
          recipe.title && recipe.time ? (
            <TouchableOpacity key={index} onPress={() => handleRecipePress(recipe.title)}>
              <RecipeCard
                title={recipe.title}
                time={recipe.time}
                isFavorite={favoriteRecipes.some(fav => fav.title === recipe.title)}
                onToggleFavorite={() => handleToggleFavorite(allRecipes.current[recipe.title])}
              />
            </TouchableOpacity>
          ) : null
        ))}
      </ScrollView>

      {suggestedRecipes.some(recipe => recipe.title) && (
        <TouchableOpacity style={styles.nextButton} onPress={handleDontLike}>
            <View><Text style={styles.nextButtonText}>I don't like these</Text></View>
        </TouchableOpacity>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20
  },
  suggestionsContainer: {
    marginTop: 20,
    width: '100%',
    maxHeight: 550
  },
  loader: {
    marginTop: 20,
  },
  error: {
    marginTop: 20,
    color: 'red',
  },
  nextButton: {
    backgroundColor: '#65558F',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: 180
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});