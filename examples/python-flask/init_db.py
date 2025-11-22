#!/usr/bin/env python3
"""
データベース初期化スクリプト

使い方:
    python init_db.py
"""
from app import app, db, User, bcrypt


def init_database():
    """データベースとテーブルを初期化"""
    with app.app_context():
        print("=" * 60)
        print("データベース初期化を開始...")
        print("=" * 60)

        # テーブル作成
        print("テーブルを作成中...")
        db.drop_all()  # 既存テーブル削除（開発環境のみ）
        db.create_all()
        print("✅ テーブル作成完了")

        print("\n初期データを投入中...")

        # テストユーザーの作成
        existing_user = User.query.filter_by(username='testuser').first()
        if not existing_user:
            password_hash = bcrypt.generate_password_hash('password123').decode('utf-8')
            test_user = User(
                username='testuser',
                email='test@example.com',
                password_hash=password_hash,
                is_active=True
            )
            db.session.add(test_user)
            db.session.commit()
            print(f"✅ テストユーザー作成: {test_user.username} (ID: {test_user.id})")
        else:
            print(f"ℹ️  テストユーザー既存: {existing_user.username}")

        print("\n" + "=" * 60)
        print("データベース初期化完了！")
        print("=" * 60)
        print("\nデフォルトユーザー:")
        print("  username: testuser")
        print("  password: password123")
        print("\nAPIテスト:")
        print("  curl http://localhost:5000/health")
        print("  curl http://localhost:5000/api/users")
        print("=" * 60)


if __name__ == '__main__':
    init_database()
