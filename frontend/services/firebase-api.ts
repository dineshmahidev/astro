import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile as updateFirebaseProfile,
    GoogleAuthProvider,
    signInWithCredential
} from "firebase/auth";
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    query, 
    where, 
    getDocs,
    serverTimestamp,
    increment
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const firebaseAuthApi = {
    login: async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },
    googleLogin: async (idToken: string) => {
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
    },

    register: async (data: any) => {
        const { email, password, name } = data;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Initialize user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            wallet_balance: 0,
            created_at: serverTimestamp(),
            ...data // birth details etc
        });

        await updateFirebaseProfile(user, { displayName: name });
        return user;
    },

    getMe: async () => {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        return userDoc.exists() ? userDoc.data() : null;
    },

    updateProfile: async (data: any) => {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        await updateDoc(doc(db, "users", user.uid), data);
        return true;
    }
};

export const firebaseWalletApi = {
    getBalance: async () => {
        const user = auth.currentUser;
        if (!user) return 0;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        return userDoc.data()?.wallet_balance || 0;
    },

    topup: async (amount: number, method: string = "Razorpay") => {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");

        // 1. Update balance
        await updateDoc(doc(db, "users", user.uid), {
            wallet_balance: increment(amount)
        });

        // 2. Log transaction
        await setDoc(doc(collection(db, "transactions")), {
            user_id: user.uid,
            amount: amount,
            type: 'credit',
            method: method,
            status: 'success',
            created_at: serverTimestamp()
        });

        return { status: 'success' };
    },

    addReward: async () => {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        await updateDoc(doc(db, "users", user.uid), {
            reward_balance: increment(2)
        });
        const userDoc = await getDoc(doc(db, "users", user.uid));
        return { status: 'success', reward_balance: userDoc.data()?.reward_balance };
    },

    redeem: async () => {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const reward = userDoc.data()?.reward_balance || 0;
        if (reward < 10) throw new Error("Insufficient reward balance");
        
        await updateDoc(doc(db, "users", user.uid), {
            wallet_balance: increment(10),
            reward_balance: 0
        });

        // Log transaction
        await setDoc(doc(collection(db, "transactions")), {
            user_id: user.uid,
            amount: 10,
            type: 'credit',
            method: 'Reward Redemption',
            status: 'success',
            created_at: serverTimestamp()
        });

        const updatedDoc = await getDoc(doc(db, "users", user.uid));
        return { status: 'success', new_balance: updatedDoc.data()?.wallet_balance };
    },

    debit: async (amount: number) => {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const balance = userDoc.data()?.wallet_balance || 0;
        
        if (balance < amount) {
            const error = new Error("Insufficient balance");
            (error as any).response = { status: 402 };
            throw error;
        }

        await updateDoc(doc(db, "users", user.uid), {
            wallet_balance: increment(-amount)
        });

        // Log transaction
        await setDoc(doc(collection(db, "transactions")), {
            user_id: user.uid,
            amount: -amount,
            type: 'debit',
            method: 'AI Chat Session',
            status: 'success',
            created_at: serverTimestamp()
        });

        return { status: 'success' };
    },

    getHistory: async () => {
        const user = auth.currentUser;
        if (!user) return [];
        const q = query(collection(db, "transactions"), where("user_id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

export const firebaseNotificationApi = {
    getAll: async () => {
        const user = auth.currentUser;
        if (!user) return [];
        const q = query(collection(db, "notifications"), where("user_id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    markAsRead: async (id: string) => {
        await updateDoc(doc(db, "notifications", id), { is_read: true });
    },
    markAllAsRead: async () => {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(collection(db, "notifications"), where("user_id", "==", user.uid), where("is_read", "==", false));
        const querySnapshot = await getDocs(q);
        const batch: any[] = [];
        querySnapshot.forEach((d) => {
            batch.push(updateDoc(d.ref, { is_read: true }));
        });
        await Promise.all(batch);
    }
};

export const firebasePalmApi = {
    saveReading: async (data: any) => {
        const user = auth.currentUser;
        if (!user) return;
        await setDoc(doc(collection(db, "palmReadings")), {
            user_id: user.uid,
            ...data,
            created_at: serverTimestamp()
        });
    }
};

export const firebaseAiApi = {
    chat: async (message: string) => {
        // Mocking AI response for now to ensure front-end works without Laravel
        // In production, this would call a Cloud Function that talks to Gemini
        return {
            status: 'success',
            response: "வானத்தில் நட்சத்திரங்கள் உங்கள் பாதையை காட்டுகின்றன. (The stars are showing your path. This is a divine preview mode.)"
        };
    }
};

// Placeholder for logic that was on Laravel side
export const firebaseHoroscopeApi = {
    calculate: async (data: any) => {
        // Ideally this would be a Cloud Function, but for now we can mock it
        // Or integrate a JS astrological library here.
        console.log("Processing Horoscope via Firebase/Client...");
        return { status: 'success', chart: {} };
    }
};
