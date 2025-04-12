import React from 'react';
import { TextInput, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSearch: () => void
}

const Input: React.FC<InputProps> = React.memo(({ value,  placeholder, onSearch, onChangeText}) => {
  console.log('randat')
  return (
    <View style={{ width: '100%', maxWidth: 400, padding: 8 }}>
       <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{
          padding: 12,
          paddingRight: 40,
          borderColor: '#D1D5DB',
          borderWidth: 1,
          borderRadius: 8,
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
        <Icon name="search" size={20} color="#A1A1AA" onPress={onSearch} />
      </View>
    </View>
  );
});

export default Input;
