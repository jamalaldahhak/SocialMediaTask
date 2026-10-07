const BASE_URL = 'http://localhost:3000';
export const getUserPosts = async (userId) => {
  const res = await fetch(`${BASE_URL}/posts?userId=${userId}`);
  if (!res.ok) throw new Error('فشل جلب منشورات المستخدم');
  return res.json();
};

export const createPost = async (postData) => {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!res.ok) throw new Error('فشل إنشاء المنشور');
  return res.json();
};

export const updatePost = async (postId, updatedData) => {
  const res = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error('فشل تعديل المنشور');
  return res.json();
};

export const deletePostWithComments = async (postId) => {
  const commentsRes = await fetch(`${BASE_URL}/comments?postId=${postId}`);
  if (commentsRes.ok) {
    const comments = await commentsRes.json();
    await Promise.all(
      comments.map((comment) =>
        fetch(`${BASE_URL}/comments/${comment.id}`, { method: 'DELETE' })
      )
    );
  }

  const res = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('فشل حذف المنشور');
  return true;
};

export const getUserAlbums = async (userId) => {
  const res = await fetch(`${BASE_URL}/albums?userId=${userId}`);
  if (!res.ok) throw new Error('فشل جلب الألبومات');
  return res.json();
};

export const createAlbum = async (postData) => {
  const res = await fetch(`${BASE_URL}/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!res.ok) throw new Error('فشل إنشاء الألبوم');
  return res.json();
};

export const updateAlbum = async (albumId, updatedData) => {
  const res = await fetch(`${BASE_URL}/albums/${albumId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error('فشل تعديل الألبوم');
  return res.json();
};

export const deleteAlbumWithPhotos = async (albumId) => {
  const photosRes = await fetch(`${BASE_URL}/photos?albumId=${albumId}`);
  if (photosRes.ok) {
    const photos = await photosRes.json();
    await Promise.all(
      photos.map((photo) =>
        fetch(`${BASE_URL}/photos/${photo.id}`, { method: 'DELETE' })
      )
    );
  }

  const res = await fetch(`${BASE_URL}/albums/${albumId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('فشل حذف الألبوم');
  return true;
};