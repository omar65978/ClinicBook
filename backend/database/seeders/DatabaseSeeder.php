<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the database with an admin, demo doctors, a patient, and sample appointments.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@clinicbook.test'],
            ['name' => 'Clinic Admin', 'password' => 'password', 'role' => 'admin'],
        );

        $doctors = [
            ['name' => 'Dr. Sara Mahmoud', 'email' => 'sara@clinicbook.test', 'specialty' => 'Cardiology', 'bio' => 'Cardiologist with 10 years of experience.'],
            ['name' => 'Dr. Omar Khaled', 'email' => 'omar@clinicbook.test', 'specialty' => 'Dermatology', 'bio' => 'Skin health specialist.'],
            ['name' => 'Dr. Lina Adel', 'email' => 'lina@clinicbook.test', 'specialty' => 'Pediatrics', 'bio' => 'Friendly pediatrician for children of all ages.'],
        ];

        foreach ($doctors as $doctor) {
            User::updateOrCreate(
                ['email' => $doctor['email']],
                [...$doctor, 'password' => 'password', 'role' => 'doctor'],
            );
        }

        $patient = User::updateOrCreate(
            ['email' => 'patient@clinicbook.test'],
            ['name' => 'Demo Patient', 'password' => 'password', 'role' => 'patient'],
        );

        $sara = User::where('email', 'sara@clinicbook.test')->first();
        $omar = User::where('email', 'omar@clinicbook.test')->first();

        Appointment::updateOrCreate(
            [
                'doctor_id' => $omar->id,
                'appointment_date' => now()->addDays(2)->toDateString(),
                'appointment_time' => '10:00',
            ],
            [
                'patient_id' => $patient->id,
                'status' => 'pending',
                'reason' => 'Skin rash check-up',
            ],
        );

        Appointment::updateOrCreate(
            [
                'doctor_id' => $sara->id,
                'appointment_date' => now()->addDays(4)->toDateString(),
                'appointment_time' => '12:30',
            ],
            [
                'patient_id' => $patient->id,
                'status' => 'confirmed',
                'reason' => 'Follow-up visit',
            ],
        );

        $this->command?->info('Seeded admin:   admin@clinicbook.test / password');
        $this->command?->info('Seeded doctors: sara@ / omar@ / lina@clinicbook.test / password');
        $this->command?->info('Seeded patient: patient@clinicbook.test / password');
    }
}
