# claims/urls.py
from django.urls import path
from .views import (
    district_audit_api,
    audit_post_api,
    districts_list_api,
    national_overview_api,
    claims_list_api,
    single_claim_api,
    claims_geojson_api
)

urlpatterns = [
    path('api/district-audit/', district_audit_api, name='district_audit_api'),
    path('api/audit/', audit_post_api, name='audit_post_api'),
    path('api/districts/', districts_list_api, name='districts_list_api'),
    path('api/overview/', national_overview_api, name='national_overview_api'),
    path('api/claims/', claims_list_api, name='claims_list_api'),
    path('api/claims/<str:claim_identifier>/', single_claim_api, name='single_claim_api'),
    path('api/geojson/', claims_geojson_api, name='claims_geojson_api'),
]
