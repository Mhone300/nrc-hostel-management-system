from django.urls import path
from . import views

urlpatterns = [
    path("auth/login/", views.login_view),
    path("dashboard/stats/", views.dashboard_stats),

    path("my-room/<str:student_id>/", views.my_room),
    path("student-payments/<str:student_id>/", views.student_payments),

    path("maintenance/", views.maintenance_list),
    path("maintenance/<int:pk>/", views.update_maintenance),

    path("apply/", views.apply_room),
]