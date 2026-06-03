from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import *
from .serializers import *

# LOGIN (FIXED STUDENT_ID LOOKUP)
@api_view(['POST'])
def login_view(request):
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )

    if not user:
        return Response({"message": "Invalid credentials"}, status=401)

    if user.role != request.data.get("role"):
        return Response({"message": "Wrong role selected"}, status=403)

    student_id = None
    if user.role == "student":
        try:
            # Fixed: Access student_id through the related_name 'student_profile'
            student_id = user.student_profile.student_id
        except AttributeError:
            return Response({"message": "User profile has no associated Student ID record."}, status=400)

    return Response({
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "student_id": student_id
        }
    })


# DASHBOARD STATS
@api_view(['GET'])
def dashboard_stats(request):
    return Response({
        "total_students": Student.objects.count(),
        "available_rooms": Room.objects.filter(status="Available").count(),
        "payments_received": float(sum(p.amount for p in Payment.objects.filter(status="Paid"))),
        "pending_maintenance": MaintenanceRequest.objects.filter(status="Pending").count()
    })


# MY ROOM (FIXED TO RETURN 404 OR NULL INSTEAD OF STR RANGE TO COPE WITH REACT)
@api_view(['GET'])
def my_room(request, student_id):
    allocation = Allocation.objects.filter(student__student_id=student_id).first()
    if not allocation:
        return Response(None, status=200) # Returning null lets React state set to null directly

    return Response({
        "room": allocation.room.room_number,
        "block": allocation.room.hostel_block_number,
        "capacity": allocation.room.capacity
    })


# STUDENT PAYMENTS
@api_view(['GET'])
def student_payments(request, student_id):
    payments = Payment.objects.filter(student__student_id=student_id)
    return Response([
        {
            "amount": p.amount,
            "status": p.status,
            "date": p.payment_date
        } for p in payments
    ])


# MAINTENANCE
@api_view(['GET'])
def maintenance_list(request):
    # Staff or Admins can pull updates here
    requests = MaintenanceRequest.objects.all().order_by('-date')
    return Response(MaintenanceRequestSerializer(requests, many=True).data)


@api_view(['PATCH'])
def update_maintenance(request, pk):
    try:
        req = MaintenanceRequest.objects.get(pk=pk)
    except MaintenanceRequest.DoesNotExist:
        return Response({"message": "Not found"}, status=404)
        
    req.status = request.data.get("status", req.status)
    req.save()
    return Response({"message": "updated", "status": req.status})


# APPLICATION
@api_view(['POST'])
def apply_room(request):
    try:
        student = Student.objects.get(student_id=request.data["student"])
        Application.objects.create(
            student=student,
            program=request.data["program"],
            year=request.data["year"],
            block_preference=request.data["block"]
        )
        return Response({"message": "Application submitted successfully"}, status=201)
    except Student.DoesNotExist:
        return Response({"message": "Student registration record not found"}, status=404)