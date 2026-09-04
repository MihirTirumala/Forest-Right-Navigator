# claims/services.py
import datetime
import json
import requests
from django.conf import settings
from django.db.models import Sum, Avg, Count, Q
from .models import Claim

def run_district_ai_audit(state_name, district_name):
    # 1. Query and Aggregate individual claim rows for this district
    claims_queryset = Claim.objects.filter(state=state_name, district=district_name)
    
    if not claims_queryset.exists():
        return {
            "state": state_name,
            "district": district_name,
            "risk_score": 0,
            "risk_level": "LOW",
            "avg_processing_days": 0,
            "total_claims": 0,
            "approved": 0,
            "rejected": 0,
            "pending": 0,
            "mismatched_land_records": 0,
            "total_claimed_area": 0.0,
            "total_recorded_area": 0.0,
            "ai_summary": {
                "anomaly_detected": True,
                "primary_root_cause": "SILENT_DISTRICT_NO_DATA",
                "audit_briefing": f"No claims recorded for district {district_name}, {state_name}. Potential missing digital integration.",
                "recommended_action": "Initiate field survey to register claims in digital system."
            }
        }

    metrics = claims_queryset.aggregate(
        total=Count('id'),
        approved=Count('id', filter=Q(status='Approved')),
        rejected=Count('id', filter=Q(status='Rejected')),
        pending=Count('id', filter=Q(status='Pending')),
        mismatched_land=Count('id', filter=Q(land_record_match=False)),
        total_claimed_area=Sum('area_claimed'),
        total_recorded_area=Sum('area_recorded')
    )

    resolved_claims = claims_queryset.filter(decision_date__isnull=False)
    avg_days = 0
    if resolved_claims.exists():
        total_days = sum((c.decision_date - c.submission_date).days for c in resolved_claims)
        avg_days = round(total_days / resolved_claims.count())

    delay_score = min((avg_days / 180.0) * 100, 100)
    rejection_rate = (metrics['rejected'] / metrics['total'] * 100) if metrics['total'] > 0 else 0
    spatial_conflict_rate = (metrics['mismatched_land'] / metrics['total'] * 100) if metrics['total'] > 0 else 0

    risk_score = round((delay_score * 0.35) + (rejection_rate * 0.35) + (spatial_conflict_rate * 0.30))
    risk_level = "LOW" if risk_score <= 40 else "MEDIUM" if risk_score <= 75 else "HIGH"

    api_key = getattr(settings, "GROQ_API_KEY", None)
    if not api_key:
        return {
            "state": state_name, "district": district_name, "risk_score": risk_score, "risk_level": risk_level,
            "avg_processing_days": avg_days, "total_claims": metrics['total'], "approved": metrics['approved'],
            "rejected": metrics['rejected'], "pending": metrics['pending'], "mismatched_land_records": metrics['mismatched_land'],
            "total_claimed_area": metrics['total_claimed_area'], "total_recorded_area": metrics['total_recorded_area'],
            "ai_summary": {
                "anomaly_detected": risk_score > 50,
                "primary_root_cause": "GROQ_KEY_UNCONFIGURED",
                "audit_briefing": f"Audit calculated risk score is {risk_score}/100 ({risk_level} Risk). Groq API key is unconfigured, showing rule-based output.",
                "recommended_action": "Set GROQ_API_KEY environment variable to enable live LLM synthesis."
            }
        }

    prompt = f"""You are a compliance AI auditor evaluating Forest Rights Act (FRA) deployment. 
Analyze the provided district summary aggregates and generate an official briefing.

[CRITICAL INSTRUCTION]
You MUST NOT invent numbers. Use ONLY the calculated risk metrics and raw counts provided below.

[Context Metrics]
District: {district_name}, {state_name}
Total Claims Lodged: {metrics['total']}
Approved: {metrics['approved']} | Rejected: {metrics['rejected']} | Pending: {metrics['pending']}
Mismatched GIS Land Records: {metrics['mismatched_land']} entries
Average Status Resolution Delay: {avg_days} days
Calculated Audit Risk Score: {risk_score}/100 ({risk_level} RISK)

Return a strictly valid JSON block corresponding EXACTLY to the following schema:
{{
  "anomaly_detected": boolean,
  "primary_root_cause": "UPPERCASE_SNAKE_CASE_REASON",
  "audit_briefing": "A short 2-sentence executive summary detailing administrative backlogs or spatial mismatch markers.",
  "recommended_action": "Targeted compliance directive for state tribal authorities"
}}"""

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "groq/compound-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
            },
            timeout=10
        )
        response.raise_for_status()
        raw_text = response.json()['choices'][0]['message']['content'].strip()
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
        ai_payload = json.loads(raw_text)
    except Exception as err:
        ai_payload = {
            "anomaly_detected": risk_score > 60,
            "primary_root_cause": "INFERENCE_API_UNAVAILABLE",
            "audit_briefing": f"Audit metrics calculated successfully. Risk score: {risk_score}/100 ({risk_level} RISK). Live synthesis error: {str(err)}",
            "recommended_action": "Re-evaluate API parameters or check Groq network availability."
        }


    return {
        "state": state_name, "district": district_name, "risk_score": risk_score, "risk_level": risk_level,
        "avg_processing_days": avg_days, "total_claims": metrics['total'], "approved": metrics['approved'],
        "rejected": metrics['rejected'], "pending": metrics['pending'], "mismatched_land_records": metrics['mismatched_land'],
        "total_claimed_area": metrics['total_claimed_area'], "total_recorded_area": metrics['total_recorded_area'],
        "ai_summary": ai_payload
    }

