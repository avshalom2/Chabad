'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

function categoryHref(category) {
  const customUrl = typeof category.custom_url === 'string' ? category.custom_url.trim() : '';
  if (!customUrl) return `/category/${category.slug}`;
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(customUrl)) return customUrl;
  return `/${customUrl}`;
}

export default function Navigation() {
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedParent, setExpandedParent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch parent categories with their sub-categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/navigate');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleMobileParent = (parentId) => {
    setExpandedParent(expandedParent === parentId ? null : parentId);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setExpandedParent(null);
  };

  if (loading) {
    return <nav className={styles.nav}></nav>;
  }

  return (
    <>
      <nav className={styles.nav}>
        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {categories.map((parent) => (
            <div key={parent.id} className={styles.menuItem}>
              <Link href={categoryHref(parent)} className={styles.parentButton}>
                {parent.name}
              </Link>

              {/* Dropdown submenu */}
              {parent.subs && parent.subs.length > 0 && (
                <div className={styles.dropdown}>
                  {parent.subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={categoryHref(sub)}
                      className={styles.subLink}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className={styles.hamburger}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="פתח/סגור תפריט"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile Side Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu}>
          <div
            className={styles.mobileSidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={closeMobileMenu}
              aria-label="סגור תפריט"
            >
              ✕
            </button>

            <div className={styles.mobileMenu}>
              {categories.map((parent) => (
                <div key={parent.id} className={styles.mobileParent}>
                  {parent.subs && parent.subs.length > 0 ? (
                    <button
                      className={styles.mobileParentButton}
                      onClick={() => toggleMobileParent(parent.id)}
                    >
                      {parent.name}
                    </button>
                  ) : (
                    <Link
                      href={categoryHref(parent)}
                      className={styles.mobileParentButton}
                      onClick={closeMobileMenu}
                    >
                      {parent.name}
                    </Link>
                  )}

                  {/* Mobile Submenu */}
                  {expandedParent === parent.id &&
                    parent.subs &&
                    parent.subs.length > 0 && (
                      <div className={styles.mobileSubmenu}>
                        {parent.subs.map((sub) => (
                          <Link
                            key={sub.id}
                            href={categoryHref(sub)}
                            className={styles.mobileSubLink}
                            onClick={closeMobileMenu}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
