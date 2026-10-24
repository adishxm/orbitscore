"""
Tests for document parsing, page feature detection, family partitioning, and bounded extraction.
"""

from ai_ml.datasets.documents import PageRecord, DocumentPackage, partition_documents_by_family
from ai_ml.extraction.parsing import detect_page_features, parse_document_text_by_page
from ai_ml.extraction.pretrained import BoundedExtractionRunner


def test_page_record_and_features():
    text = (
        "SECTION 1.0 SPACECRAFT OVERVIEW\n\n"
        "The spacecraft wet mass is 150.0 kg.\n\n"
        "| Subsystem | Mass (kg) |\n"
        "|---|---|\n"
        "| Payload | 45.0 |\n"
        "| Bus | 105.0 |\n"
    )
    headings, has_tables, is_scan = detect_page_features(text)
    assert len(headings) >= 1
    assert "SECTION 1.0 SPACECRAFT OVERVIEW" in headings
    assert has_tables is True
    assert is_scan is False

    rec = PageRecord(
        source_id="src_doc_1",
        page_number=1,
        text_content=text
    )
    assert rec.char_count == len(text)
    assert len(rec.sha256) == 64


def test_parse_document_text_by_page():
    raw_multipage = (
        "Page 1: Overview\n"
        "The satellite operates at an apogee altitude of 550.0 km.\n"
        "\x0c"
        "Page 2: Disposal Plan\n"
        "Atmospheric reentry lifetime without propulsion is 4.2 years.\n"
    )
    pages = parse_document_text_by_page(raw_multipage, source_id="src_test_multipage")
    assert len(pages) == 2
    assert pages[0].page_number == 1
    assert pages[1].page_number == 2
    assert "550.0 km" in pages[0].text_content
    assert "4.2 years" in pages[1].text_content


def test_partition_documents_by_family():
    doc1 = DocumentPackage(
        source_id="s1",
        mission_family_id="family_alpha",
        original_filename="alpha_doc1.pdf"
    )
    doc2 = DocumentPackage(
        source_id="s2",
        mission_family_id="family_alpha",
        original_filename="alpha_doc2_amendment.pdf"
    )
    doc3 = DocumentPackage(
        source_id="s3",
        mission_family_id="family_beta",
        original_filename="beta_doc.pdf"
    )
    doc4 = DocumentPackage(
        source_id="s4",
        mission_family_id="family_gamma",
        original_filename="gamma_doc.pdf"
    )

    train, val, test = partition_documents_by_family([doc1, doc2, doc3, doc4])

    # Invariant: documents from the same family must stay in the same split!
    alpha_splits = {d.split for d in [doc1, doc2]}
    assert len(alpha_splits) == 1  # doc1 and doc2 are both in the same split


def test_bounded_extraction_runner():
    page_text = "The spacecraft has a wet mass of 145.0 kg and operates at an apogee altitude of 550.0 km."
    page = PageRecord(
        source_id="src_test_extract",
        page_number=1,
        text_content=page_text
    )

    runner = BoundedExtractionRunner(ai_enabled=False)
    candidates = runner.extract_from_pages([page])

    assert len(candidates) >= 1
    for cand in candidates:
        assert cand.human_confirmed is False  # Safety invariant
        assert cand.locator["source_id"] == "src_test_extract"
        assert cand.locator["page"] == 1
        # Quote must exist in page text
        assert cand.locator["quote"].lower() in page_text.lower()
