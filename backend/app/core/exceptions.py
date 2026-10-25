from typing import Any, Optional
from fastapi import HTTPException, status


class EleysoraException(HTTPException):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "error": {
                    "code": code,
                    "message": message,
                    "details": details,
                }
            },
        )


class NotFoundException(EleysoraException):
    def __init__(self, resource: str, identifier: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=f"{resource} {identifier or ''} not found".strip(),
        )


class UnauthorizedException(EleysoraException):
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
        )


class ForbiddenException(EleysoraException):
    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN_ACCESS",
            message=message,
        )


class ValidationException(EleysoraException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )


class AIServiceException(EleysoraException):
    def __init__(self, message: str = "AI service temporarily unavailable", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="AI_SERVICE_ERROR",
            message=message,
            details=details,
        )
