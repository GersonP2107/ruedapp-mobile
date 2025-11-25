import * as Clipboard from 'expo-clipboard';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

const OTP_LENGTH = 6;

interface OtpInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
  autoFillFromClipboard?: boolean;
}

export interface OtpInputRef {
  clear: () => void;
  focus: () => void;
}

const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(({ onComplete, disabled, autoFillFromClipboard = false }, ref) => {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const inputs = useRef<TextInput[]>([]);
  const hasTriedPaste = useRef(false);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    },
    focus: () => {
      inputs.current[0]?.focus();
    },
  }));

  const handlePaste = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return;

      const clipboardTextRaw = await Clipboard.getStringAsync();
      const clipboardText = clipboardTextRaw.replace(/\s/g, ''); // normaliza espacios/saltos de línea
      if (/^\d{6}$/.test(clipboardText)) {
        const newOtp = clipboardText.split('');
        setOtp(newOtp);
        onComplete(clipboardText);
        Keyboard.dismiss();
      }
    } catch (error) {
      // Ignorar errores de permisos del portapapeles
      console.log('Clipboard access error:', error);
    }
  };

  const handleChange = (text: string, index: number) => {
    if (disabled) return;

    const digit = text.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else if (!digit && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (newOtp.every((d) => d !== '')) {
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
    <View style={styles.container}>
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
          onFocus={() => {
            if (autoFillFromClipboard && !hasTriedPaste.current && index === 0) {
              hasTriedPaste.current = true;
              handlePaste();
            }
          }}
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