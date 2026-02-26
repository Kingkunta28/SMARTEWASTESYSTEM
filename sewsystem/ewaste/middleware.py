from django.http import HttpResponse
from django.conf import settings


def _normalize_origin(origin):
    return (origin or "").strip().rstrip("/")


class SimpleCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)

        origin = _normalize_origin(request.headers.get("Origin"))
        allowed_origins = {
            _normalize_origin(candidate) for candidate in getattr(settings, "FRONTEND_ORIGINS", [])
        }
        fallback_origin = _normalize_origin(getattr(settings, "FRONTEND_ORIGIN", ""))
        if fallback_origin:
            allowed_origins.add(fallback_origin)

        if origin and origin in allowed_origins:
            response["Access-Control-Allow-Origin"] = origin
            response["Vary"] = "Origin"
        elif not origin and fallback_origin:
            response["Access-Control-Allow-Origin"] = fallback_origin
            response["Vary"] = "Origin"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRFToken"
        response["Access-Control-Allow-Methods"] = "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Credentials"] = "true"
        return response
