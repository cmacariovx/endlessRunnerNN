from django.urls import path
from . import views

urlpatterns = [
    path('api/main/fetchBrain', views.fetch_brain, name='fetch_brain'),
    path('api/main/saveBrain', views.save_brain, name='save_brain'),
]
