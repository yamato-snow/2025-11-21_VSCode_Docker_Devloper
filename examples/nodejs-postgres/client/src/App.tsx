import { useState, useEffect } from 'react';
import Login from './components/Login';
import UserList from './components/UserList';
import ItemList from './components/ItemList';
import { isAuthenticated, logout, getCurrentUser, User } from './api';

type Tab = 'users' | 'items';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (isAuthenticated()) {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setAuthenticated(true);
      } catch {
        // トークンが無効な場合
        setAuthenticated(false);
        setCurrentUser(null);
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = async () => {
    await checkAuth();
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Node.js + React + JWT
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                JWT認証付きフルスタックアプリケーション
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              👤 ユーザー管理
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === 'items'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              📦 アイテム管理
            </button>
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && <UserList />}
        {activeTab === 'items' && <ItemList />}
      </main>

      {/* フッター */}
      <footer className="mt-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by Node.js, Express, PostgreSQL, Redis, React, Vite, and JWT
          </p>
        </div>
      </footer>
    </div>
  );
}
