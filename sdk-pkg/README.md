# ZeroBase SDK (JS/TS)

The official JavaScript & TypeScript SDK for **ZeroBase** — The lightweight, self-hosted Supabase alternative.

Built with performance and simplicity in mind, it provides a unified interface for Database CRUD, Better-Auth integration, and S3/Minio Storage management.

## 🚀 Installation

```bash
npm install zerobase-sdk-js
```

## 🛠️ Quick Start

Initialize the client with your Project URL and Service Role Key (found in your ZeroBase Dashboard > Settings).

```javascript
import { createClient } from 'zerobase-sdk-js';

const zb = createClient('https://your-zerobase-url.com', 'your-service-role-key');

// You're ready to go!
```

---

## 🔐 Authentication (Better-Auth)

ZeroBase uses [Better-Auth](https://better-auth.com) under the hood for professional identity management.

### Google Sign-In
```javascript
// Triggers the Google OAuth flow
await zb.auth.signInWithGoogle();
```

### Get Current User
```javascript
const { data: session, error } = await zb.auth.getUser();
if (session) {
  console.log('Logged in as:', session.user.email);
}
```

### Sign Out
```javascript
await zb.auth.signOut();
```

---

## 📊 Database (CRUD)

Interact with your PostgreSQL tables using an intuitive, fluent API.

### Select Data
```javascript
const { data, error } = await zb.from('profiles').select('*');
```

### Insert Records
```javascript
const { data, error } = await zb.from('posts').insert({
  title: 'Hello ZeroBase!',
  content: 'The lightweight Supabase choice.'
});
```

### Update Records
```javascript
const { data, error } = await zb.from('posts').update(123, {
  status: 'published'
});
```

### Delete Records
```javascript
const { error } = await zb.from('posts').delete(123);
```

---

## 📁 Storage (Minio/S3)

Management of files and buckets with automatic S3 compliance.

### Upload a File
```javascript
const { data, error } = await zb.storage.from('avatars').upload('profile.png', file);
```

### Get Public URL
```javascript
const { publicUrl } = zb.storage.from('avatars').getPublicUrl('profile.png');
```

---

## 📜 Legal / License
ZeroBase is open-source. See our main repository for licensing information.
