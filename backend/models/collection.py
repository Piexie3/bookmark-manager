from backend.infra.db import db


class Collection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(255), nullable=False)
    color = db.Column(db.String(255), nullable=False)
    count = db.Column(db.Integer, default=0)
    bookmarks = db.relationship('Bookmark', backref='collection', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'count': len(self.bookmarks)
        }