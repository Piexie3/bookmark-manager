# tests/conftest.py
from typing import Collection
from backend.infra.db import db
from backend.models.bookmark import Bookmark
from backend.models.tags import Tag
from backend.services.bookmark_service import BookmarkService
from backend.services.collection_service import CollectionService
from backend.services.collection_service import CollectionService
from backend.services.favorite_service import FavoriteService
from backend.services.tag_service import TagService
import pytest
from mockito import mock, when, verify, unstub, ANY
from datetime import datetime

@pytest.fixture
def mock_session():
    """Mock SQLAlchemy session for all services"""
    session = mock()
    when(session).add(ANY).thenReturn(None)
    when(session).commit().thenReturn(None)
    when(session).rollback().thenReturn(None)
    when(session).delete(ANY).thenReturn(None)
    
    # Default query behavior
    query_mock = mock()
    when(session).query(ANY).thenReturn(query_mock)
    when(query_mock).get(ANY).thenReturn(None)
    when(query_mock).filter_by(ANY).thenReturn(query_mock)
    when(query_mock).all().thenReturn([])
    when(query_mock).first().thenReturn(None)
    
    return session


@pytest.fixture
def mock_openai_client():
    client = mock()
    embeddings_mock = mock()
    response_mock = mock()
    data_item = mock()
    data_item.embedding = [0.01, 0.02, 0.03, 0.04]
    response_mock.data = [data_item]
    
    when(embeddings_mock).create(model=ANY, input=ANY).thenReturn(response_mock)
    when(client).embeddings.thenReturn(embeddings_mock)
    return client


@pytest.fixture
def bookmark_service(mock_session, mock_openai_client):
    service = BookmarkService()
    service.openai_client = mock_openai_client
    db.session = mock_session  
    yield service
    unstub()


@pytest.fixture
def collection_service(mock_session):
    db.session = mock_session
    yield CollectionService()
    unstub()


@pytest.fixture
def tag_service(mock_session):
    db.session = mock_session
    yield TagService()
    unstub()


@pytest.fixture
def favorite_service(mock_session):
    db.session = mock_session
    yield FavoriteService()
    unstub()


@pytest.fixture
def sample_bookmark():
    return Bookmark(
        id=100,
        title="Sample",
        url="https://example.com",
        description="Test description",
        collection_id=1,
        created_at=datetime.utcnow(),
        is_favorite=False
    )


@pytest.fixture
def sample_collection():
    return Collection(id=1, name="Dev", icon="code", color="blue")


@pytest.fixture
def sample_tag():
    return Tag(id=5, name="python", color="blue-500")