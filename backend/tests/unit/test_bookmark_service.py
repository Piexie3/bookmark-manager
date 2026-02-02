# tests/unit/test_bookmark_service.py
import json
import pytest
from mockito import when, verify, any as ANY_

from backend.models.bookmark import Bookmark
from backend.models.collection import Collection
from backend.models.tags import Tag


def test_create_bookmark_success(bookmark_service, mock_openai_client, mock_session, sample_collection, sample_tag):
    when(mock_session.query(Collection)).get(1).thenReturn(sample_collection)
    when(mock_session.query(Tag)).get(5).thenReturn(sample_tag)

    bookmark = bookmark_service.create(
        title="My Article",
        url="https://example.org/article",
        description="Great article about testing",
        collection_id=1,
        tag_ids=[5],
        is_favorite=True
    )

    assert bookmark.title == "My Article"
    assert bookmark.is_favorite is True
    assert len(bookmark.tags) == 1
    assert bookmark.collection_id == 1
    assert json.loads(bookmark.embedding) == [0.01, 0.02, 0.03, 0.04]

    verify(mock_openai_client.embeddings).create(
        model="text-embedding-ada-002",
        input="My Article Great article about testing"
    )
    verify(mock_session).add(ANY_)
    verify(mock_session).commit()


def test_create_bookmark_collection_not_found(bookmark_service, mock_session):
    when(mock_session.query(Collection)).get(999).thenReturn(None)

    with pytest.raises(AttributeError):
        bookmark_service.create(
            title="No collection",
            url="http://test.com",
            description="desc",
            collection_id=999,
            tag_ids=[]
        )


def test_update_bookmark_partial(bookmark_service, mock_session, sample_bookmark):
    when(mock_session.query(Bookmark)).get(100).thenReturn(sample_bookmark)

    updated = bookmark_service.update(
        bookmark_id=100,
        title="Updated Title",
        description="New desc"
    )

    assert updated.title == "Updated Title"
    assert updated.description == "New desc"
    verify(mock_openai_client.embeddings).create(...)


def test_update_bookmark_not_found(bookmark_service, mock_session):
    when(mock_session.query(Bookmark)).get(999).thenReturn(None)
    result = bookmark_service.update(999, title="whatever")
    assert result is None


def test_delete_bookmark_success(bookmark_service, mock_session, sample_bookmark):
    when(mock_session.query(Bookmark)).get(100).thenReturn(sample_bookmark)
    result = bookmark_service.delete(100)
    assert result is True
    verify(mock_session).delete(sample_bookmark)
    verify(mock_session).commit()


def test_delete_bookmark_not_found(bookmark_service, mock_session):
    when(mock_session.query(Bookmark)).get(999).thenReturn(None)
    assert bookmark_service.delete(999) is False