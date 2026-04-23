import { getCurrentUserSession } from '@/lib/auth-session.js';
import styles from './dashboard.module.css';

export default async function AdminDashboard() {
  const user = await getCurrentUserSession();

  return (
    <div className={styles.dashboard}>
      <h1>Welcome, {user?.display_name || user?.username || 'Admin'}!</h1>
      <p className={styles.subtitle}>
        This is your admin dashboard. Use the sidebar to manage your content.
      </p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>📝 Articles</h3>
          <p>Create and manage articles for your website</p>
          <a href="/admin/articles" className={styles.cardLink}>
            Go to Articles →
          </a>
        </div>

        <div className={styles.card}>
          <h3>📦 Products</h3>
          <p>Manage your product catalog</p>
          <a href="/admin/products" className={styles.cardLink}>
            Go to Products →
          </a>
        </div>

        <div className={styles.card}>
          <h3>📂 Categories</h3>
          <p>Organize your content with categories</p>
          <a href="/admin/categories" className={styles.cardLink}>
            Go to Categories →
          </a>
        </div>

        <div className={styles.card}>
          <h3>👥 Users</h3>
          <p>Manage admin users and permissions</p>
          <a href="/admin/users" className={styles.cardLink}>
            Go to Users →
          </a>
        </div>
      </div>

      {user && (
        <div className={styles.info}>
          <h2>Quick Info</h2>
          <p>Your access level: <strong>{user.access_level}</strong></p>
          <p>Permissions:</p>
          <ul>
            <li>{user.can_create ? '✓' : '✗'} Create content</li>
            <li>{user.can_update ? '✓' : '✗'} Update content</li>
            <li>{user.can_delete ? '✓' : '✗'} Delete content</li>
            <li>{user.can_publish ? '✓' : '✗'} Publish content</li>
          </ul>
        </div>
      )}
    </div>
  );
}
