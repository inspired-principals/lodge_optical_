"""Case lifecycle boundary.

These re-exports let the app depend on a neutral internal package now, while
the legacy module layout remains intact during extraction.
"""

from ....modules.triage.case_service import (  # noqa: F401
    ACTION_NOTE,
    ACTION_OVERRIDE_PRIORITY,
    ACTION_OVERRIDE_ROUTING,
    ACTION_STATUS_CHANGE,
    ALLOWED_STATUS_TRANSITIONS,
    CaseService,
    PERFORMED_BY_SYSTEM,
    STATUS_BOOKED,
    STATUS_CANCELLED,
    STATUS_CLOSED,
    STATUS_CONTACTED,
    STATUS_ESCALATED,
    STATUS_NEW,
    STATUS_NO_RESPONSE,
    STATUS_REVIEWED,
)
from ....modules.triage.service import TriageRuleService, TriageService  # noqa: F401

