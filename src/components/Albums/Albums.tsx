import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const API_URL = "http://localhost:3000/albums";
const PHOTOS_API_URL = "http://localhost:3000/photos";

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const Albums = () => {
  const { selectedUser } = useUser();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const [newTitle, setNewTitle] = useState("");
  
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [openAlbumId, setOpenAlbumId] = useState(null);
  const [photosByAlbum, setPhotosByAlbum] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!selectedUser) return;

    const loadAlbums = async () => {
      try {
        const res = await fetch(`${API_URL}?userId=${selectedUser.id}`);
        if (!res.ok) throw new Error("فشل جلب الألبومات");
        const data = await res.json();
        setAlbums(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [selectedUser]);

  // Add Album
  const handleAdd = () => {
    if (newTitle.trim() === "") return;
    setError(null);

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.id,
        title: newTitle.trim(),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل إضافة الألبوم");
        return res.json();
      })
      .then((created) => {
        setAlbums([created, ...albums]);
        setNewTitle("");
      })
      .catch((err) => setError(err.message));
  };

  // Edit Title
  const startEdit = (album) => {
    setEditingId(album.id);
    setEditTitle(album.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleSave = (album) => {
    if (editTitle.trim() === "") return;
    setError(null);

    fetch(`${API_URL}/${album.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل تعديل الألبوم");
        return res.json();
      })
      .then((updated) => {
        setAlbums(albums.map((a) => (a.id === album.id ? updated : a)));
        cancelEdit();
      })
      .catch((err) => setError(err.message));
  };

  // Delete Album
  const handleDelete = (albumId) => {
    if (!window.confirm("هل أنت متأكد من حذف الألبوم وجميع الصور التابعة له؟")) return;
    setError(null);

    fetch(`${API_URL}/${albumId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("فشل حذف الألبوم");
        setAlbums(albums.filter((a) => a.id !== albumId));
        if (openAlbumId === albumId) setOpenAlbumId(null);
        if (editingId === albumId) cancelEdit();
      })
      .catch((err) => setError(err.message));
  };

  // Toggle Photos
  const handleTogglePhotos = async (albumId) => {
    if (openAlbumId === albumId) {
      setOpenAlbumId(null);
      return;
    }

    setOpenAlbumId(albumId);
    if (photosByAlbum[albumId] !== undefined) return;

    try {
      const res = await fetch(`${PHOTOS_API_URL}?albumId=${albumId}`);
      if (!res.ok) throw new Error("فشل جلب الصور");
      const photos = await res.json();
      setPhotosByAlbum((prev) => ({ ...prev, [albumId]: photos }));
    } catch (err) {
      setError(err.message);
      setOpenAlbumId(null);
    }
  };

  // Upload Photo
  const handleUpload = async (e, albumId) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("الملف المختار ليس صورة");
      return;
    }

    try {
      setUploading(true);
      setError(null);


      const base64Image = await convertToBase64(file);

      const res = await fetch(PHOTOS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId,
          title: file.name,
          url: base64Image,
          thumbnailUrl: base64Image,
        }),
      });

      if (!res.ok) throw new Error("فشل رفع الصورة");
      const newPhoto = await res.json();

      setPhotosByAlbum((prev) => ({
        ...prev,
        [albumId]: [newPhoto, ...(prev[albumId] || [])],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete Photo
  const handleDeletePhoto = (albumId, photoId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    setError(null);

    fetch(`${PHOTOS_API_URL}/${photoId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("فشل حذف الصورة");
        setPhotosByAlbum((prev) => ({
          ...prev,
          [albumId]: prev[albumId].filter((p) => p.id !== photoId),
        }));
      })
      .catch((err) => setError(err.message));
  };

  if (!selectedUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-slate-400">لم يتم اختيار مستخدم</p>
        <Link
          to="/"
          className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          اختيار مستخدم
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
        <p className="mt-4 text-sm text-slate-400">جاري تحميل الألبومات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
            Albums
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-white">
            {selectedUser.name}'s albums
          </h1>
          <p className="text-sm text-slate-400">
            Number of albums : {albums.length}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Add */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="عنوان الألبوم الجديد..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="shrink-0 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            إضافة ألبوم
          </button>
        </div>

        {/* Albums List */}
        {albums.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-10">
            لا يوجد ألبومات لهذا المستخدم حالياً
          </p>
        ) : (
          <div className="space-y-4">
            {albums.map((album) => {
              const isEditing = editingId === album.id;
              const isOpen = openAlbumId === album.id;
              const photos = photosByAlbum[album.id];

              return (
                <div
                  key={album.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 shadow-xl"
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-white">
                      {album.title}
                    </h3>
                  )}

                  {/* Options */}
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-800/60 pt-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(album)}
                          className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleTogglePhotos(album.id)}
                          className="rounded-xl bg-sky-600/20 border border-sky-500/30 px-3.5 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-600 hover:text-white transition"
                        >
                          {isOpen ? "إخفاء الصور" : "عرض الصور"}
                        </button>
                        <button
                          onClick={() => startEdit(album)}
                          className="rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(album.id)}
                          className="rounded-xl bg-red-600/20 border border-red-500/30 px-3.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-600 hover:text-white transition"
                        >
                          حذف مع الصور
                        </button>
                      </>
                    )}
                  </div>

                  {/* Photos Section */}
                  {isOpen && (
                    <div className="mt-4 border-t border-slate-800/60 pt-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          {photos === undefined
                            ? "جاري تحميل الصور..."
                            : `عدد الصور: ${photos.length}`}
                        </p>
                        <label
                          className={`cursor-pointer rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition ${
                            uploading ? "pointer-events-none opacity-50" : ""
                          }`}
                        >
                          {uploading ? "جاري الرفع..." : "إضافة صورة"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUpload(e, album.id)}
                          />
                        </label>
                      </div>

                      {photos !== undefined && photos.length === 0 && (
                        <p className="text-center text-sm text-slate-500 py-4">
                          لا يوجد صور بهذا الألبوم
                        </p>
                      )}

                      {photos !== undefined && photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                          {photos.map((photo) => (
                            <div key={photo.id} className="group relative">
                              <img
                                src={photo.thumbnailUrl}
                                alt={photo.title}
                                title={photo.title}
                                loading="lazy"
                                className="h-24 w-full rounded-xl border border-slate-800 object-cover"
                              />
                              <button
                                onClick={() => handleDeletePhoto(album.id, photo.id)}
                                title="حذف الصورة"
                                className="absolute left-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-500 group-hover:flex shadow"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Albums;