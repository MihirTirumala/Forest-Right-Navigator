# seed_data.py
import os
import django
import datetime


# Initialize Django environment settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fra_backend.settings')
django.setup()

from claims.models import Claim

def seed_fra_data():
    print("Clearing out old claim records...")
    Claim.objects.all().delete()

    today = datetime.date.today()
    long_ago = today - datetime.timedelta(days=450)

    # 6 high-impact demonstration scenarios matching our verification matrix
    scenarios = [
        {"state": "Maharashtra", "district": "Gadchiroli", "count": 20, "approved": 2, "rejected": 3, "pending": 15, "mismatch": False, "delayed": True},
        {"state": "Odisha", "district": "Sundargarh", "count": 25, "approved": 2, "rejected": 22, "pending": 1, "mismatch": False, "delayed": False},
        {"state": "Chhattisgarh", "district": "Dantewada", "count": 15, "approved": 1, "rejected": 12, "pending": 2, "mismatch": True, "delayed": False},
        {"state": "Odisha", "district": "Kandhamal", "count": 10, "approved": 8, "rejected": 2, "pending": 0, "mismatch": False, "delayed": False}, 
        {"state": "Gujarat", "district": "Narmada", "count": 18, "approved": 15, "rejected": 2, "pending": 1, "mismatch": True, "delayed": False},
        {"state": "Jharkhand", "district": "Paschim Singhbhum", "count": 0, "approved": 0, "rejected": 0, "pending": 0, "mismatch": False, "delayed": False}
    ]

    global_counter = 1000
    claim_types = ['IFR', 'CFR', 'CR']

    for s in scenarios:
        if s["count"] == 0:
            print(f"Skipping {s['district']} to simulate a Silent District anomaly (0 claims logged).")
            continue
            
        print(f"Generating claims for {s['district']}...")
        
        for i in range(s["count"]):
            global_counter += 1
            c_type = claim_types[i % 3]
            
            if i < s["approved"]:
                status = "Approved"
                decision = today
            elif i < (s["approved"] + s["rejected"]):
                status = "Rejected"
                decision = today
            else:
                status = "Pending"
                decision = None

            sub_date = long_ago if s["delayed"] else today - datetime.timedelta(days=30)
            is_match = False if s["mismatch"] else True

            Claim.objects.create(
                claim_id=f"FRA-{global_counter}",
                state=s["state"],
                district=s["district"],
                latitude=22.0 + (global_counter % 10) * 0.1,
                longitude=80.0 + (global_counter % 10) * 0.1,
                claim_type=c_type,
                area_claimed=4.5,
                area_recorded=4.5 if is_match else 12.5, # Intentionally mismatches land record
                submission_date=sub_date,
                decision_date=decision,
                status=status,
                land_record_match=is_match
            )

    print("\nSuccess! All 6 demonstration profiles have been loaded into db.sqlite3.")

if __name__ == "__main__":
    seed_fra_data()

