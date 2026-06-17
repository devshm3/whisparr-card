from custom_components.whisparr_hacs.const import DOMAIN, DEFAULT_POLL_INTERVAL, PARENT_KINDS


def test_domain():
    assert DOMAIN == "whisparr_hacs"


def test_poll_interval_default():
    assert DEFAULT_POLL_INTERVAL == 30


def test_parent_kinds():
    assert PARENT_KINDS == ("studio", "performer")
