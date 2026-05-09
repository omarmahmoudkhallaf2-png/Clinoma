import { db } from './client/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function checkConfig() {
  const generalSnap = await getDoc(doc(db, 'settings', 'general'));
  const configSnap = await getDoc(doc(db, 'settings', 'config'));
  
  console.log('--- settings/general ---');
  console.log(generalSnap.exists() ? generalSnap.data() : 'NOT FOUND');
  
  console.log('--- settings/config ---');
  console.log(configSnap.exists() ? configSnap.data() : 'NOT FOUND');
  
  process.exit(0);
}

checkConfig();
