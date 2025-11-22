"""
Flask サンプルアプリケーション
PostgreSQL + SQLAlchemyを使用したシンプルなバックエンドAPI

動作確認:
- Health Check: http://localhost:5000/health
- API Documentation: http://localhost:5000/
"""

from datetime import datetime, timedelta
import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv

# 環境変数読み込み
load_dotenv()

# Flaskアプリケーション初期化
app = Flask(__name__)

# 設定
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://postgres:postgres@db:5432/flask_app'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key_change_in_production')

# 拡張機能初期化
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app)

# ==========================================
# データベースモデル
# ==========================================

class User(db.Model):
    """ユーザーモデル"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # リレーション
    items = db.relationship('Item', backref='owner', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }


class Item(db.Model):
    """アイテムモデル"""
    __tablename__ = 'items'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """辞書形式に変換"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat()
        }


# ==========================================
# エンドポイント
# ==========================================

@app.route('/')
def index():
    """ルートエンドポイント"""
    return jsonify({
        'message': 'Welcome to Flask Backend API',
        'framework': 'Flask',
        'environment': os.getenv('FLASK_ENV', 'production'),
        'endpoints': {
            'health': '/health',
            'users': '/api/users',
            'items': '/api/items',
            'database_test': '/api/db-test'
        }
    })


@app.route('/health')
def health():
    """ヘルスチェックエンドポイント"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/api/db-test')
def db_test():
    """データベース接続テスト"""
    try:
        # データベース接続確認
        result = db.session.execute(db.text('SELECT version(), NOW() as current_time'))
        row = result.fetchone()

        return jsonify({
            'status': 'success',
            'message': 'PostgreSQL connection successful',
            'data': {
                'version': row[0],
                'current_time': row[1].isoformat()
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to connect to PostgreSQL',
            'error': str(e)
        }), 500


@app.route('/api/users', methods=['GET', 'POST'])
def users():
    """ユーザーエンドポイント"""
    if request.method == 'GET':
        # ユーザー一覧取得
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        users_query = User.query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'users': [user.to_dict() for user in users_query.items],
            'total': users_query.total,
            'page': page,
            'per_page': per_page
        })

    elif request.method == 'POST':
        # ユーザー作成
        data = request.get_json()

        # バリデーション
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email, and password are required'}), 400

        # 重複チェック
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400

        # パスワードハッシュ化
        password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        # ユーザー作成
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=password_hash
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict()
        }), 201


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """ユーザー詳細取得"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@app.route('/api/items', methods=['GET', 'POST'])
def items():
    """アイテムエンドポイント"""
    if request.method == 'GET':
        # アイテム一覧取得
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        items_query = Item.query.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'items': [item.to_dict() for item in items_query.items],
            'total': items_query.total,
            'page': page,
            'per_page': per_page
        })

    elif request.method == 'POST':
        # アイテム作成
        data = request.get_json()

        # バリデーション
        if not data or not data.get('title') or not data.get('price') or not data.get('owner_id'):
            return jsonify({'error': 'Title, price, and owner_id are required'}), 400

        # ユーザー存在確認
        user = User.query.get(data['owner_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # アイテム作成
        new_item = Item(
            title=data['title'],
            description=data.get('description'),
            price=data['price'],
            owner_id=data['owner_id']
        )

        db.session.add(new_item)
        db.session.commit()

        return jsonify({
            'message': 'Item created successfully',
            'item': new_item.to_dict()
        }), 201


@app.route('/api/items/<int:item_id>', methods=['GET', 'PUT', 'DELETE'])
def item_detail(item_id):
    """アイテム詳細エンドポイント"""
    item = Item.query.get_or_404(item_id)

    if request.method == 'GET':
        # アイテム詳細取得
        return jsonify(item.to_dict())

    elif request.method == 'PUT':
        # アイテム更新
        data = request.get_json()

        if 'title' in data:
            item.title = data['title']
        if 'description' in data:
            item.description = data['description']
        if 'price' in data:
            item.price = data['price']

        db.session.commit()

        return jsonify({
            'message': 'Item updated successfully',
            'item': item.to_dict()
        })

    elif request.method == 'DELETE':
        # アイテム削除
        db.session.delete(item)
        db.session.commit()

        return jsonify({
            'message': 'Item deleted successfully'
        })


@app.route('/api/users/<int:user_id>/items', methods=['GET'])
def user_items(user_id):
    """ユーザーのアイテム一覧取得"""
    user = User.query.get_or_404(user_id)

    return jsonify({
        'user': user.to_dict(),
        'items': [item.to_dict() for item in user.items]
    })


# ==========================================
# エラーハンドラー
# ==========================================

@app.errorhandler(404)
def not_found(error):
    """404エラーハンドラー"""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """500エラーハンドラー"""
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


# ==========================================
# 起動時の情報表示
# ==========================================

@app.before_request
def before_first_request():
    """最初のリクエスト前に実行"""
    if not hasattr(app, '_startup_message_displayed'):
        print("=" * 60)
        print("Flask Backend API が起動しました！")
        print("=" * 60)
        print(f"Health Check: http://localhost:5000/health")
        print(f"API Endpoints: http://localhost:5000/")
        print("-" * 60)
        print("データベース初期化:")
        print("  python init_db.py を実行してください")
        print("")
        print("デフォルトユーザー (init_db.py実行後):")
        print("  username: testuser")
        print("  password: password123")
        print("=" * 60)
        app._startup_message_displayed = True


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
