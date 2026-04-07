import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export type ToastRef = {
  show: (message: string, type?: 'success' | 'error') => void;
};

const Toast = forwardRef<ToastRef>((props, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [opacity] = useState(new Animated.Value(0));

  useImperativeHandle(ref, () => ({
    show: (msg: string, t: 'success' | 'error' = 'success') => {
      setMessage(msg);
      setType(t);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    },
  }));

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity, backgroundColor: type === 'success' ? '#2ECC71' : '#E74C3C' }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    zIndex: 999,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Toast;
