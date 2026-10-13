import { storage } from '../firebase/Constant'

// Uploads a file to Firebase Storage and returns its public download URL.
// Firebase v8 (compat) API, matching the website's existing firebase init in
// src/firebase/Constant.js. Mirrors the tool's uploader: same research-files/
// subfolder and timestamped, sanitised filename.
export const uploadFile = async (file) => {
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const fileRef = storage.ref(`research-files/${safeName}`)
  await fileRef.put(file)
  return await fileRef.getDownloadURL()
}
