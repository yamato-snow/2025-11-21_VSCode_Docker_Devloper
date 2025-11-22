import { useState, useEffect } from 'react';
import { getCurrentUser, User } from '../api';

export default function UserList() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-gray-500">
        ユーザー情報が見つかりません
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">ユーザー情報</h2>

      {/* 現在のユーザー情報カード */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900">{currentUser.username}</h3>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">ユーザーID</p>
            <p className="text-lg font-semibold text-gray-900">{currentUser.id}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">ステータス</p>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                currentUser.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {currentUser.is_active ? 'アクティブ' : '無効'}
            </span>
          </div>
        </div>
      </div>

      {/* 認証情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">認証情報</h4>
        <p className="text-sm text-blue-800">
          JWT トークンを使用して認証されています。トークンは localStorage に保存され、
          API リクエストごとに自動的に送信されます。
        </p>
      </div>

      {/* API エンドポイント情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">利用可能な API エンドポイント</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs mr-2">GET</span>
            <code className="text-gray-700">/users/me</code>
            <span className="ml-2 text-gray-500">- 現在のユーザー情報取得</span>
          </div>
          <div className="flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs mr-2">POST</span>
            <code className="text-gray-700">/users</code>
            <span className="ml-2 text-gray-500">- ユーザー登録</span>
          </div>
          <div className="flex items-center">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-xs mr-2">GET</span>
            <code className="text-gray-700">/items</code>
            <span className="ml-2 text-gray-500">- アイテム一覧取得 (認証必須)</span>
          </div>
          <div className="flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs mr-2">POST</span>
            <code className="text-gray-700">/items</code>
            <span className="ml-2 text-gray-500">- アイテム作成 (認証必須)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
