// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('User registered:', userCredential.user);
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Error registering:', error);
            });
    });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('User logged in:', userCredential.user);
                window.location.href = 'profile.html';
            })
            .catch(error => {
                console.error('Error logging in:', error);
            });
    });
}

// Profile
const userEmail = document.getElementById('userEmail');
const documentList = document.getElementById('documentList');
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const logoutButton = document.getElementById('logout');

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
}

auth.onAuthStateChanged(user => {
    if (user) {
        if (userEmail) {
            userEmail.textContent = user.email;
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const file = fileInput.files[0];
                if (file) {
                    const storageRef = storage.ref(`documents/${user.uid}/${file.name}`);
                    storageRef.put(file).then(snapshot => {
                        snapshot.ref.getDownloadURL().then(url => {
                            db.collection('documents').add({
                                uid: user.uid,
                                name: file.name,
                                url: url,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp()
                            }).then(docRef => {
                                console.log('Document uploaded:', docRef.id);
                                loadDocuments(user.uid);
                            });
                        });
                    });
                }
            });
        }

        const loadDocuments = (uid) => {
            documentList.innerHTML = '';
            db.collection('documents').where('uid', '==', uid).get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const li = document.createElement('li');
                    li.textContent = doc.data().name;
                    documentList.appendChild(li);
                });
            });
        };

        if (documentList) {
            loadDocuments(user.uid);
        }
    }
});