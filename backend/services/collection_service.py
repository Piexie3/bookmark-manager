import random
from backend.infra.db import db
from backend.models.collection import Collection

icons=[
    "task",
    "kanban",
    "trending_up",
    "backlog",
    "warning",
    "error",
    "bug",
    "feature",
    "rocket",
]
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


class CollectionService:
    def get_all(self):
        return Collection.query.all()

    def get_by_id(self, collection_id):
        return Collection.query.get(collection_id)

    def create(self, name, icon, color):
        if name is None:
            return {"error": "Missing 'name'"}, 400
        if(icon is None):
            icon = random.choice(icons)
        if(color is None):
            color = random.choice(DEFAULT_COLORS)

        col = Collection(name=name, icon=icon, color=color)
        db.session.add(col)
        db.session.commit()
        return col

    def update(self, collection_id, name=None, icon=None, color=None):
        col = Collection.query.get(collection_id)
        if not col:
            return None
        if name:
            col.name = name
        if icon:
            col.icon = icon
        if color:
            col.color = color
        db.session.commit()
        return col

    def delete(self, collection_id):
        col = Collection.query.get(collection_id)
        if not col:
            return False
        db.session.delete(col)
        db.session.commit()
        return True