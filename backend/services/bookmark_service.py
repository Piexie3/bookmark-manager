from backend.infra.db import db
from backend.models.bookmark import Bookmark
from backend.models.tags import Tag
from openai import OpenAI
from flask import current_app, json
from datetime import datetime
from dotenv import load_dotenv
import os




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