def get_districts_summary():
    """Returns a list of all distinct (state, district) pairs with metrics and calculated risk levels."""
    pairs = Claim.objects.values('state', 'district').distinct().order_by('state', 'district')
    results = []
    
    for item in pairs:
        st = item['state']
        dt = item['district']
        qs = Claim.objects.filter(state=st, district=dt)
        total = qs.count()
        approved = qs.filter(status='Approved').count()
        rejected = qs.filter(status='Rejected').count()
        pending = qs.filter(status='Pending').count()
        mismatches = qs.filter(land_record_match=False).count()
        
        resolved = qs.filter(decision_date__isnull=False)
        avg_days = 0
        if resolved.exists():
            total_days = sum((c.decision_date - c.submission_date).days for c in resolved)
            avg_days = round(total_days / resolved.count())
            
        delay_score = min((avg_days / 180.0) * 100, 100)
        rejection_rate = (rejected / total * 100) if total > 0 else 0
        mismatch_rate = (mismatches / total * 100) if total > 0 else 0
        risk_score = round((delay_score * 0.35) + (rejection_rate * 0.35) + (mismatch_rate * 0.30))
        risk_level = "LOW" if risk_score <= 40 else "MEDIUM" if risk_score <= 75 else "HIGH"

        results.append({
            "state": st,
            "district": dt,
            "total_claims": total,
            "approved": approved,
            "rejected": rejected,
            "pending": pending,
            "mismatched_land_records": mismatches,
            "avg_processing_days": avg_days,
            "risk_score": risk_score,
            "risk_level": risk_level
        })
        
    return results

def get_national_overview():
    """Returns national aggregate statistics across all claims in the database."""
    total_claims = Claim.objects.count()
    if total_claims == 0:
        return {
            "total_claims": 0,
            "approved_claims": 0,
            "rejected_claims": 0,
            "pending_claims": 0,
            "mismatched_land_records": 0,
            "total_claimed_area": 0.0,
            "total_recorded_area": 0.0,
            "avg_processing_days": 0,
            "districts_count": 0,
            "high_risk_districts_count": 0,
            "medium_risk_districts_count": 0,
            "low_risk_districts_count": 0,
        }
        
    metrics = Claim.objects.aggregate(
        approved=Count('id', filter=Q(status='Approved')),
        rejected=Count('id', filter=Q(status='Rejected')),
        pending=Count('id', filter=Q(status='Pending')),
        mismatched=Count('id', filter=Q(land_record_match=False)),
        total_claimed=Sum('area_claimed'),
        total_recorded=Sum('area_recorded')
    )
    
    resolved = Claim.objects.filter(decision_date__isnull=False)
    avg_days = 0
    if resolved.exists():
        total_days = sum((c.decision_date - c.submission_date).days for c in resolved)
        avg_days = round(total_days / resolved.count())

    districts_data = get_districts_summary()
    high_risk = sum(1 for d in districts_data if d['risk_level'] == 'HIGH')
    med_risk = sum(1 for d in districts_data if d['risk_level'] == 'MEDIUM')
    low_risk = sum(1 for d in districts_data if d['risk_level'] == 'LOW')

    return {
        "total_claims": total_claims,
        "approved_claims": metrics['approved'],
        "rejected_claims": metrics['rejected'],
        "pending_claims": metrics['pending'],
        "mismatched_land_records": metrics['mismatched'],
        "total_claimed_area": round(metrics['total_claimed'] or 0.0, 2),
        "total_recorded_area": round(metrics['total_recorded'] or 0.0, 2),
        "avg_processing_days": avg_days,
        "districts_count": len(districts_data),
        "high_risk_districts_count": high_risk,
        "medium_risk_districts_count": med_risk,
        "low_risk_districts_count": low_risk,
    }

