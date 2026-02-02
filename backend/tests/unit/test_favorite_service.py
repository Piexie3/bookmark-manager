import pytest
from mockito import when, verify

from backend.models.bookmark import Bookmark


def test_add_favorite_success(favorite_service, mock_session, sample_bookmark):
    when(mock_session.query(Bookmark)).get(100).thenReturn(sample_bookmark)

    result = favorite_service.add(100)

    assert result is not None
    assert result.is_favorite is True
    verify(mock_session).commit()


def test_add_favorite_not_found(favorite_service, mock_session):
    when(mock_session.query(Bookmark)).get(999).thenReturn(None)
    result = favorite_service.add(999)
    assert result is None


def test_remove_favorite_success(favorite_service, mock_session, sample_bookmark):
    sample_bookmark.is_favorite = True
    when(mock_session.query(Bookmark)).get(100).thenReturn(sample_bookmark)

    result = favorite_service.remove(100)

    assert result is True
    assert sample_bookmark.is_favorite is False
    verify(mock_session).commit()


def test_remove_favorite_not_found(favorite_service, mock_session):
    when(mock_session.query(Bookmark)).get(999).thenReturn(None)
    assert favorite_service.remove(999) is False


def test_get_all_favorites(favorite_service, mock_session):
    favorites = [
        Bookmark(id=1, is_favorite=True),
        Bookmark(id=2, is_favorite=True),
        Bookmark(id=3, is_favorite=False)
    ]
    when(mock_session.query(Bookmark)).filter_by(is_favorite=True).all().thenReturn(favorites[:2])

    result = favorite_service.get_all()
    assert len(result) == 2