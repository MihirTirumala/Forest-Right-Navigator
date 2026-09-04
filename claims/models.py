from django.db import models


class Claim(models.Model):

    CLAIM_TYPES = [
        ('IFR', 'Individual Forest Rights'),
        ('CFR', 'Community Forest Rights'),
        ('CR', 'Community Rights'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    claim_id = models.CharField(max_length=20, unique=True)

    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)

    latitude = models.FloatField()
    longitude = models.FloatField()

    claim_type = models.CharField(
        max_length=10,
        choices=CLAIM_TYPES
    )

    area_claimed = models.FloatField()
    area_recorded = models.FloatField()

    submission_date = models.DateField()
    decision_date = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES
    )

    land_record_match = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.claim_id} - {self.district}"