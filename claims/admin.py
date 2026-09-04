from django.contrib import admin
from .models import Claim


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):

    list_display = (
        'claim_id',
        'state',
        'district',
        'claim_type',
        'area_claimed',
        'area_recorded',
        'status',
        'land_record_match',
    )

    list_filter = (
        'state',
        'district',
        'claim_type',
        'status',
        'land_record_match',
    )

    search_fields = (
        'claim_id',
        'state',
        'district',
    )