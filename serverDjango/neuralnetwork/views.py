from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from .models import Brain
import json

@csrf_exempt
def fetch_brain(request):
    if request.method == 'POST':
        try:
            request_data = json.loads(request.body)
            new_neural_network = request_data.get('newNeuralNetwork')

            if new_neural_network:
                return JsonResponse({'error': 'oops'})

            brain = Brain.objects.get(pk=1)
            response_data = {
                'id': brain.id,
                'brain': brain.brain_data,
                'max_distance': brain.max_distance,
            }
            return JsonResponse(response_data)
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data')
    return JsonResponse({'error': 'Invalid request method'})

@csrf_exempt
def save_brain(request):
    if request.method == 'POST':
        try:
            request_data = json.loads(request.body)
            brain_data = request_data.get('brain')
            max_distance = request_data.get('max_distance')

            brain, _ = Brain.objects.update_or_create(pk=1, defaults={'brain': brain_data, 'max_distance': max_distance})
            return JsonResponse({'message': 'Brain saved successfully'})
        except json.JSONDecodeError:
            return HttpResponseBadRequest('Invalid JSON data')
    return JsonResponse({'error': 'Invalid request method'})
