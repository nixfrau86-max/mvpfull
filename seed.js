import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATmOE3778FcN0mMGYVo-ReQYXlKtW6Yak",
  authDomain: "the-collective-savers-full-mvp.firebaseapp.com",
  projectId: "the-collective-savers-full-mvp",
  storageBucket: "the-collective-savers-full-mvp.firebasestorage.app",
  messagingSenderId: "63446592652",
  appId: "1:63446592652:web:9dfeec6d0be28ed9b95fa9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = async () => {
  console.log("Starting seed...");

  const demoSupplierId = "demo-supplier-123";
  
  // 1. Create a Supplier
  await setDoc(doc(db, "suppliers", demoSupplierId), {
    supplierId: demoSupplierId,
    companyName: "Premium Auto & Tech Distributors©",
    email: "supply@premiumdistro.com",
    stripeConnectAccountId: "acct_demo_123",
    performanceBondPaid: true,
    createdAt: new Date().toISOString()
  });

  // 2. Create Product Templates
  const products = [
    {
      name: "Michelin Pilot Sport 5 (Set of 4)",
      description: "Ultimate high-performance summer tyre for precision handling and longevity.",
      price: 420,
      minThreshold: 10,
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
      sku: "TYR-MIC-PS5-001"
    },
    {
      name: "Apple MacBook Pro 14 (M3 Max)",
      description: "The most advanced chips ever built for a personal computer. 36GB Unified Memory.",
      price: 2850,
      minThreshold: 5,
      imageUrl: "https://images.unsplash.com/photo-1517336714481-48c25514c352?auto=format&fit=crop&q=80&w=800",
      sku: "LAP-APL-MBP-14-M3"
    },
    {
      name: "Sony WH-1000XM5 Headphones",
      description: "Industry-leading noise cancellation and premium sound quality.",
      price: 245,
      minThreshold: 20,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      sku: "AUD-SNY-XM5-BLK"
    }
  ];

  for (const p of products) {
    const docRef = await addDoc(collection(db, "products"), {
      ...p,
      supplierId: demoSupplierId,
      supplierName: "Premium Auto & Tech Distributors©",
      isAvailable: true,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, "products", docRef.id), { productId: docRef.id }, { merge: true });
    console.log(`Seeded Product: ${p.name}`);
  }

  // 3. Create Active Waves
  const waves = [
    {
      productName: "Michelin Pilot Sport 5 (Set of 4)",
      description: "Join our exclusive collective buy for the best performance tyres on the market.",
      basePrice: 420,
      threshold: 10,
      currentParticipants: 7,
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
      sku: "TYR-MIC-PS5-001"
    },
    {
      productName: "Sony WH-1000XM5 Headphones",
      description: "Unlock the bulk discount for the world's best noise-cancelling headphones.",
      basePrice: 245,
      threshold: 20,
      currentParticipants: 15,
      status: "active",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      sku: "AUD-SNY-XM5-BLK"
    }
  ];

  for (const w of waves) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);

    const docRef = await addDoc(collection(db, "waves"), {
      ...w,
      supplierId: demoSupplierId,
      deadline: deadline.toISOString(),
      createdAt: new Date().toISOString(),
      discountTiers: []
    });
    await setDoc(doc(db, "waves", docRef.id), { waveId: docRef.id }, { merge: true });
    console.log(`Seeded Wave: ${w.productName}`);
  }

  console.log("Seed complete!");
  process.exit(0);
};

seedData();
