import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { title: string };
};

export type RecipeDetail = {
    title: string;
    time: string;
    ingredients?: string;
    instructions?: string;
  };
  
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type RecipeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;