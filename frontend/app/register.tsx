import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { firebaseAuthApi } from '@/services/firebase-api';
import { setToken } from '@/services/api'; 
import Toast, { ToastRef } from '@/components/Toast';
import { useTheme } from '@/hooks/use-theme';
import { Branding, Colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const InputField = ({ label, icon, value, onChangeText, placeholder, secureTextEntry, showEye, onEyePress, keyboardType, autoCapitalize, editable }: any) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.label, { color: Branding.gold }]}>{label}</Text>
    <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(212, 175, 55, 0.2)' }]}>
      <Ionicons name={icon} size={18} color={Branding.gold} style={styles.inputIcon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.3)"
        style={[styles.input, { color: '#FFF' }]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable !== false}
      />
      {showEye && (
        <TouchableOpacity onPress={onEyePress} style={styles.eyeBtn}>
          <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);


const ZODIAC_IMAGES: any = {
  'Mesham': require('@/assets/zodiac/aries.png'),
  'Rishabam': require('@/assets/zodiac/taurus.png'),
  'Midhunam': require('@/assets/zodiac/gemini.png'),
  'Kadagam': require('@/assets/zodiac/cancer.png'),
  'Simmam': require('@/assets/zodiac/leo.png'),
  'Kanni': require('@/assets/zodiac/virgo.png'),
  'Thulam': require('@/assets/zodiac/libra.png'),
  'Viruchigam': require('@/assets/zodiac/scorpio.png'),
  'Virichagam': require('@/assets/zodiac/scorpio.png'),
  'Dhanusu': require('@/assets/zodiac/sagittarius.png'),
  'Magaram': require('@/assets/zodiac/capricorn.png'),
  'Kumbam': require('@/assets/zodiac/aquarius.png'),
  'Meenam': require('@/assets/zodiac/pisces.png'),
};

export default function RegisterScreen() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toastRef = React.useRef<ToastRef>(null);

  // New fields
  const [dob, setDob] = useState(new Date(1990, 0, 1));
  const [tob, setTob] = useState(new Date()); // Default to current time instead of hardcoded 10AM
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false);
  const [rasi, setRasi] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [padam, setPadam] = useState<number | null>(null);
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const { colorScheme } = useTheme();
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: '279864039046-bodorv4b614ldg3qo7aeojvjlrnu1jr2.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const onGoogleRegister = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo: any = await GoogleSignin.signIn();
      
      const user = userInfo.data.user;
      if (user) {
        setFirstName(user.givenName || '');
        setLastName(user.familyName || '');
        setEmail(user.email || '');
        setIsGoogleUser(true);
        toastRef.current?.show(`Welcome ${user.name}! ✨`, 'success');
        setTimeout(() => nextStep(), 1000);
      }
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            toastRef.current?.show('Sign in cancelled', 'info');
        } else {
            toastRef.current?.show(error.message || 'Google Sign-In failed', 'error');
        }
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async () => {
    if (!accepted) {
        toastRef.current?.show('Please accept Terms & Conditions', 'error');
        return;
    }
    if (password !== confirmPassword) {
      toastRef.current?.show('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const registrationData: any = {
        name: `${firstName} ${lastName}`,
        email,
        password,
        gender,
        profession,
      };

      if (!birthTimeUnknown) {
        // Ensure we send valid ISO date and HH:mm
        const y = dob.getFullYear();
        const m = (dob.getMonth() + 1).toString().padStart(2, '0');
        const d = dob.getDate().toString().padStart(2, '0');
        registrationData.dob = `${y}-${m}-${d}`;

        const hh = tob.getHours().toString().padStart(2, '0');
        const mm = tob.getMinutes().toString().padStart(2, '0');
        registrationData.tob = `${hh}:${mm}`;
      } else {
        registrationData.rasi = rasi;
        registrationData.nakshatra = nakshatra;
      }

      const user = await firebaseAuthApi.register(registrationData);
      if (user) {
          // Success Step
          setStep(3); 
          // AUTO NAVIGATE TO HOME AFTER 4 SECONDS
          setTimeout(() => {
              router.replace('/future/(tabs)');
          }, 4000);
      } else {
          toastRef.current?.show('Registration failed', 'error');
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      toastRef.current?.show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
      if (step === 0) {
          if (!firstName || !lastName || !email) {
              toastRef.current?.show('Please fill basic details', 'error');
              return;
          }
      }
      setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) setTob(selectedTime);
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
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title}>Join Astromind</Text>
            <Text style={styles.subtitle}>Step {step + 1} of 3</Text>
            <View style={styles.stepIndicator}>
                {[0,1,2].map(i => (
                    <View key={i} style={[styles.stepDot, step >= i && styles.activeDot, step === i && styles.currentDot]} />
                ))}
            </View>
          </View>

          <View style={styles.formSection}>
            {step === 0 && (
                <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                    <Text style={styles.sectionHeader}>Define Your Identity</Text>
                    
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <InputField 
                                label="First Name" 
                                icon="person-outline" 
                                value={firstName} 
                                onChangeText={setFirstName} 
                                placeholder="Vijay"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <InputField 
                                label="Last Name" 
                                icon="person-outline" 
                                value={lastName} 
                                onChangeText={setLastName} 
                                placeholder="Kumar"
                            />
                        </View>
                    </View>

                    <InputField 
                        label="Email Address" 
                        icon="mail-outline" 
                        value={email} 
                        onChangeText={setEmail} 
                        placeholder="vijay@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isGoogleUser}
                    />

                    <Text style={[styles.label, { color: Branding.gold, marginTop: 10 }]}>Select Gender</Text>
                    <View style={styles.genderRow}>
                        <TouchableOpacity 
                            style={[styles.genderCard, gender === 'male' && styles.activeGenderCard]}
                            onPress={() => setGender('male')}
                        >
                            <Ionicons name="male" size={24} color={gender === 'male' ? Branding.black : Branding.gold} />
                            <Text style={[styles.genderCardText, gender === 'male' && styles.activeGenderText]}>MALE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.genderCard, gender === 'female' && styles.activeGenderCard]}
                            onPress={() => setGender('female')}
                        >
                            <Ionicons name="female" size={24} color={gender === 'female' ? Branding.black : Branding.gold} />
                            <Text style={[styles.genderCardText, gender === 'female' && styles.activeGenderText]}>FEMALE</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonRowNav}>
                        <TouchableOpacity 
                            onPress={onGoogleRegister} 
                            style={[styles.googleBtn, { flex: 1, marginTop: 10, borderColor: Branding.gold }]}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={Branding.gold} />
                            ) : (
                                <Ionicons name="logo-google" size={20} color={Branding.gold} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.primaryBtn, { flex: 2 }]} onPress={nextStep}>
                            <Text style={styles.primaryBtnText}>Manual Next</Text>
                            <Ionicons name="arrow-forward" size={18} color={Branding.black} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {step === 1 && (
                <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                    <Text style={styles.sectionHeader}>Stellar Alignment</Text>
                    
                    <TouchableOpacity 
                    style={styles.manualSwitch}
                    onPress={() => setBirthTimeUnknown(!birthTimeUnknown)}
                    >
                    <Ionicons 
                        name={birthTimeUnknown ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={Branding.gold} 
                    />
                    <Text style={styles.switchText}>I don't know my birth time / manual Rasi</Text>
                    </TouchableOpacity>

                    {!birthTimeUnknown ? (
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={[styles.label, { color: Branding.gold }]}>Date of Birth</Text>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.pickerText}>{dob.toLocaleDateString()}</Text>
                            <Ionicons name="calendar-outline" size={18} color={Branding.gold} />
                        </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: Branding.gold }]}>Time of Birth</Text>
                        <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.pickerText}>{tob.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                            <Ionicons name="time-outline" size={18} color={Branding.gold} />
                        </TouchableOpacity>
                        </View>
                    </View>
                    ) : (
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                        <InputField 
                            label="Rasi" 
                            icon="moon-outline" 
                            value={rasi} 
                            onChangeText={setRasi} 
                            placeholder="Simha"
                        />
                        </View>
                        <View style={{ flex: 1 }}>
                        <InputField 
                            label="Nakshatra" 
                            icon="star-outline" 
                            value={nakshatra} 
                            onChangeText={setNakshatra} 
                            placeholder="Magha"
                        />
                        </View>
                    </View>
                    )}

                    <View style={styles.buttonRowNav}>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={prevStep}>
                            <Text style={styles.secondaryBtnText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.primaryBtn, { flex: 2 }]} onPress={nextStep}>
                            <Text style={styles.primaryBtnText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {step === 2 && (
                <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                    <Text style={styles.sectionHeader}>Vision & Security</Text>

                    <InputField 
                        label="Profession" 
                        icon="briefcase-outline" 
                        value={profession} 
                        onChangeText={setProfession} 
                        placeholder="e.g. Software Engineer"
                    />

                    <InputField 
                        label="Password" 
                        icon="lock-closed-outline" 
                        value={password} 
                        onChangeText={setPassword} 
                        placeholder="Required"
                        secureTextEntry={!showPassword}
                        showEye
                        onEyePress={() => setShowPassword(!showPassword)}
                    />
                    <InputField 
                        label="Confirm Password" 
                        icon="checkmark-circle-outline" 
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword} 
                        placeholder="Repeat password"
                        secureTextEntry={!showConfirmPassword}
                        showEye
                        onEyePress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />

                    <TouchableOpacity 
                        style={styles.agreementRow} 
                        onPress={() => setAccepted(!accepted)}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name={accepted ? "checkbox" : "square-outline"} 
                            size={22} 
                            color={accepted ? Branding.gold : "rgba(255,255,255,0.4)"} 
                        />
                        <Text style={styles.agreementText}>
                            I accept the <Text style={{ color: Branding.gold }}>Terms of Service</Text> & <Text style={{ color: Branding.gold }}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.buttonRowNav}>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={prevStep}>
                            <Text style={styles.secondaryBtnText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            disabled={loading}
                            onPress={onRegister}
                            activeOpacity={0.8}
                            style={[styles.registerBtnWrapper, { flex: 2 }]}
                        >
                            <LinearGradient
                            colors={[Branding.gold, '#B8860B']}
                            style={styles.registerBtn}
                            >
                            {loading ? (
                                <ActivityIndicator color={Branding.black} />
                            ) : (
                                <Text style={styles.registerBtnText}>Finalize Account</Text>
                            )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}

            {step === 3 && (
                <Animated.View entering={FadeInDown} style={{ alignItems: 'center', marginTop: -20 }}>
                    <View style={styles.successRevealContainer}>
                        <LinearGradient
                            colors={['rgba(212, 175, 55, 0.2)', 'transparent']}
                            style={styles.successGlow}
                        />
                        <Image 
                            source={ZODIAC_IMAGES[rasi?.split(' / ')[0]] || ZODIAC_IMAGES['Mesham']} 
                            style={styles.successZodiacLarge}
                            contentFit="contain"
                        />
                    </View>
                    
                    <Text style={[styles.title, { textAlign: 'center', fontSize: 28 }]}>Cosmic Reveal Success!</Text>
                    <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 25, color: Branding.gold }]}>Welcome to Your Destiny, {firstName}</Text>
                    
                    <View style={styles.premiumSuccessCard}>
                        <BlurView intensity={20} tint="dark" style={styles.successBlur}>
                            <View style={styles.successGrid}>
                                <View style={styles.successCell}>
                                    <Text style={styles.successLabelMini}>CELESTIAL RASI</Text>
                                    <Text style={styles.successValueLarge}>{rasi?.split(' / ')[1] || rasi || 'Mesham'}</Text>
                                    <Text style={styles.successEnglishName}>{rasi?.split(' / ')[0]}</Text>
                                </View>
                                <View style={styles.successVerticalDivider} />
                                <View style={styles.successCell}>
                                    <Text style={styles.successLabelMini}>ALIGNMENT</Text>
                                    <Text style={styles.successValueLarge}>{nakshatra?.split(' / ')[1] || nakshatra || 'Aswini'}</Text>
                                    <View style={styles.padamBadge}>
                                        <Text style={styles.padamText}>PADAM {padam || 1}</Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={styles.successHorizontalDivider} />
                            
                            <Text style={styles.successQuote}>"Your soul's blueprint is now etched into the stars of Astromind. Guided by light, driven by destiny."</Text>
                        </BlurView>
                    </View>

                    <TouchableOpacity 
                        style={[styles.primaryBtn, { width: '100%', marginTop: 30, height: 60 }]} 
                        onPress={() => router.replace('/future/(tabs)')}
                    >
                        <Text style={[styles.primaryBtnText, { fontSize: 16 }]}>ENTER YOUR DESTINY</Text>
                        <Ionicons name="sparkles-outline" size={20} color={Branding.black} />
                    </TouchableOpacity>
                    
                    <Text style={[styles.footerText, { marginTop: 20, opacity: 0.5 }]}>Account synced with celestial databases</Text>
                </Animated.View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already part of Astromind? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Go to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="spinner"
          onChange={onDateChange}
          maximumDate={new Date()}
          themeVariant="dark"
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tob}
          mode="time"
          is24Hour={false}
          display="clock"
          onChange={onTimeChange}
          themeVariant="dark"
        />
      )}

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 15,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeDot: {
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
  },
  currentDot: {
    backgroundColor: Branding.gold,
    width: 20,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  genderCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  activeGenderCard: {
    backgroundColor: Branding.gold,
    borderColor: Branding.gold,
  },
  genderCardText: {
    color: Branding.gold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeGenderText: {
    color: Branding.black,
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
    letterSpacing: 0.5,
  },
  formSection: {
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
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
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
  },
  locationWrapper: {
    marginBottom: 10,
  },
  manualSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
  },
  switchText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginLeft: 10,
    flex: 1,
  },
  pickerBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  pickerText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: Branding.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    shadowColor: Branding.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    color: Branding.black,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: 10,
  },
  secondaryBtnText: {
    color: Branding.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRowNav: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  agreementText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginLeft: 12,
    lineHeight: 20,
  },
  registerBtnWrapper: {
    width: '100%',
    shadowColor: Branding.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  registerBtn: {
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: Branding.black,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  loginLink: {
    color: Branding.gold,
    fontSize: 14,
    fontWeight: 'bold',
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
  successCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  successRasiBox: {
    flex: 1,
    alignItems: 'center',
  },
  successLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  successValue: {
    color: Branding.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  successDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  successRevealContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.6,
  },
  successZodiacLarge: {
    width: 160,
    height: 160,
    zIndex: 1,
  },
  premiumSuccessCard: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    marginTop: 10,
  },
  successBlur: {
    padding: 25,
    alignItems: 'center',
  },
  successGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  successCell: {
    flex: 1,
    alignItems: 'center',
  },
  successLabelMini: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  successValueLarge: {
    color: Branding.gold,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  successEnglishName: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
  },
  successVerticalDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  successHorizontalDivider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    marginBottom: 20,
  },
  padamBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  padamText: {
    color: Branding.gold,
    fontSize: 9,
    fontWeight: '900',
  },
  successQuote: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
});
