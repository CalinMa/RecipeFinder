import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RecipeDetailScreenProps, RecipeDetail } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = 'favoriteRecipes';

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ route }) => {
  const { title, time, ingredients, instructions } = route.params as RecipeDetail;
  const [isFavorite, setIsFavorite] = useState(false);
 
  useEffect(() => {
    checkIfFavorite();
  }, [title]);

  const checkIfFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites) as RecipeDetail[];
        setIsFavorite(favorites.some(fav => fav.title === title));
      }
    } catch (error) {
      console.error('Eroare la verificarea favoritelor:', error);
    }
  };

  const toggleFavorite = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      let favorites = storedFavorites ? (JSON.parse(storedFavorites) as RecipeDetail[]) : [];

      const isCurrentlyFavorite = favorites.some(fav => fav.title === title);

      if (isCurrentlyFavorite) {
        favorites = favorites.filter(fav => fav.title !== title);
        setIsFavorite(false);
      } else {
        favorites.push({ title, time, ingredients, instructions });
        setIsFavorite(true);
      }

      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Eroare la gestionarea favoritelor:', error);
    }
  }, [title, time, ingredients, instructions]);

  return (
    <ScrollView style={styles.container}>
         <Image source={require('../assets/no-image.png')} style={styles.image}/>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Icon name={isFavorite ? 'heart' : 'heart'} size={24} color={isFavorite ? '#65558F' : 'black'} />
        </TouchableOpacity>
      </View>
      
      {ingredients && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          <Text style={styles.sectionText}>{ingredients}</Text>
        </View>
      )}
      {instructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions:</Text>
          <Text style={styles.sectionText}>{instructions}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  sectionText: { fontSize: 16, lineHeight: 24 },
  image:{height: 400, width: 400}
});

export default RecipeDetailScreen;