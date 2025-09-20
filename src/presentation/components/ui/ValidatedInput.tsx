import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface ValidatedInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  isValid?: boolean;
  showValidation?: boolean;
  validationDelay?: number;
  onValidationChange?: (isValid: boolean) => void;
  validator?: (value: string) => { isValid: boolean; message?: string };
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  showPasswordToggle?: boolean;
  strengthIndicator?: boolean;
  strengthScore?: number;
  strengthLabel?: string;
  strengthColor?: string;
  style?: ViewStyle; // Cambiar de StyleProp<TextStyle> a ViewStyle
}

export default function ValidatedInput({
  label,
  error,
  isValid,
  showValidation = true,
  validationDelay = 500,
  onValidationChange,
  validator,
  leftIcon,
  rightIcon,
  onRightIconPress,
  showPasswordToggle = false,
  strengthIndicator = false,
  strengthScore = 0,
  strengthLabel = '',
  strengthColor = '#e5e7eb',
  style,
  ...props
}: ValidatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(undefined);
  // Corregir el tipo del timeout
  const [validationTimeout, setValidationTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  const borderColorAnim = new Animated.Value(0);
  const errorOpacityAnim = new Animated.Value(0);

  const currentError = error || localError;
  const hasError = Boolean(currentError);
  const isValidInput = isValid !== undefined ? isValid : !hasError;

  useEffect(() => {
    // Animar color del borde
    Animated.timing(borderColorAnim, {
      toValue: hasError ? 2 : isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Animar opacidad del error
    Animated.timing(errorOpacityAnim, {
      toValue: hasError ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [hasError, isFocused]);

  const handleChangeText = (text: string) => {
    props.onChangeText?.(text);

    if (validator && showValidation) {
      // Limpiar timeout anterior
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }

      // Validación inmediata para campos vacíos
      if (!text.trim()) {
        setLocalError(undefined);
        onValidationChange?.(false);
        return;
      }

      // Validación con delay para otros casos - Corregir el tipo
      const timeout = setTimeout(() => {
        const validation = validator(text);
        setLocalError(validation.isValid ? undefined : validation.message);
        onValidationChange?.(validation.isValid);
      }, validationDelay);

      setValidationTimeout(timeout);
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);

    // Validación inmediata al perder el foco
    if (validator && showValidation && props.value) {
      const validation = validator(props.value);
      setLocalError(validation.isValid ? undefined : validation.message);
      onValidationChange?.(validation.isValid);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getBorderColor = () => {
    return borderColorAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: ['rgba(255, 255, 255, 0.3)', '#22c55e', '#ef4444'],
    });
  };

  const getIconColor = () => {
    if (hasError) return '#ef4444';
    if (isFocused) return '#22c55e';
    return '#9ca3af';
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          style, // Ahora es compatible con ViewStyle
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          {...props}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
          ]}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={showPasswordToggle ? !showPassword : props.secureTextEntry}
          placeholderTextColor="#9ca3af"
          accessible={true}
          accessibilityLabel={label || props.placeholder}
          accessibilityHint={currentError ? `Error: ${currentError}` : undefined}
          accessibilityState={{
            disabled: props.editable === false,
            // Remover 'invalid' ya que no es una propiedad válida
          }}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            accessibilityRole="button"
            accessibilityState={{ disabled: props.editable === false }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
        
        {isValidInput && !hasError && showValidation && props.value && (
          <View style={styles.validIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          </View>
        )}
      </Animated.View>
      
      {/* Indicador de fortaleza de contraseña */}
      {strengthIndicator && props.value && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            {[...Array(5)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.strengthSegment,
                  {
                    backgroundColor: index <= strengthScore ? strengthColor : '#e5e7eb',
                  },
                ]}
              />
            ))}
          </View>
          {strengthLabel && (
            <Text style={[styles.strengthLabel, { color: strengthColor }]}>
              {strengthLabel}
            </Text>
          )}
        </View>
      )}
      
      {/* Mensaje de error */}
      <Animated.View
        style={[
          styles.errorContainer,
          { opacity: errorOpacityAnim },
        ]}
      >
        {currentError && (
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{currentError}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  labelError: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 16,
  },
  inputWithLeftIcon: {
    marginLeft: 12,
  },
  inputWithRightIcon: {
    marginRight: 12,
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
    padding: 4,
  },
  validIcon: {
    marginLeft: 4,
  },
  strengthContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
  errorContainer: {
    minHeight: 24,
    justifyContent: 'center',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 6,
    flex: 1,
  },
});