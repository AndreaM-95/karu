import { MigrationInterface, QueryRunner } from "typeorm";
import { VehicleType, VehicleStatus } from '../modules/vehicles/entities/vehicle.entity';

export class SeedVehicles1763355062436 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Obtener los IDs de los owners
        const owners = await queryRunner.query(`
            SELECT idUser, name FROM users WHERE role = 'owner' ORDER BY idUser ASC LIMIT 5
        `);

        if (owners.length !== 5) {
            throw new Error('Se requieren exactamente 5 owners en la base de datos');
        }

        console.log('\n📋 Owners encontrados:');
        owners.forEach((owner: any, index: number) => {
            console.log(`   ${index + 1}. ${owner.name} (ID: ${owner.idUser})`);
        });

        // Obtener los IDs de las conductoras
        const drivers = await queryRunner.query(`
            SELECT idUser, name FROM users WHERE role = 'driver' ORDER BY idUser ASC LIMIT 5
        `);

        console.log('\n🚗 Drivers encontrados:');
        drivers.forEach((driver: any, index: number) => {
            console.log(`   ${index + 1}. ${driver.name} (ID: ${driver.idUser})`);
        });

        const vehicles = [
            // Owner 1: Sofia Ramirez - 1 carro
            { 
                plate: 'ABC123',
                brand: 'Toyota',
                model: 'Corolla 2020', 
                vehicleType: VehicleType.CARRO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[0].idUser,
                driverIds: [drivers[0].idUser, drivers[1].idUser] // Lucia y Gabriela
            },

            // Owner 2: Valentina Diaz - 2 carros
            { 
                plate: 'DEF456',
                brand: 'Chevrolet',
                model: 'Spark 2019', 
                vehicleType: VehicleType.CARRO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[1].idUser,
                driverIds: [drivers[1].idUser] // Solo Gabriela
            },
            { 
                plate: 'GHI789',
                brand: 'Mazda',
                model: '3 2021', 
                vehicleType: VehicleType.CARRO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[1].idUser,
                driverIds: [drivers[1].idUser, drivers[2].idUser] // Gabriela y Paula
            },

            // Owner 3: Camila Vargas - 3 carros
            { 
                plate: 'JKL012',
                brand: 'Renault',
                model: 'Logan 2018', 
                vehicleType: VehicleType.CARRO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[2].idUser,
                driverIds: [drivers[2].idUser] // Solo Paula
            },
            { 
                plate: 'MNO345',
                brand: 'Nissan',
                model: 'Versa 2020', 
                vehicleType: VehicleType.CARRO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[2].idUser,
                driverIds: [drivers[2].idUser, drivers[3].idUser] // Paula y Fernanda
            },
            { 
                plate: 'PQR678',
                brand: 'Kia',
                model: 'Rio 2022', 
                vehicleType: VehicleType.CARRO, 
                statusVehicle: VehicleStatus.INACTIVE, 
                ownerId: owners[2].idUser,
                driverIds: [] // Sin conductores (vehículo inactivo)
            },

            // Owner 4: Daniela Castillo - 1 moto
            { 
                plate: 'STU901',
                brand: 'Yamaha',
                model: 'FZ 150 2021', 
                vehicleType: VehicleType.MOTO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[3].idUser,
                driverIds: [drivers[3].idUser, drivers[4].idUser] // Fernanda y Juliana
            },

            // Owner 5: Natalia Herrera - 2 motos
            { 
                plate: 'VWX234',
                brand: 'Honda',
                model: 'CB 190 2020', 
                vehicleType: VehicleType.MOTO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[4].idUser,
                driverIds: [drivers[4].idUser] // Solo Juliana
            },
            { 
                plate: 'YZA567',
                brand: 'Suzuki',
                model: 'GN 125 2019', 
                vehicleType: VehicleType.MOTO, 
                statusVehicle: VehicleStatus.ACTIVE, 
                ownerId: owners[4].idUser,
                driverIds: [drivers[0].idUser, drivers[4].idUser] // Lucia y Juliana
            },
        ];

        console.log('\n🚀 Insertando vehículos...\n');

        for (const vehicle of vehicles) {
            // 1. Insertar el vehículo
            const result = await queryRunner.query(
                `INSERT INTO vehicles (plate, brand, model, vehicleType, statusVehicle, ownerId) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    vehicle.plate,
                    vehicle.brand,
                    vehicle.model,
                    vehicle.vehicleType,
                    vehicle.statusVehicle,
                    vehicle.ownerId
                ]
            );

            const vehicleId = result.insertId;

            // 2. Asignar conductores en la tabla intermedia vehicle_drivers
            for (const driverId of vehicle.driverIds) {
                await queryRunner.query(
                    `INSERT INTO vehicle_drivers (vehicleId, userId) VALUES (?, ?)`,
                    [vehicleId, driverId]
                );
            }

            const driverNames = vehicle.driverIds.length > 0 
                ? vehicle.driverIds.map((id: number) => {
                    const driver = drivers.find((d: any) => d.idUser === id);
                    return driver?.name || 'Unknown';
                  }).join(', ')
                : 'Sin conductores asignados';

            console.log(`✓ ${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`);
            console.log(`  Owner: ${owners.find((o: any) => o.idUser === vehicle.ownerId)?.name}`);
            console.log(`  Conductores: ${driverNames}\n`);
        }

        console.log('✅ Total de vehículos creados: 9');
        console.log('   - 6 carros (1 inactive)');
        console.log('   - 3 motos\n');
        
        // Verificar las relaciones creadas
        const vehiclesWithRelations = await queryRunner.query(`
            SELECT 
                v.plate, 
                v.brand,
                v.model, 
                owner.name as ownerName,
                GROUP_CONCAT(driver.name SEPARATOR ', ') as driverNames
            FROM vehicles v 
            INNER JOIN users owner ON v.ownerId = owner.idUser
            LEFT JOIN vehicle_drivers vd ON v.idVehicle = vd.vehicleId
            LEFT JOIN users driver ON vd.userId = driver.idUser
            GROUP BY v.idVehicle, v.plate, v.brand, v.model, owner.name
            ORDER BY v.plate
        `);
        
        console.log('📊 Verificación de relaciones:\n');
        vehiclesWithRelations.forEach((v: any) => {
            console.log(`   ${v.plate} (${v.brand} ${v.model})`);
            console.log(`   └─ Owner: ${v.ownerName}`);
            console.log(`   └─ Drivers: ${v.driverNames || 'Sin asignar'}\n`);
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const plates = [
            'ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345', 
            'PQR678', 'STU901', 'VWX234', 'YZA567'
        ];

        // Primero eliminar las relaciones en vehicle_drivers (por el CASCADE)
        for (const plate of plates) {
            await queryRunner.query(
                `DELETE FROM vehicles WHERE plate = ?`, 
                [plate]
            );
        }

        console.log('✓ Vehículos y sus relaciones eliminados correctamente');
    }
}