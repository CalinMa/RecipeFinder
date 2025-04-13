import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import InputSearch from '../components/Input/Input';
import { fetchChatGPTResponse } from './../services/api';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import { useNavigation } from '@react-navigation/native';
import { RecipeDetail } from '../navigation/types'; 

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeDetail[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation(); // Get the navigation object

  const handleChangeText = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSuggestedRecipes([]);
    setError(null);
    console.log('Pushed search with:', inputText);

    if (inputText.length > 0) {
      const prompt = `Te rog să generezi 5 titluri de retete pentru ${inputText}. Fiecare titlu trebuie sa fie compus din maxim 25 de caractere
      Răspunsul ar trebui să includă o listă de retete cu titlu si timp de preparare si sa fie de forma 1.'....', timp: 15 min`;
      try {
        const apiResponse = await fetchChatGPTResponse(prompt);
        console.log('GPT Response:', apiResponse);
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
  }, [inputText]);

  const parseGptResponse = (response: string): RecipeDetail[] => {
    const lines = response.trim().split('\n');
    return lines.map(line => {
      const parts = line.split(', timp:');
      if (parts.length === 2) {
        const titlePart = parts[0].substring(parts[0].indexOf('. ') + 2).trim();
        const timePart = parts[1].trim().replace(' min', '').trim();
        return { title: titlePart || undefined, time: timePart ? timePart + ' min' : undefined };
      }
      return { title: undefined, time: undefined };
    }).filter((recipe): recipe is { title: string; time: string } => !!recipe.title && !!recipe.time);
  };

  const handleToggleFavorite = (title: string | undefined) => {
    if (title) {
      if (favoriteRecipes.includes(title)) {
        setFavoriteRecipes(prev => prev.filter(t => t !== title));
      } else {
        setFavoriteRecipes(prev => [...prev, title]);
      }
    }
  };

  const handleRecipePress = (title: string | undefined) => {
    if (title) {
      navigation.navigate('RecipeDetail', { title });
    }
  };

  return (
    <View style={styles.container}>
      <InputSearch
        value={inputText}
        onChangeText={handleChangeText}
        placeholder="What do you feel like eating?"
        onSearch={handleSearch}
      />

      {loading && <ActivityIndicator size="large" color="#65558F" style={styles.loader} />}

      {error && <Text style={styles.error}>{error}</Text>}

      <ScrollView style={styles.suggestionsContainer}>
        {suggestedRecipes.map((recipe, index) => (
          recipe.title && recipe.time ? (
            <TouchableOpacity key={index} onPress={() => handleRecipePress(recipe.title)}>
              <RecipeCard
                title={recipe.title}
                time={recipe.time}
                isFavorite={favoriteRecipes.includes(recipe.title)}
                onToggleFavorite={() => handleToggleFavorite(recipe.title)}
              />
            </TouchableOpacity>
          ) : null
        ))}
      </ScrollView>

      {suggestedRecipes.some(recipe => recipe.title) && (
        <TouchableOpacity style={styles.nextButton} onPress={handleSearch}>
          <Text style={styles.nextButtonText}>I don't like these</Text>
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
    maxHeight: 600
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
});