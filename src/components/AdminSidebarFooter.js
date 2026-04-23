'use client';
import { useRouter } from 'next/navigation';

const styles = {
  sidebarFooter: 'padding: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.1);',
  userInfo: 'margin: 0 0 1rem 0; font-size: 0.85rem; color: #bdc3c7; word-break: break-all;',
  logoutBtn: 'width: 100%; padding: 0.75rem; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background-color 0.2s;',
};

export default function AdminSidebarFooter({ userEmail }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        // Use window.location.href for a hard refresh to ensure cookie is cleared
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#bdc3c7', wordBreak: 'break-all' }}>
        {userEmail || 'Admin'}
      </p>
      <button 
        onClick={handleLogout} 
        style={{ 
          width: '100%', 
          padding: '0.75rem', 
          backgroundColor: '#e74c3c', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px', 
          cursor: 'pointer', 
          fontWeight: '600' 
        }}
      >
        יציאה
      </button>
    </div>
  );
}
