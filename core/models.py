from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('staff', 'Staff'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    # ADD THESE TWO LINES TO FIX THE CLASH:
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    student_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=255)
    program = models.CharField(max_length=255)
    year_of_study = models.IntegerField()
    phone_number = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.student_id} - {self.name}"

class Room(models.Model):
    STATUS_CHOICES = (
        ('Available', 'Available'),
        ('Occupied', 'Occupied'),
    )
    room_number = models.CharField(max_length=20, unique=True, primary_key=True)
    capacity = models.IntegerField(default=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    hostel_block_number = models.CharField(max_length=10)

    def __str__(self):
        return f"Room {self.room_number} (Block {self.hostel_block_number})"

class Allocation(models.Model):
    allocation_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    allocation_date = models.DateField(auto_now_add=True)
    duration = models.CharField(max_length=50, default="1 Semester")

class Payment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
    )
    payment_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    payment_method = models.CharField(max_length=50, default="Cash")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

class Staff(models.Model):
    staff_id = models.CharField(max_length=50, unique=True, primary_key=True)
    staff_name = models.CharField(max_length=255)
    position = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    hostel_block_number = models.CharField(max_length=10)

class MaintenanceRequest(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    )
    request_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    room_number = models.CharField(max_length=20)
    problem_description = models.TextField()
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
class Application(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    program = models.CharField(max_length=200)
    year = models.IntegerField()
    block_preference = models.CharField(max_length=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")

    def __str__(self):
        return f"{self.student.name} - {self.status}"