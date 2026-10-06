import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Nav from './components/Navbar/Nav';
import Users from './components/Users/Users';

// Layout يضم الـ Nav لجميع صفحات الإدارة
const MainLayout = () => {
  return (
    <div>
      <Nav />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* صفحة اختيار المستخدم */}
      <Route path="/" element={<Users />} />

      {/* صفحات الإدارة الخاصة بالمستخدم المختار من الـ Context */}
      <Route element={<MainLayout />}>
        <Route path="/my-posts" element={<div>صفحة My Posts</div>} />
        <Route path="/posts" element={<div>صفحة Posts</div>} />
        <Route path="/albums" element={<div>صفحة Albums</div>} />
        <Route path="/todos" element={<div>صفحة ToDo</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;