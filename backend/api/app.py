from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import AuthenticationError
import os
from dotenv import load_dotenv


from backend.services.bookmark_service import BookmarkService
from backend.services.collection_service import CollectionService
from backend.services.favorite_service import FavoriteService
from backend.services.tag_service import TagService
from backend.infra.db import db

load_dotenv()
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['OPENAI_API_KEY'] = os.environ.get('API_KEY')

# Allow common dev origins so data loads when using different ports or network URL
CORS(
    app,
    origins=[
        "http://localhost:3000",
        "https://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    supports_credentials=True,
)

db.init_app(app)

bookmark_service = BookmarkService()
collection_service = CollectionService()
tag_service = TagService()
favorite_service = FavoriteService()

with app.app_context():
    db.create_all()
@app.route('/tags', methods=['GET'])
def get_tags():
    tags = tag_service.get_all()
    return jsonify([tag.to_dict() for tag in tags])
@app.route('/create-tags', methods=['POST'])
def create_tags():
    data = request.json
    tag = tag_service.create(data['name'], data.get('color'))
    return jsonify(tag.to_dict()), 201

@app.route('/tags/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    tag = tag_service.get_by_id(tag_id)
    if tag:
        return jsonify(tag.to_dict())
    return jsonify({'error': 'Tag not found'}), 404

@app.route('/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    if tag_service.delete(tag_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Tag not found'}), 404

@app.route('/collections', methods=['GET'])
def get_collections():
    collections = collection_service.get_all()
    return jsonify([col.to_dict() for col in collections])

@app.route('/collections/<int:collection_id>', methods=['GET'])
def get_collection(collection_id):
    col = collection_service.get_by_id(collection_id)
    if col:
        return jsonify(col.to_dict())
    return jsonify({'error': 'Collection not found'}), 404

@app.route('/create-collection', methods=['POST'])
def create_collection():
    data = request.json
    col = collection_service.create(data['name'], data.get('icon'), data.get('color'))
    return jsonify(col.to_dict()), 201

@app.route('/collections/<int:collection_id>', methods=['PUT'])
def update_collection(collection_id):
    data = request.json
    col = collection_service.update(collection_id, data.get('name'), data.get('icon'), data.get('color'))
    if col:
        return jsonify(col.to_dict())
    return jsonify({'error': 'Collection not found'}), 404
@app.route('/collections/<int:collection_id>/delete', methods=['DELETE'])
def delete_collection(collection_id):
    if collection_service.delete(collection_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Collection not found'}), 404

@app.route('/bookmarks/<int:bookmark_id>', methods=['GET'])
def get_bookmark(bookmark_id):
    bm = bookmark_service.get_by_id(bookmark_id)
    if bm:
        return jsonify(bm.to_dict())
    return jsonify({'error': 'Bookmark not found'}), 404

@app.route('/create-bookmark', methods=['POST'])
def create_bookmark():
    data = request.json
    bm = bookmark_service.create(
        data['title'],
        data['url'],
        data['description'],
        data['collection_id'],
        data.get('tag_ids', []),
        data.get('is_favorite', False)
    )
    return jsonify(bm.to_dict()), 201

@app.route('/bookmarks/<int:bookmark_id>', methods=['PUT'])
def update_bookmark(bookmark_id):
    data = request.json
    bm = bookmark_service.update(
        bookmark_id,
        data.get('title'),
        data.get('url'),
        data.get('description'),
        data.get('collection_id'),
        data.get('tag_ids'),
        data.get('is_favorite')
    )
    if bm:
        return jsonify(bm.to_dict())
    return jsonify({'error': 'Bookmark not found'}), 404

@app.route('/bookmarks/<int:bookmark_id>', methods=['DELETE'])
def delete_bookmark(bookmark_id):
    if bookmark_service.delete(bookmark_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Bookmark not found'}), 404

@app.route('/bookmarks', methods=['GET'])
def get_bookmarks():
    bookmarks = bookmark_service.get_all()
    return jsonify([bm.to_dict() for bm in bookmarks])


@app.route('/bookmarks/search', methods=['GET'])
def search_bookmarks():
    """Vector search: query string compared to bookmark embeddings, returns top 15 by similarity."""
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([])
    limit = min(15, max(1, request.args.get('limit', 15, type=int)))
    try:
        bookmarks = bookmark_service.search_by_query(q, limit=limit)
        return jsonify([bm.to_dict() for bm in bookmarks])
    except AuthenticationError:
        return jsonify({'error': 'OpenAI API key not configured or invalid. Set API_KEY in .env.'}), 503


@app.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = favorite_service.get_all()
    return jsonify([bm.to_dict() for bm in favorites])

@app.route('/favorites/<int:bookmark_id>', methods=['POST'])
def add_favorite(bookmark_id):
    bm = favorite_service.add(bookmark_id)
    if bm:
        return jsonify(bm.to_dict())
    return jsonify({'error': 'Bookmark not found'}), 404

@app.route('/favorites/<int:bookmark_id>', methods=['DELETE'])
def remove_favorite(bookmark_id):
    if favorite_service.remove(bookmark_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Bookmark not found'}), 404

# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=5000, debug=True)

