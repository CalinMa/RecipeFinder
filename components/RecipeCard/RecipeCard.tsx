import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface RecipeCardProps {
  title: string;
  time: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ title, time, isFavorite, onToggleFavorite }) => {
  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>Timp: {time}</Text>
      </View>
      <TouchableOpacity onPress={onToggleFavorite}>
        <Icon name={isFavorite ? 'heart' : 'heart'} size={24} color={isFavorite ? 'red' : 'gray'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: 'gray',
  },
});

export default React.memo(RecipeCard);