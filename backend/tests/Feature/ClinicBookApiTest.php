<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicBookApiTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(array $attributes = []): User
    {
        return User::create(array_merge([
            'name' => 'Test User',
            'email' => 'user'.uniqid().'@example.com',
            'password' => 'password123',
            'role' => 'patient',
        ], $attributes));
    }

    private function createDoctor(array $attributes = []): User
    {
        return User::create(array_merge([
            'name' => 'Dr. Test',
            'email' => 'doctor'.uniqid().'@example.com',
            'password' => 'password123',
            'role' => 'doctor',
            'specialty' => 'General',
        ], $attributes));
    }

    public function test_patient_can_book_an_appointment(): void
    {
        $patient = $this->createUser();
        $doctor = $this->createDoctor();

        $this->actingAs($patient, 'sanctum')
            ->postJson('/api/appointments', [
                'doctor_id' => $doctor->id,
                'appointment_date' => now()->addDay()->toDateString(),
                'appointment_time' => '09:30',
                'reason' => 'Check-up',
            ])
            ->assertCreated()
            ->assertJsonPath('appointment.status', 'pending');
    }

    public function test_booking_in_the_past_is_rejected(): void
    {
        $patient = $this->createUser();
        $doctor = $this->createDoctor();

        $this->actingAs($patient, 'sanctum')
            ->postJson('/api/appointments', [
                'doctor_id' => $doctor->id,
                'appointment_date' => now()->subDay()->toDateString(),
                'appointment_time' => '09:30',
            ])
            ->assertUnprocessable();
    }

    public function test_double_booking_is_prevented(): void
    {
        $patient = $this->createUser();
        $other = $this->createUser();
        $doctor = $this->createDoctor();
        $date = now()->addDays(3)->toDateString();

        $this->actingAs($patient, 'sanctum')
            ->postJson('/api/appointments', [
                'doctor_id' => $doctor->id,
                'appointment_date' => $date,
                'appointment_time' => '11:00',
            ])
            ->assertCreated();

        $this->actingAs($other, 'sanctum')
            ->postJson('/api/appointments', [
                'doctor_id' => $doctor->id,
                'appointment_date' => $date,
                'appointment_time' => '11:00',
            ])
            ->assertUnprocessable();
    }

    public function test_cancelled_slot_can_be_booked_again(): void
    {
        $patient = $this->createUser();
        $other = $this->createUser();
        $doctor = $this->createDoctor();
        $date = now()->addDays(5)->toDateString();

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => $date,
            'appointment_time' => '09:00',
            'status' => 'cancelled',
        ]);

        $this->actingAs($other, 'sanctum')
            ->postJson('/api/appointments', [
                'doctor_id' => $doctor->id,
                'appointment_date' => $date,
                'appointment_time' => '09:00',
            ])
            ->assertCreated();
    }

    public function test_doctor_can_confirm_their_own_appointment(): void
    {
        $patient = $this->createUser();
        $doctor = $this->createDoctor();
        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00',
        ]);

        $this->actingAs($doctor, 'sanctum')
            ->patchJson("/api/doctor/appointments/{$appointment->id}/status", ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('appointment.status', 'confirmed');
    }

    public function test_patients_cannot_use_admin_routes(): void
    {
        $patient = $this->createUser();

        $this->actingAs($patient, 'sanctum')
            ->getJson('/api/admin/stats')
            ->assertForbidden();
    }
}
