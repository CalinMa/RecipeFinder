import React from 'react';
import { TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSearch: () => void,
  onClear: () => void,
  suggested: boolean
}

const Input: React.FC<InputProps> = React.memo(({ value,  placeholder, onSearch, onChangeText, suggested, onClear}) => {
  return (
    <View style={{ width: '100%', maxWidth: 400, padding: 8}}>
       <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{
          padding: 12,
          paddingRight: 40,
          backgroundColor: '#FFFFFF',
          borderColor:'#D9D9D9',
          borderWidth: 1,
          borderRadius: 25,
          gap: 10, 
          color: '#B3B3B3'
        }}
        onSubmitEditing={onSearch}
      />
      <View
        style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: [{ translateY: -10 }]
        }}
      >
        {suggested ? 
        <Icon name="x" size={20} color="#1E1E1E" onPress={onClear}/>
      : <Icon name="search" size={20} color="#1E1E1E" onPress={onSearch} />}
        
      </View>
    </View>
  );
});

export default Input;
