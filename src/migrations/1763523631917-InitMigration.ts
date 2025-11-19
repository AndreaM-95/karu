import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1763523631917 implements MigrationInterface {
    name = 'InitMigration1763523631917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`locations\` (\`idLocation\` int NOT NULL AUTO_INCREMENT, \`locality\` varchar(255) NOT NULL, \`zone\` varchar(255) NOT NULL, \`latitude\` decimal(12,10) NOT NULL, \`longitude\` decimal(12,10) NOT NULL, PRIMARY KEY (\`idLocation\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vehicles\` (\`idVehicle\` int NOT NULL AUTO_INCREMENT, \`plate\` varchar(255) NOT NULL, \`brand\` varchar(255) NULL, \`model\` varchar(255) NULL, \`vehicleType\` enum ('carro', 'moto') NULL, \`statusVehicle\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`ownerId\` int NULL, UNIQUE INDEX \`IDX_ec7181ebdab798d97070122a5b\` (\`plate\`), PRIMARY KEY (\`idVehicle\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`idPayment\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(10,2) NOT NULL, \`adminShare\` decimal(10,2) NOT NULL, \`driverShare\` decimal(10,2) NOT NULL, \`ownerShare\` decimal(10,2) NULL, \`paymentMethod\` enum ('cash', 'card', 'transfer') NOT NULL, \`paymentStatus\` enum ('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending', \`paymentDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`tripId\` int NULL, UNIQUE INDEX \`REL_ce672d31850809f6ba7da26451\` (\`tripId\`), PRIMARY KEY (\`idPayment\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rating\` (\`idRating\` int NOT NULL AUTO_INCREMENT, \`score\` int(1) NULL, \`comments\` text NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`status\` enum ('rated', 'notRated') NOT NULL DEFAULT 'notRated', \`tripId\` int NULL, \`authorId\` int NULL, \`targetId\` int NULL, PRIMARY KEY (\`idRating\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`trip\` (\`idTrip\` int NOT NULL AUTO_INCREMENT, \`distanceKm\` decimal(10,2) NULL, \`cost\` decimal(10,2) NOT NULL, \`statusTrip\` enum ('pending', 'accepted', 'in_progress', 'completed', 'canceled') NOT NULL DEFAULT 'in_progress', \`requestedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`passengerId\` int NULL, \`driverId\` int NULL, \`vehicleId\` int NULL, \`originLocationId\` int NULL, \`destinationLocationId\` int NULL, PRIMARY KEY (\`idTrip\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`idUser\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`gender\` enum ('male', 'female', 'other') NOT NULL DEFAULT 'female', \`email\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`dateOfBirth\` date NULL, \`password\` varchar(255) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`role\` enum ('admin', 'owner', 'driver', 'passenger') NOT NULL DEFAULT 'passenger', \`driverStatus\` enum ('available', 'busy', 'offline') NULL, \`driverLicense\` int NULL, \`licenseCategory\` enum ('a1', 'a2', 'b1', 'b2', 'b3') NULL, \`licenseExpirationDate\` date NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`idUser\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vehicle_drivers\` (\`vehicleId\` int NOT NULL, \`userId\` int NOT NULL, INDEX \`IDX_993e8d33da85fc0dbc5c5952f2\` (\`vehicleId\`), INDEX \`IDX_a0c27512b7835b646576ae4074\` (\`userId\`), PRIMARY KEY (\`vehicleId\`, \`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`vehicles\` ADD CONSTRAINT \`FK_c0a0d32b2ae04801d6e5b9e5c80\` FOREIGN KEY (\`ownerId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_ce672d31850809f6ba7da26451f\` FOREIGN KEY (\`tripId\`) REFERENCES \`trip\`(\`idTrip\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_3eebc3a34c2a85d13f964e92b8d\` FOREIGN KEY (\`tripId\`) REFERENCES \`trip\`(\`idTrip\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_dc05a97d06394594fc882cb1e39\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_f9932caea6c720f6220c77a82a5\` FOREIGN KEY (\`targetId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_f031867930db28ca4b27e4296f2\` FOREIGN KEY (\`passengerId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_2034f2f2e58179b42c4866f6f13\` FOREIGN KEY (\`driverId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_b0febc31445a349db8313fca453\` FOREIGN KEY (\`vehicleId\`) REFERENCES \`vehicles\`(\`idVehicle\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_16c98bba784d18960139e8fd63b\` FOREIGN KEY (\`originLocationId\`) REFERENCES \`locations\`(\`idLocation\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_1f5b50d12e09857e14ed4dcaac1\` FOREIGN KEY (\`destinationLocationId\`) REFERENCES \`locations\`(\`idLocation\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vehicle_drivers\` ADD CONSTRAINT \`FK_993e8d33da85fc0dbc5c5952f21\` FOREIGN KEY (\`vehicleId\`) REFERENCES \`vehicles\`(\`idVehicle\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`vehicle_drivers\` ADD CONSTRAINT \`FK_a0c27512b7835b646576ae40748\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vehicle_drivers\` DROP FOREIGN KEY \`FK_a0c27512b7835b646576ae40748\``);
        await queryRunner.query(`ALTER TABLE \`vehicle_drivers\` DROP FOREIGN KEY \`FK_993e8d33da85fc0dbc5c5952f21\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_1f5b50d12e09857e14ed4dcaac1\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_16c98bba784d18960139e8fd63b\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_b0febc31445a349db8313fca453\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_2034f2f2e58179b42c4866f6f13\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_f031867930db28ca4b27e4296f2\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_f9932caea6c720f6220c77a82a5\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_dc05a97d06394594fc882cb1e39\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_3eebc3a34c2a85d13f964e92b8d\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_ce672d31850809f6ba7da26451f\``);
        await queryRunner.query(`ALTER TABLE \`vehicles\` DROP FOREIGN KEY \`FK_c0a0d32b2ae04801d6e5b9e5c80\``);
        await queryRunner.query(`DROP INDEX \`IDX_a0c27512b7835b646576ae4074\` ON \`vehicle_drivers\``);
        await queryRunner.query(`DROP INDEX \`IDX_993e8d33da85fc0dbc5c5952f2\` ON \`vehicle_drivers\``);
        await queryRunner.query(`DROP TABLE \`vehicle_drivers\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`trip\``);
        await queryRunner.query(`DROP TABLE \`rating\``);
        await queryRunner.query(`DROP INDEX \`REL_ce672d31850809f6ba7da26451\` ON \`payment\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP INDEX \`IDX_ec7181ebdab798d97070122a5b\` ON \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`locations\``);
    }

}