def get_filtered_claims(state=None, district=None, status=None, claim_type=None, land_record_match=None, search=None, limit=50, offset=0):
    """Returns a list of individual claim records with filtering and pagination."""
    qs = Claim.objects.all().order_by('-created_at')

    if state:
        qs = qs.filter(state__iexact=state)
    if district:
        qs = qs.filter(district__iexact=district)
    if status:
        qs = qs.filter(status__iexact=status)
    if claim_type:
        qs = qs.filter(claim_type__iexact=claim_type)
    if land_record_match is not None:
        if isinstance(land_record_match, str):
            is_match = land_record_match.lower() == 'true'
        else:
            is_match = bool(land_record_match)
        qs = qs.filter(land_record_match=is_match)
    if search:
        qs = qs.filter(Q(claim_id__icontains=search) | Q(district__icontains=search) | Q(state__icontains=search))

    total_count = qs.count()
    claims_slice = qs[offset:offset+limit]

    claims_data = [
        {
            "id": c.id,
            "claim_id": c.claim_id,
            "state": c.state,
            "district": c.district,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "claim_type": c.claim_type,
            "area_claimed": c.area_claimed,
            "area_recorded": c.area_recorded,
            "submission_date": c.submission_date.isoformat() if c.submission_date else None,
            "decision_date": c.decision_date.isoformat() if c.decision_date else None,
            "status": c.status,
            "land_record_match": c.land_record_match,
            "created_at": c.created_at.isoformat() if c.created_at else None
        }
        for c in claims_slice
    ]

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "claims": claims_data
    }

def get_claims_geojson(state=None, district=None):
    """Returns claims as a standard GeoJSON FeatureCollection for GIS map rendering."""
    qs = Claim.objects.all()
    if state:
        qs = qs.filter(state__iexact=state)
    if district:
        qs = qs.filter(district__iexact=district)

    features = []
    for c in qs:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [c.longitude, c.latitude]
            },
            "properties": {
                "id": c.id,
                "claim_id": c.claim_id,
                "state": c.state,
                "district": c.district,
                "claim_type": c.claim_type,
                "area_claimed": c.area_claimed,
                "area_recorded": c.area_recorded,
                "status": c.status,
                "land_record_match": c.land_record_match,
                "submission_date": c.submission_date.isoformat() if c.submission_date else None
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

def get_single_claim(claim_identifier):
    """Fetches a single claim record by numeric primary key or string claim_id."""
    claim = None
    if str(claim_identifier).isdigit():
        claim = Claim.objects.filter(id=int(claim_identifier)).first()
    
    if not claim:
        claim = Claim.objects.filter(claim_id__iexact=str(claim_identifier)).first()

    if not claim:
        return None

    return {
        "id": claim.id,
        "claim_id": claim.claim_id,
        "state": claim.state,
        "district": claim.district,
        "latitude": claim.latitude,
        "longitude": claim.longitude,
        "claim_type": claim.claim_type,
        "area_claimed": claim.area_claimed,
        "area_recorded": claim.area_recorded,
        "submission_date": claim.submission_date.isoformat() if claim.submission_date else None,
        "decision_date": claim.decision_date.isoformat() if claim.decision_date else None,
        "status": claim.status,
        "land_record_match": claim.land_record_match,
        "created_at": claim.created_at.isoformat() if claim.created_at else None
    }

