from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Brain

@csrf_exempt
def fetch_brain(request):
    if request.method == 'POST':
        brain = Brain.objects.get(pk=1)
        response_data = {
            'id': brain.id,
            'brain': brain.brain_data,
            'max_distance': brain.max_distance,
        }
        return JsonResponse(response_data)
    return JsonResponse({'error': 'Invalid request method'})

@csrf_exempt
def save_brain(request):
    if request.method == 'POST':
        brain_data = request.POST['brain']
        max_distance = request.POST['max_distance']
        brain, _ = Brain.objects.update_or_create(pk=1, defaults={'brain': brain_data, 'max_distance': max_distance})
        return JsonResponse({'message': 'Brain saved successfully'})
    return JsonResponse({'error': 'Invalid request method'})
