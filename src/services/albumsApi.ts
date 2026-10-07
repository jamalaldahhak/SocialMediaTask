const API_URL = 'http://localhost:3000';

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('فشل الاتصال بالسيرفر');
  return res.json();
};

const jsonOptions = (method, data) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const getUserAlbums = (userId) =>
  request(`${API_URL}/albums?userId=${userId}`);

export const createAlbum = (album) =>
  request(`${API_URL}/albums`, jsonOptions('POST', album));

export const updateAlbum = (albumId, data) =>
  request(`${API_URL}/albums/${albumId}`, jsonOptions('PATCH', data));



export const getAlbumPhotos = (albumId) =>
  request(`${API_URL}/photos?albumId=${albumId}`);

export const addPhoto = (photo) =>
  request(`${API_URL}/photos`, jsonOptions('POST', photo));

export const deletePhoto = (photoId) =>
  request(`${API_URL}/photos/${photoId}`, { method: 'DELETE' });


export const deleteAlbumWithPhotos = async (albumId) => {
  const photos = await getAlbumPhotos(albumId);


  await Promise.all(
    photos.map((photo) =>
      request(`${API_URL}/photos/${photo.id}`, { method: 'DELETE' })
    )
  );


  await request(`${API_URL}/albums/${albumId}`, { method: 'DELETE' });
};
