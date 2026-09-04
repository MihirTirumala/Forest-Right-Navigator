import datetime
import json
from django.test import TestCase, Client

from django.urls import reverse
from claims.models import Claim
from claims.services import (
    run_district_ai_audit,
    get_districts_summary,
    get_national_overview,
    get_filtered_claims,
    get_claims_geojson
)

class ClaimModelTest(TestCase):
    def setUp(self):
        self.claim = Claim.objects.create(
            claim_id="FRA-TEST-001",
            state="TestState",
            district="TestDistrict",
            latitude=20.5,
            longitude=78.5,
            claim_type="IFR",
            area_claimed=5.0,
            area_recorded=5.0,
            submission_date=datetime.date(2024, 1, 1),
            decision_date=datetime.date(2024, 1, 15),
            status="Approved",
            land_record_match=True
        )

    def test_claim_str(self):
        self.assertEqual(str(self.claim), "FRA-TEST-001 - TestDistrict")


class ClaimServicesTest(TestCase):
    def setUp(self):
        today = datetime.date.today()
        # District 1: High risk scenario (High rejection rate & mismatch)
        for i in range(10):
            Claim.objects.create(
                claim_id=f"FRA-HIGH-{i}",
                state="StateA",
                district="DistrictHigh",
                latitude=20.0,
                longitude=78.0,
                claim_type="IFR",
                area_claimed=4.0,
                area_recorded=10.0 if i % 2 == 0 else 4.0,
                submission_date=today - datetime.timedelta(days=200),
                decision_date=today if i < 8 else None,
                status="Rejected" if i < 8 else "Pending",
                land_record_match=(i % 2 != 0)
            )

        # District 2: Low risk scenario (Approved, matching land records)
        for i in range(5):
            Claim.objects.create(
                claim_id=f"FRA-LOW-{i}",
                state="StateA",
                district="DistrictLow",
                latitude=21.0,
                longitude=79.0,
                claim_type="CFR",
                area_claimed=3.0,
                area_recorded=3.0,
                submission_date=today - datetime.timedelta(days=10),
                decision_date=today,
                status="Approved",
                land_record_match=True
            )

    def test_run_district_ai_audit_high_risk(self):
        audit = run_district_ai_audit("StateA", "DistrictHigh")
        self.assertEqual(audit["state"], "StateA")
        self.assertEqual(audit["district"], "DistrictHigh")
        self.assertEqual(audit["total_claims"], 10)
        self.assertIn(audit["risk_level"], ["MEDIUM", "HIGH"])
        self.assertIn("ai_summary", audit)

    def test_run_district_ai_audit_empty_district(self):
        audit = run_district_ai_audit("StateA", "NonExistentDistrict")
        self.assertEqual(audit["total_claims"], 0)
        self.assertEqual(audit["risk_level"], "LOW")
        self.assertTrue(audit["ai_summary"]["anomaly_detected"])

    def test_get_districts_summary(self):
        summary = get_districts_summary()
        self.assertEqual(len(summary), 2)
        districts = [d["district"] for d in summary]
        self.assertIn("DistrictHigh", districts)
        self.assertIn("DistrictLow", districts)

    def test_get_national_overview(self):
        overview = get_national_overview()
        self.assertEqual(overview["total_claims"], 15)
        self.assertEqual(overview["approved_claims"], 5)
        self.assertEqual(overview["rejected_claims"], 8)
        self.assertEqual(overview["pending_claims"], 2)
        self.assertEqual(overview["districts_count"], 2)

    def test_get_filtered_claims(self):
        result = get_filtered_claims(state="StateA", status="Approved")
        self.assertEqual(result["total"], 5)
        self.assertEqual(len(result["claims"]), 5)

    def test_get_claims_geojson(self):
        geojson = get_claims_geojson(district="DistrictLow")
        self.assertEqual(geojson["type"], "FeatureCollection")
        self.assertEqual(len(geojson["features"]), 5)
        first_feat = geojson["features"][0]
        self.assertEqual(first_feat["geometry"]["type"], "Point")
        self.assertEqual(first_feat["geometry"]["coordinates"], [79.0, 21.0])


class ClaimAPITest(TestCase):
    def setUp(self):
        self.client = Client()
        self.claim = Claim.objects.create(
            claim_id="FRA-API-001",
            state="Maharashtra",
            district="Gadchiroli",
            latitude=20.2,
            longitude=80.0,
            claim_type="IFR",
            area_claimed=4.5,
            area_recorded=4.5,
            submission_date=datetime.date(2024, 1, 1),
            decision_date=datetime.date(2024, 2, 1),
            status="Approved",
            land_record_match=True
        )

    def test_district_audit_api_success(self):
        response = self.client.get('/claims/api/district-audit/?state=Maharashtra&district=Gadchiroli')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["district"], "Gadchiroli")
        self.assertEqual(data["total_claims"], 1)

    def test_district_audit_api_missing_params(self):
        response = self.client.get('/claims/api/district-audit/?state=Maharashtra')
        self.assertEqual(response.status_code, 400)

    def test_districts_list_api(self):
        response = self.client.get('/claims/api/districts/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("districts", data)

    def test_national_overview_api(self):
        response = self.client.get('/claims/api/overview/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_claims"], 1)

    def test_claims_list_api(self):
        response = self.client.get('/claims/api/claims/?state=Maharashtra')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 1)
        self.assertEqual(data["claims"][0]["claim_id"], "FRA-API-001")

    def test_claims_geojson_api(self):
        response = self.client.get('/claims/api/geojson/?state=Maharashtra')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["type"], "FeatureCollection")
        self.assertEqual(len(data["features"]), 1)

    def test_single_claim_api_success(self):
        # By string claim_id
        response = self.client.get(f'/claims/api/claims/{self.claim.claim_id}/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["claim_id"], "FRA-API-001")

        # By numeric id
        response_num = self.client.get(f'/claims/api/claims/{self.claim.id}/')
        self.assertEqual(response_num.status_code, 200)
        data_num = response_num.json()
        self.assertEqual(data_num["claim_id"], "FRA-API-001")

    def test_single_claim_api_not_found(self):
        response = self.client.get('/claims/api/claims/NONEXISTENT-999/')
        self.assertEqual(response.status_code, 404)

    def test_audit_post_api_success(self):
        response = self.client.post(
            '/claims/api/audit/',
            data=json.dumps({"state": "Maharashtra", "district": "Gadchiroli"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["district"], "Gadchiroli")
        self.assertIn("ai_summary", data)

    def test_audit_post_api_missing_fields(self):
        response = self.client.post(
            '/claims/api/audit/',
            data=json.dumps({"state": "Maharashtra"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

