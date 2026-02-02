

from backend.infra.db import db
from backend.models.tags import Tag
import random

DEFAULT_COLORS = [
    "#3B82F6", 
    "#8B5CF6", 
    "#06B6D4", 
    "#10B981", 
    "#F59E0B", 
    "#EF4444", 
    "#EC4899", 
    "#14B8A6", 
    "#F97316", 
    "#6366F1", 
    "#84CC16", 
    "#A855F7", 
    "#0EA5E9", 
    "#22C55E", 
    "#FBBF24", 
]


class TagService:
    def get_all(self):
        return Tag.query.all()

    def get_by_id(self, tag_id):
        return Tag.query.get(tag_id)

    def create(self, name, color):
        if name is None:
            return {"error": "Missing 'name'"}, 400
        if(color is None):
            color = random.choice(DEFAULT_COLORS)
        tag = Tag(name=name, color=color)
        db.session.add(tag)
        db.session.commit()
        return tag

    def update(self, tag_id, name=None, color=None):
        tag = Tag.query.get(tag_id)
        if not tag:
            return None
        if name:
            tag.name = name
        if color:
            tag.color = color
        db.session.commit()
        return tag

    def delete(self, tag_id):
        tag = Tag.query.get(tag_id)
        if not tag:
            return False
        db.session.delete(tag)
        db.session.commit()
        return True