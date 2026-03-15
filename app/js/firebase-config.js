// ================================================
// firebase-config.js — Firebase 초기화 및 보안 설정
// ================================================
// ⚠️ 이 파일의 apiKey 등은 클라이언트 공개 키입니다.
//    실제 보안은 Firebase 콘솔의 Firestore 보안 규칙과
//    Authentication 설정으로 이루어집니다.
//
// 🔒 Firestore 보안 규칙 (Firebase 콘솔 → Firestore → 규칙):
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /users/{userId}/{document=**} {
//          allow read, write: if request.auth != null
//                             && request.auth.uid == userId;
//        }
//      }
//    }
//
// ================================================

const firebaseConfig = {
  apiKey: "AIzaSyBs3GlTM9BgQXVdQ0mfJ0WI3QkDcr0yhe0",
  authDomain: "my-todo-95113.firebaseapp.com",
  projectId: "my-todo-95113",
  storageBucket: "my-todo-95113.firebasestorage.app",
  messagingSenderId: "883354806225",
  appId: "1:883354806225:web:330bcd7bd46ad16a8e62f0"
};

firebase.initializeApp(firebaseConfig);

// const appCheck = firebase.appCheck();
// appCheck.activate(
//   new firebase.appCheck.ReCaptchaV3Provider('6Ldo-IosAAAAAGvWG6Ztu2q_Jf40-m3rTojGPKHm'),
//   true
// );

// 전역 인스턴스 — auth.js, app.js에서 사용
const auth = firebase.auth();
const db = firebase.firestore();
