import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
} from 'react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  editable?: boolean;
  icon?: React.ReactNode;
  prefix?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
  error,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  inputStyle,
  maxLength,
  editable = true,
  icon,
  prefix,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Prepare input styles as an array of definite styles
  const getInputStyles = (): (TextStyle | undefined)[] => {
    const styleArray: (TextStyle | undefined)[] = [styles.input, inputStyle];

    if (multiline) {
      styleArray.push({textAlignVertical: 'top'});
    }

    if (icon) {
      styleArray.push({paddingLeft: 10});
    }

    if (prefix) {
      styleArray.push({paddingLeft: 0});
    }

    return styleArray;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          !editable && styles.disabledInput,
        ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={getInputStyles()}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#333',
  },
  iconContainer: {
    paddingLeft: 16,
  },
  prefix: {
    paddingLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  focusedInput: {
    borderColor: '#007BFF',
  },
  errorInput: {
    borderColor: '#DC3545',
  },
  disabledInput: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;
