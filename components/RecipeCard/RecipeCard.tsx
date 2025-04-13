import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
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
        <View style={styles.rectangleStyle}>
        <Image source={require('../../assets/no-image.png')} style={styles.imageStyle} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <TouchableOpacity onPress={onToggleFavorite}>
        <Icon name={isFavorite ? 'heart' : 'heart'} size={24} color={isFavorite ? '#65558F' : 'lightgrey'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  rectangleStyle : {
    width: 88,
    height: 88,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle : {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  }
});

export default React.memo(RecipeCard);