import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1763082719673 implements MigrationInterface {
    name = 'InitMigration1763082719673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`locations\` (\`idLocation\` int NOT NULL AUTO_INCREMENT, \`locality\` varchar(255) NOT NULL, \`zone\` varchar(255) NOT NULL, \`latitude\` decimal(12,10) NOT NULL, \`longitude\` decimal(12,10) NOT NULL, PRIMARY KEY (\`idLocation\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vehicle\` (\`idVehicle\` int NOT NULL AUTO_INCREMENT, \`licenseNumber\` varchar(255) NOT NULL, \`cardProperty\` varchar(255) NOT NULL, \`plate\` varchar(255) NOT NULL, \`brand\` varchar(255) NOT NULL, \`model\` varchar(255) NOT NULL, \`color\` varchar(255) NULL, \`vehicleType\` enum ('carro', 'moto') NOT NULL, \`capacity\` int NOT NULL DEFAULT '4', \`statusVehicle\` enum ('active', 'maintenance', 'inactive') NOT NULL DEFAULT 'active', \`createdAt\` timestamp NOT NULL, \`ownerIdUser\` int NULL, UNIQUE INDEX \`IDX_51922d0c6647cb10de3f76ba4e\` (\`plate\`), PRIMARY KEY (\`idVehicle\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`idPayment\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(10,2) NOT NULL, \`paymentMethod\` enum ('cash', 'card', 'transfer') NOT NULL, \`paymentStatus\` enum ('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending', \`paymentDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`tripId\` int NULL, UNIQUE INDEX \`REL_4277aa2c0e3a4a3591474dbea2\` (\`tripId\`), PRIMARY KEY (\`idPayment\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rating\` (\`idRating\` int NOT NULL AUTO_INCREMENT, \`score\` int NOT NULL, \`comments\` varchar(255) NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`tripId\` int NULL, \`passengerId\` int NULL, \`driverId\` int NULL, UNIQUE INDEX \`REL_3eebc3a34c2a85d13f964e92b8\` (\`tripId\`), PRIMARY KEY (\`idRating\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`trip\` (\`idTrip\` int NOT NULL AUTO_INCREMENT, \`distanceKm\` decimal(10,2) NULL, \`cost\` decimal(10,2) NOT NULL, \`statusTrip\` enum ('pending', 'accepted', 'in_progress', 'completed', 'canceled') NOT NULL DEFAULT 'pending', \`requestedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`passengerId\` int NULL, \`driverId\` int NULL, \`vehicleId\` int NULL, \`originLocationId\` int NULL, \`destinationLocationId\` int NULL, PRIMARY KEY (\`idTrip\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`idUser\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`gender\` enum ('male', 'female', 'other') NOT NULL DEFAULT 'female', \`email\` varchar(255) NOT NULL, \`phone\` int NOT NULL, \`password\` varchar(255) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`role\` enum ('admin', 'owner', 'driver', 'passenger') NOT NULL DEFAULT 'passenger', \`driverStatus\` enum ('available', 'busy', 'offline') NULL DEFAULT 'offline', UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), PRIMARY KEY (\`idUser\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`vehicle\` ADD CONSTRAINT \`FK_8d2e355135fc3027497098c67c9\` FOREIGN KEY (\`ownerIdUser\`) REFERENCES \`users\`(\`idUser\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_4277aa2c0e3a4a3591474dbea2f\` FOREIGN KEY (\`tripId\`) REFERENCES \`trip\`(\`idTrip\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_3eebc3a34c2a85d13f964e92b8d\` FOREIGN KEY (\`tripId\`) REFERENCES \`trip\`(\`idTrip\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_0203af688211de5c49794cbac5d\` FOREIGN KEY (\`passengerId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_c767d7be801bbefce27fb71263d\` FOREIGN KEY (\`driverId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_f031867930db28ca4b27e4296f2\` FOREIGN KEY (\`passengerId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_2034f2f2e58179b42c4866f6f13\` FOREIGN KEY (\`driverId\`) REFERENCES \`users\`(\`idUser\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_b0febc31445a349db8313fca453\` FOREIGN KEY (\`vehicleId\`) REFERENCES \`vehicle\`(\`idVehicle\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_16c98bba784d18960139e8fd63b\` FOREIGN KEY (\`originLocationId\`) REFERENCES \`locations\`(\`idLocation\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`trip\` ADD CONSTRAINT \`FK_1f5b50d12e09857e14ed4dcaac1\` FOREIGN KEY (\`destinationLocationId\`) REFERENCES \`locations\`(\`idLocation\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_1f5b50d12e09857e14ed4dcaac1\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_16c98bba784d18960139e8fd63b\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_b0febc31445a349db8313fca453\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_2034f2f2e58179b42c4866f6f13\``);
        await queryRunner.query(`ALTER TABLE \`trip\` DROP FOREIGN KEY \`FK_f031867930db28ca4b27e4296f2\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_c767d7be801bbefce27fb71263d\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_0203af688211de5c49794cbac5d\``);
        await queryRunner.query(`ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_3eebc3a34c2a85d13f964e92b8d\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_4277aa2c0e3a4a3591474dbea2f\``);
        await queryRunner.query(`ALTER TABLE \`vehicle\` DROP FOREIGN KEY \`FK_8d2e355135fc3027497098c67c9\``);
        await queryRunner.query(`DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`trip\``);
        await queryRunner.query(`DROP INDEX \`REL_3eebc3a34c2a85d13f964e92b8\` ON \`rating\``);
        await queryRunner.query(`DROP TABLE \`rating\``);
        await queryRunner.query(`DROP INDEX \`REL_4277aa2c0e3a4a3591474dbea2\` ON \`payments\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP INDEX \`IDX_51922d0c6647cb10de3f76ba4e\` ON \`vehicle\``);
        await queryRunner.query(`DROP TABLE \`vehicle\``);
        await queryRunner.query(`DROP TABLE \`locations\``);
    }

}
