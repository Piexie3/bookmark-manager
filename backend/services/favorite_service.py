from backend.infra.db import db
from backend.models.bookmark import Bookmark


class FavoriteService:
    def get_all(self):
        return Bookmark.query.filter_by(is_favorite=True).all()

    def add(self, bookmark_id):
        bm = Bookmark.query.get(bookmark_id)
        if not bm:
            return None
        bm.is_favorite = True
        db.session.commit()
        return bm

    def remove(self, bookmark_id):
        bm = Bookmark.query.get(bookmark_id)
        if not bm:
            return False
        bm.is_favorite = False
        db.session.commit()
        return True