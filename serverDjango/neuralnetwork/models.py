from django.db import models
import json

class Brain(models.Model):
    brain = models.TextField()
    max_distance = models.DecimalField(max_digits=5, decimal_places=2)

    @property
    def brain_data(self):
        return json.loads(self.brain)

    class Meta:
        db_table = 'brains'
