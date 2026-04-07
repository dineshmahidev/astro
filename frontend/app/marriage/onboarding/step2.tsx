import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export const options = { headerShown: false };

export default function Step2() {
  const router = useRouter();
  const [dob, setDob] = useState<Date | null>(null);
  const [tob, setTob] = useState<Date | null>(null);
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [place, setPlace] = useState('');

  const onNext = () => router.replace('/marriage/(tabs)');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />

      <LinearGradient colors={['#1d0608', '#0d0304']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <Text style={styles.headerSubtitle}>Please provide your birth information</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.label}>Select Gender</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[styles.genderBtn, gender === 'M' && styles.genderActive]}
            onPress={() => setGender('M')}
          >
            <Ionicons name="male" size={20} color={gender === 'M' ? '#000' : '#FFD56F'} />
            <Text style={[styles.genderTxt, gender === 'M' && { color: '#000' }]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderBtn, gender === 'F' && styles.genderActive]}
            onPress={() => setGender('F')}
          >
            <Ionicons name="female" size={20} color={gender === 'F' ? '#000' : '#FFD56F'} />
            <Text style={[styles.genderTxt, gender === 'F' && { color: '#000' }]}>Female</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => DateTimePickerAndroid.open({
            value: dob || new Date(),
            mode: 'date',
            onChange: (e, d) => d && setDob(d)
          })}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFD56F" />
          <Text style={[styles.inputText, { color: dob ? '#FFF' : '#777' }]}>
            {dob ? dob.toDateString() : 'Select your birth date'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Time of Birth</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => DateTimePickerAndroid.open({
            value: tob || new Date(),
            mode: 'time',
            is24Hour: false,
            onChange: (e, d) => d && setTob(d)
          })}
        >
          <Ionicons name="time-outline" size={18} color="#FFD56F" />
          <Text style={[styles.inputText, { color: tob ? '#FFF' : '#777' }]}>
            {tob ? tob.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select your birth time'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Birth Place</Text>
        <View style={styles.input}>
          <Ionicons name="location-outline" size={18} color="#FFD56F" />
          <TextInput
            style={styles.textInput}
            placeholder="City or Town"
            placeholderTextColor="#777"
            value={place}
            onChangeText={setPlace}
          />
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
          <LinearGradient colors={['#FFD56F', '#FF9D2B']} style={styles.btnGradient}>
            <Text style={styles.nextTxt}>Complete Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0d0304' },
  header: { padding: 40, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { marginBottom: 20 },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#FFD56F', fontSize: 14, marginTop: 4 },
  form: { padding: 24 },
  label: { color: '#AAA', fontSize: 12, marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 1 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFD56F', borderRadius: 12, height: 48, gap: 8 },
  genderActive: { backgroundColor: '#FFD56F' },
  genderTxt: { color: '#FFD56F', fontWeight: 'bold' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 16, height: 56, flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputText: { fontSize: 15 },
  textInput: { flex: 1, color: '#FFF', fontSize: 15 },
  nextBtn: { height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 40 },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  nextTxt: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});
