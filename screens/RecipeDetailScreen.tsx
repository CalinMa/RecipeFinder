import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { fetchChatGPTResponse } from '../services/api';
import { RecipeDetailScreenProps } from '../navigation/types'; 

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ route }) => { 
  const [recipeDetails, setRecipeDetails] = useState<{description?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { title} = route.params; 

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      setLoading(true);
      setError(null);
      const prompt = `Te rog să-mi dai detalii despre rețeta "${title}". Raspunsul va fi impartit in: Ingredients: ...., Instructions: ...."`;
      try {
        const apiResponse = await fetchChatGPTResponse(prompt);
        
        console.log(apiResponse)
        setRecipeDetails({ description: apiResponse });
      } catch (err) {
        console.error('Error fetching recipe details:', err);
        setError('Eroare la încărcarea detaliilor rețetei.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [title]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#65558F"/>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
            {recipeDetails && (
        <Image
          source={require('../assets/no-image.png')}
          style={styles.image}
        />
      )}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {recipeDetails.description && (
        <Text style={styles.description}>{recipeDetails.description}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  image: { width: '100%', height: 200, resizeMode: 'cover', marginBottom: 10 },
  description: { fontSize: 16 },
  error: { color: 'red' },
});

export default RecipeDetailScreen;