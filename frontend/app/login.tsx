import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { authApi, setToken } from '@/services/api';
import Toast, { ToastRef } from '@/components/Toast';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors } from '@/constants/theme';

export default function LoginScreen() {
  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toastRef = React.useRef<ToastRef>(null);
  const router = useRouter();

  const onLogin = async () => {
    if (!email || !password) {
      toastRef.current?.show('Please enter both email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      await setToken(response.token);
      toastRef.current?.show('Welcome back! ✨', 'success');
      setTimeout(() => {
        router.replace('/future/(tabs)');
      }, 1000);
    } catch (error: any) {
      toastRef.current?.show(error.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = () => {
    router.push('/register');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Branding.black }}>
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.08)', 'transparent', Branding.black]}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <View style={styles.header}>
    <View style={styles.logoContainer}>
      <Image 
        source={require('@/assets/images/logo-astromind.png')} 
        style={{ width: 80, height: 80, borderRadius: 40 }} 
        resizeMode="contain"
      />
      <View style={styles.logoGlow} />
    </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your celestial journey with Astromind</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={Branding.gold} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Branding.gold} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="rgba(255,255,255,0.4)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={() => toastRef.current?.show('Coming soon...', 'info')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={onLogin} 
            activeOpacity={0.8} 
            style={styles.loginBtnWrapper}
            disabled={loading}
          >
            <LinearGradient
              colors={[Branding.gold, '#B8860B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator color={Branding.black} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            onPress={() => {
              toastRef.current?.show('Redirecting to Google...', 'success');
              // Mock: If new user -> router.push('/register'), if existing -> router.replace('/future/(tabs)')
              setTimeout(() => router.push('/register'), 1500);
            }} 
            style={styles.googleBtn}
          >
            <Ionicons name="logo-google" size={20} color="white" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onRegister}>
              <Text style={styles.registerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  logoGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Branding.gold,
    opacity: 0.1,
    zIndex: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    color: Branding.gold,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -5,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
  loginBtnWrapper: {
    width: '100%',
    shadowColor: Branding.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 10,
  },
  loginBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: Branding.black,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  registerLink: {
    color: Branding.gold,
    fontWeight: 'bold',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: 15,
    fontSize: 12,
    fontWeight: 'bold',
  },
  googleBtn: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
