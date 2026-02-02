from datetime import datetime
from backend.infra.db import db
# import pytz


bookmark_tags = db.Table('bookmark_tags',
    db.Column('bookmark_id', db.Integer, db.ForeignKey('bookmark.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)


class Bookmark(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(512), nullable=False)
    description = db.Column(db.Text, nullable=False)
    collection_id = db.Column(db.Integer, db.ForeignKey('collection.id'), nullable=False)
    tags = db.relationship('Tag', secondary=bookmark_tags, backref=db.backref('bookmarks', lazy='dynamic'))
    created_at = db.Column(db.DateTime, default=datetime.now())
    is_favorite = db.Column(db.Boolean, default=False)
    has_dark_icon = db.Column(db.Boolean, default=False)
    embedding = db.Column(db.JSON)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'url': self.url,
            'description': self.description,
            'collectionId': self.collection_id,
            'tags': [tag.name for tag in self.tags],
            'createdAt': self.created_at.isoformat(),
            'isFavorite': self.is_favorite,
            'hasDarkIcon': self.has_dark_icon
        }