# claims/views.py
import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .services import (
    run_district_ai_audit,
    get_districts_summary,
    get_national_overview,
    get_filtered_claims,
    get_claims_geojson,
    get_single_claim
)

@require_GET
def district_audit_api(request):
    """
    Endpoint: /claims/api/district-audit/?state=Maharashtra&district=Gadchiroli
    """
    state_name = request.GET.get('state')
    district_name = request.GET.get('district')

    if not state_name or not district_name:
        return JsonResponse({"error": "Missing mandatory URL parameters: 'state' and 'district'."}, status=400)

    audit_results = run_district_ai_audit(state_name, district_name)
    return JsonResponse(audit_results, safe=False)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def audit_post_api(request):
    """
    Endpoint: POST /claims/api/audit/
    Accepts JSON body: {"state": "Maharashtra", "district": "Gadchiroli"}
    Or GET query parameters: ?state=Maharashtra&district=Gadchiroli
    """
    state_name = None
    district_name = None

    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            state_name = body.get('state')
            district_name = body.get('district')
        except (json.JSONDecodeError, UnicodeDecodeError):
            state_name = request.POST.get('state')
            district_name = request.POST.get('district')
    else:
        state_name = request.GET.get('state')
        district_name = request.GET.get('district')

    if not state_name or not district_name:
        return JsonResponse({"error": "Missing mandatory fields: 'state' and 'district'."}, status=400)

    audit_results = run_district_ai_audit(state_name, district_name)
    return JsonResponse(audit_results, safe=False)

@require_GET
def districts_list_api(request):
    """
    Endpoint: /claims/api/districts/
    Returns list of all distinct states and districts with claims summary & risk levels.
    """
    districts = get_districts_summary()
    return JsonResponse({"districts": districts}, safe=False)

@require_GET
def national_overview_api(request):
    """
    Endpoint: /claims/api/overview/
    Returns national summary metrics across all claims in the database.
    """
    overview = get_national_overview()
    return JsonResponse(overview, safe=False)

@require_GET
def claims_list_api(request):
    """
    Endpoint: /claims/api/claims/?state=...&district=...&status=...&claim_type=...&land_record_match=...&search=...&limit=50&offset=0
    Returns paginated and filtered list of individual claims.
    """
    state = request.GET.get('state')
    district = request.GET.get('district')
    status = request.GET.get('status')
    claim_type = request.GET.get('claim_type')
    land_record_match = request.GET.get('land_record_match')
    search = request.GET.get('search')
    
    try:
        limit = int(request.GET.get('limit', 50))
    except ValueError:
        limit = 50
        
    try:
        offset = int(request.GET.get('offset', 0))
    except ValueError:
        offset = 0

    result = get_filtered_claims(
        state=state,
        district=district,
        status=status,
        claim_type=claim_type,
        land_record_match=land_record_match,
        search=search,
        limit=limit,
        offset=offset
    )
    return JsonResponse(result, safe=False)

@require_GET
def single_claim_api(request, claim_identifier):
    """
    Endpoint: /claims/api/claims/<claim_identifier>/
    Returns single claim details by primary key ID or string claim_id.
    """
    claim = get_single_claim(claim_identifier)
    if not claim:
        return JsonResponse({"error": f"Claim record not found for identifier: '{claim_identifier}'"}, status=404)
    return JsonResponse(claim, safe=False)

@require_GET
def claims_geojson_api(request):
    """
    Endpoint: /claims/api/geojson/?state=...&district=...
    Returns claims formatted as standard GeoJSON FeatureCollection for GIS map rendering.
    """
    state = request.GET.get('state')
    district = request.GET.get('district')
    geojson = get_claims_geojson(state=state, district=district)
    return JsonResponse(geojson, safe=False)
