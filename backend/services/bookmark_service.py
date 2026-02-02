from backend.infra.db import db
from backend.models.bookmark import Bookmark
from backend.models.tags import Tag
from openai import OpenAI
from flask import current_app, json
from datetime import datetime
from dotenv import load_dotenv
import os
import math




class BookmarkService:
    load_dotenv()

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.environ.get('API_KEY'))

    def get_all(self):
        return Bookmark.query.all()

    def get_by_id(self, bookmark_id):
        return Bookmark.query.get(bookmark_id)

    def create(self, title, url, description, collection_id, tag_ids, is_favorite=False):
        text = f"{title} {description}"
        response = self.openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        embedding = response.data[0].embedding

        bm = Bookmark(
            title=title,
            url=url,
            description=description,
            collection_id=collection_id,
            is_favorite=is_favorite,
            embedding=json.dumps(embedding),
            created_at=datetime.utcnow()
        )
        for tag_id in tag_ids:
            tag = Tag.query.get(tag_id)
            if tag:
                bm.tags.append(tag)
        db.session.add(bm)
        db.session.commit()
        return bm

    def update(self, bookmark_id, title=None, url=None, description=None, collection_id=None, tag_ids=None, is_favorite=None):
        bm = Bookmark.query.get(bookmark_id)
        if not bm:
            return None
        if title:
            bm.title = title
        if url:
            bm.url = url
        if description:
            bm.description = description
        if collection_id:
            bm.collection_id = collection_id
        if is_favorite is not None:
            bm.is_favorite = is_favorite
        if tag_ids is not None:
            bm.tags = []
            for tag_id in tag_ids:
                tag = Tag.query.get(tag_id)
                if tag:
                    bm.tags.append(tag)
        # Regenerate embedding if title or description changed
        if title or description:
            text = f"{bm.title} {bm.description}"
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            bm.embedding = json.dumps(response.data[0].embedding)
        db.session.commit()
        return bm

    def delete(self, bookmark_id):
        bm = Bookmark.query.get(bookmark_id)
        if not bm:
            return False
        db.session.delete(bm)
        db.session.commit()
        return True

    @staticmethod
    def _cosine_similarity(a, b):
        """Cosine similarity between two vectors (lists of floats)."""
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    def search_by_query(self, query, limit=15):
        """
        Vector search: embed the query, compare to stored bookmark embeddings,
        return top `limit` bookmarks ordered by similarity (most to least).
        """
        if not query or not query.strip():
            return []
        bookmarks_with_embedding = Bookmark.query.filter(
            Bookmark.embedding.isnot(None)
        ).all()
        if not bookmarks_with_embedding:
            return []
        response = self.openai_client.embeddings.create(
            model="text-embedding-ada-002",
            input=query.strip()
        )
        query_embedding = response.data[0].embedding
        scored = []
        for bm in bookmarks_with_embedding:
            try:
                emb = json.loads(bm.embedding) if isinstance(bm.embedding, str) else bm.embedding
            except (TypeError, ValueError):
                continue
            sim = self._cosine_similarity(query_embedding, emb)
            scored.append((sim, bm))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [bm for _, bm in scored[:limit]]