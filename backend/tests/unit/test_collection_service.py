from typing import Collection
import pytest
from mockito import when, verify, any as ANY_


def test_create_collection(collection_service, mock_session):
    collection = collection_service.create(
        name="Machine Learning",
        icon="brain",
        color="purple-600"
    )

    assert collection.name == "Machine Learning"
    assert collection.icon == "brain"
    assert collection.color == "purple-600"
    verify(mock_session).add(ANY_)
    verify(mock_session).commit()


def test_update_collection_success(collection_service, mock_session, sample_collection):
    when(mock_session.query(Collection)).get(1).thenReturn(sample_collection)

    updated = collection_service.update(
        collection_id=1,
        name="Development Tools",
        color="indigo-500"
    )

    assert updated.name == "Development Tools"
    assert updated.color == "indigo-500"
    verify(mock_session).commit()


def test_update_collection_not_found(collection_service, mock_session):
    when(mock_session.query(Collection)).get(999).thenReturn(None)
    result = collection_service.update(999, name="New Name")
    assert result is None


def test_delete_collection_success(collection_service, mock_session, sample_collection):
    when(mock_session.query(Collection)).get(1).thenReturn(sample_collection)
    result = collection_service.delete(1)
    assert result is True
    verify(mock_session).delete(sample_collection)
    verify(mock_session).commit()


def test_delete_collection_not_found(collection_service, mock_session):
    when(mock_session.query(Collection)).get(999).thenReturn(None)
    assert collection_service.delete(999) is False


def test_get_all_collections(collection_service, mock_session):
    collections = [Collection(id=1, name="A"), Collection(id=2, name="B")]
    when(mock_session.query(Collection)).all().thenReturn(collections)

    result = collection_service.get_all()
    assert len(result) == 2
    assert result[0].name == "A"