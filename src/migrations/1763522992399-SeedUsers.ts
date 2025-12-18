import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';
import { User, Gender, UserRole, LicenseCategory, DriverStatus } from '../modules/users/entities/user.entity';

export class SeedUsers1763522992399 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        const users = [
            // 5 Admins
            { name: 'Maria Lopez', gender: Gender.FEMALE, email: 'admin1@example.com', phone: '3001000001', dateOfBirth: '1985-01-01', password: 'Admin123!', active: true, role: UserRole.ADMIN },
            { name: 'Ana Gomez', gender: Gender.FEMALE, email: 'admin2@example.com', phone: '3001000002', dateOfBirth: '1986-02-02', password: 'Admin123!', active: true, role: UserRole.ADMIN },
            { name: 'Laura Perez', gender: Gender.FEMALE, email: 'admin3@example.com', phone: '3001000003', dateOfBirth: '1987-03-03', password: 'Admin123!', active: true, role: UserRole.ADMIN },
            { name: 'Carolina Sanchez', gender: Gender.FEMALE, email: 'admin4@example.com', phone: '3001000004', dateOfBirth: '1988-04-04', password: 'Admin123!', active: true, role: UserRole.ADMIN },
            { name: 'Isabel Torres', gender: Gender.FEMALE, email: 'admin5@example.com', phone: '3001000005', dateOfBirth: '1989-05-05', password: 'Admin123!', active: true, role: UserRole.ADMIN },

            // 5 Owners (Propietarias)
            { name: 'Sofia Ramirez', gender: Gender.FEMALE, email: 'owner1@example.com', phone: '3002000001', dateOfBirth: '1990-06-01', password: 'Owner123!', active: true, role: UserRole.OWNER },
            { name: 'Valentina Diaz', gender: Gender.FEMALE, email: 'owner2@example.com', phone: '3002000002', dateOfBirth: '1991-07-02', password: 'Owner123!', active: true, role: UserRole.OWNER },
            { name: 'Camila Vargas', gender: Gender.FEMALE, email: 'owner3@example.com', phone: '3002000003', dateOfBirth: '1992-08-03', password: 'Owner123!', active: true, role: UserRole.OWNER },
            { name: 'Daniela Castillo', gender: Gender.FEMALE, email: 'owner4@example.com', phone: '3002000004', dateOfBirth: '1993-09-04', password: 'Owner123!', active: true, role: UserRole.OWNER },
            { name: 'Natalia Herrera', gender: Gender.FEMALE, email: 'owner5@example.com', phone: '3002000005', dateOfBirth: '1994-10-05', password: 'Owner123!', active: true, role: UserRole.OWNER },

            // 5 Drivers (Conductoras) - 2 available, 2 busy, 1 offline
            { name: 'Lucia Fernandez', gender: Gender.FEMALE, email: 'driver1@example.com', phone: '3003000001', dateOfBirth: '1990-01-15', password: 'Driver123!', active: true, role: UserRole.DRIVER, driverStatus: DriverStatus.AVAILABLE, driverLicense: 11111111, licenseCategory: LicenseCategory.A1, licenseExpirationDate: '2026-12-31' },
            { name: 'Gabriela Morales', gender: Gender.FEMALE, email: 'driver2@example.com', phone: '3003000002', dateOfBirth: '1991-02-16', password: 'Driver123!', active: true, role: UserRole.DRIVER, driverStatus: DriverStatus.AVAILABLE, driverLicense: 22222222, licenseCategory: LicenseCategory.A2, licenseExpirationDate: '2026-12-31' },
            { name: 'Paula Jimenez', gender: Gender.FEMALE, email: 'driver3@example.com', phone: '3003000003', dateOfBirth: '1992-03-17', password: 'Driver123!', active: true, role: UserRole.DRIVER, driverStatus: DriverStatus.BUSY, driverLicense: 33333333, licenseCategory: LicenseCategory.B1, licenseExpirationDate: '2026-12-31' },
            { name: 'Fernanda Rojas', gender: Gender.FEMALE, email: 'driver4@example.com', phone: '3003000004', dateOfBirth: '1993-04-18', password: 'Driver123!', active: true, role: UserRole.DRIVER, driverStatus: DriverStatus.BUSY, driverLicense: 44444444, licenseCategory: LicenseCategory.B2, licenseExpirationDate: '2026-12-31' },
            { name: 'Juliana Cruz', gender: Gender.FEMALE, email: 'driver5@example.com', phone: '3003000005', dateOfBirth: '1994-05-19', password: 'Driver123!', active: true, role: UserRole.DRIVER, driverStatus: DriverStatus.OFFLINE, driverLicense: 55555555, licenseCategory: LicenseCategory.B3, licenseExpirationDate: '2026-12-31' },

            // 5 Passengers (Pasajeras)
            { name: 'Andrea Silva', gender: Gender.FEMALE, email: 'passenger1@example.com', phone: '3004000001', dateOfBirth: '1995-06-20', password: 'Pass123!', active: true, role: UserRole.PASSENGER },
            { name: 'Monica Reyes', gender: Gender.FEMALE, email: 'passenger2@example.com', phone: '3004000002', dateOfBirth: '1996-07-21', password: 'Pass123!', active: true, role: UserRole.PASSENGER },
            { name: 'Diana Ortiz', gender: Gender.FEMALE, email: 'passenger3@example.com', phone: '3004000003', dateOfBirth: '1997-08-22', password: 'Pass123!', active: true, role: UserRole.PASSENGER },
            { name: 'Patricia Mendez', gender: Gender.FEMALE, email: 'passenger4@example.com', phone: '3004000004', dateOfBirth: '1998-09-23', password: 'Pass123!', active: true, role: UserRole.PASSENGER },
            { name: 'Sandra Velasquez', gender: Gender.FEMALE, email: 'passenger5@example.com', phone: '3004000005', dateOfBirth: '1999-10-24', password: 'Pass123!', active: true, role: UserRole.PASSENGER },
        ];

        console.log('\n👥 Insertando usuarios...\n');

        for (const u of users) {
            const hashedPassword = await bcrypt.hash(u.password, 10);
            
            await queryRunner.query(
                `INSERT INTO users (name, gender, email, phone, dateOfBirth, password, active, role, driverStatus, driverLicense, licenseCategory, licenseExpirationDate) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    u.name,
                    u.gender,
                    u.email,
                    u.phone,
                    u.dateOfBirth,
                    hashedPassword,
                    u.active,
                    u.role,
                    u.driverStatus || null,
                    u.driverLicense || null,
                    u.licenseCategory || null,
                    u.licenseExpirationDate || null
                ]
            );

            const statusInfo = u.driverStatus ? ` - Status: ${u.driverStatus}` : '';
            console.log(`✓ ${u.role.toUpperCase()}: ${u.name} (${u.email})${statusInfo}`);
        }

        console.log('\n✅ Total de usuarios creados: 20');
        console.log('   - Admins: 5');
        console.log('   - Owners: 5');
        console.log('   - Drivers: 5 (2 available, 2 busy, 1 offline)');
        console.log('   - Passengers: 5\n');

        console.log('🔑 Contraseñas por rol:');
        console.log('   - Admins: Admin123!');
        console.log('   - Owners: Owner123!');
        console.log('   - Drivers: Driver123!');
        console.log('   - Passengers: Pass123!\n');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar usuarios creados por el seed
        const emails = [
            'admin1@example.com', 'admin2@example.com', 'admin3@example.com', 'admin4@example.com', 'admin5@example.com',
            'owner1@example.com', 'owner2@example.com', 'owner3@example.com', 'owner4@example.com', 'owner5@example.com',
            'driver1@example.com', 'driver2@example.com', 'driver3@example.com', 'driver4@example.com', 'driver5@example.com',
            'passenger1@example.com', 'passenger2@example.com', 'passenger3@example.com', 'passenger4@example.com', 'passenger5@example.com'
        ];

        for (const email of emails) {
            await queryRunner.query(`DELETE FROM users WHERE email = ?`, [email]);
        }

        console.log('✓ Usuarios eliminados correctamente');
    }
}
