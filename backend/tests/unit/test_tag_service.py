# tests/unit/test_tag_service.py
import pytest
from mockito import when, verify, any as ANY_

from backend.models.tags import Tag


def test_create_tag(tag_service, mock_session):
    tag = tag_service.create(name="fastapi", color="teal-500")

    assert tag.name == "fastapi"
    assert tag.color == "teal-500"
    verify(mock_session).add(ANY_)
    verify(mock_session).commit()


def test_update_tag_success(tag_service, mock_session, sample_tag):
    when(mock_session.query(Tag)).get(5).thenReturn(sample_tag)

    updated = tag_service.update(
        tag_id=5,
        name="python-fastapi",
        color="emerald-600"
    )

    assert updated.name == "python-fastapi"
    assert updated.color == "emerald-600"
    verify(mock_session).commit()


def test_update_tag_not_found(tag_service, mock_session):
    when(mock_session.query(Tag)).get(999).thenReturn(None)
    result = tag_service.update(999, name="new-name")
    assert result is None


def test_delete_tag_success(tag_service, mock_session, sample_tag):
    when(mock_session.query(Tag)).get(5).thenReturn(sample_tag)
    result = tag_service.delete(5)
    assert result is True
    verify(mock_session).delete(sample_tag)
    verify(mock_session).commit()


def test_delete_tag_not_found(tag_service, mock_session):
    when(mock_session.query(Tag)).get(999).thenReturn(None)
    assert tag_service.delete(999) is False