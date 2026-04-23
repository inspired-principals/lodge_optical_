import logging
import json
from datetime import datetime
from contextvars import ContextVar
from typing import Any, Optional

# Context variable to store request_id across the request lifecycle
request_id_context: ContextVar[Optional[str]] = ContextVar('request_id', default=None)
STANDARD_LOG_RECORD_FIELDS = set(logging.makeLogRecord({}).__dict__.keys())


def _make_json_safe(value: Any):
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if isinstance(value, dict):
        return {str(key): _make_json_safe(nested_value) for key, nested_value in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_make_json_safe(item) for item in value]
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except Exception:
            return str(value)
    return str(value)


class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Always include request_id from context
        request_id = request_id_context.get()
        if request_id:
            log_entry["request_id"] = request_id

        extra_fields = {
            key: _make_json_safe(value)
            for key, value in record.__dict__.items()
            if key not in STANDARD_LOG_RECORD_FIELDS and not key.startswith("_")
        }
        if extra_fields:
            log_entry.update(extra_fields)
            
        return json.dumps(log_entry)


def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Clear existing handlers
    logger.handlers.clear()
    
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    
    logger.addHandler(handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance that will automatically include request_id"""
    return logging.getLogger(name)
