from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import *
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role", {"fields": ("role",)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)

admin.site.register(Student)
admin.site.register(Room)
admin.site.register(Allocation)
admin.site.register(Payment)
admin.site.register(Staff)
admin.site.register(MaintenanceRequest)
admin.site.register(Application)