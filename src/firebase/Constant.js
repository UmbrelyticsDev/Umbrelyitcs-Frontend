// // Import the Firebase core module
// import firebase from "firebase/app";
// // Import the Firebase Storage module
// import "firebase/storage";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBYe7BZkyJ9DDn3yREoJDeLYjnnqPDDbfI",
//   authDomain: "umbrelytics2024.firebaseapp.com",
//   projectId: "umbrelytics2024",
//   storageBucket: "umbrelytics2024.appspot.com",
//   messagingSenderId: "1122581504",
//   appId: "1:1122581504:web:e042683f3132dfb5e0ace5",
//   measurementId: "G-F5EBCH3S7P"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// // Get a reference to the storage service, which is used to create references in your storage bucket
// export const storage = firebase.storage();










import firebase from 'firebase/app';
import 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYe7BZkyJ9DDn3yREoJDeLYjnnqPDDbfI",
  authDomain: "umbrelytics2024.firebaseapp.com",
  projectId: "umbrelytics2024",
  storageBucket: "umbrelytics2024.appspot.com",
  messagingSenderId: "1122581504",
  appId: "1:1122581504:web:e042683f3132dfb5e0ace5",
  measurementId: "G-F5EBCH3S7P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the storage service
export const storage = firebase.storage();

export const uploadImgToFirebase = (file) => {
  // Create a storage reference
  const storageRef = storage.ref(`images/${file.name}`);

  // Upload the file
  const uploadTask = storageRef.put(file);

  // Monitor upload progress
  uploadTask.on(
    'state_changed',
    (snapshot) => {
      // Observe state change events such as progress, pause, and resume
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    },
    (error) => {
      // Handle unsuccessful uploads
      console.error('Upload failed:', error);
    },
    () => {
      // Handle successful uploads on complete
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
      });
    }
  );
};
