import * as Clipboard from 'expo-clipboard';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, TextInput, View } from 'react-native';

const OTP_LENGTH = 6;

interface OtpInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export interface OtpInputRef {
  clear: () => void;
}

const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(({ onComplete, disabled }, ref) => {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const inputs = useRef<TextInput[]>([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    },
  }));

  const handlePaste = async () => {
    const clipboardText = await Clipboard.getStringAsync();
    if (clipboardText.length === OTP_LENGTH && /^[0-9]+$/.test(clipboardText)) {
      const newOtp = clipboardText.split('');
      setOtp(newOtp);
      onComplete(clipboardText);
      Keyboard.dismiss();
    } else {
      Alert.alert('Error al pegar', 'El formato del código OTP en el portapapeles no es válido.');
    }
  };

  const handleChange = (text: string, index: number) => {
    if (disabled) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container} onTouchStart={handlePaste}>
      {otp.map((_, index) => (
        <TextInput
          key={index}
          ref={(input) => { inputs.current[index] = input!; }}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          value={otp[index]}
          editable={!disabled}
          selectTextOnFocus
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    backgroundColor: '#F9FAFB', // gray-50
  },
});

export default OtpInput;