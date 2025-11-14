import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertLocations1763051831226 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO locations (locality, zone, latitude, longitude) VALUES
      ('Usaquén', 'Pepe Sierra', 4.6987925, -74.0551929),
      ('Tunjuelito', 'Calle 40 Sur', 4.5757621, -74.1200657),
      ('Suba', 'Niza', 4.7265087, -74.0758643),
      ('Chapinero', 'Zona T', 4.6628927, -74.0580012),
      ('Kennedy', 'Américas', 4.6245012, -74.1469278),
      ('Fontibón', 'Zona Franca', 4.6732015, -74.1461183),
      ('Engativá', 'Normandía', 4.6822014, -74.1120093),
      ('Bosa', 'La Libertad', 4.6101122, -74.1905639),
      ('Teusaquillo', 'Parque Simón Bolívar', 4.6583811, -74.0930413),
      ('Puente Aranda', 'Carvajal', 4.6145223, -74.1198431),
      ('San Cristóbal', '20 de Julio', 4.5677721, -74.0889043),
      ('Rafael Uribe Uribe', 'Olarte', 4.5793019, -74.1168205),
      ('Ciudad Bolívar', 'El Tesoro', 4.5369328, -74.1665054),
      ('Antonio Nariño', 'Restrepo', 4.5914836, -74.0983932),
      ('Barrios Unidos', 'Siete de Agosto', 4.6711805, -74.0698534),
      ('Los Mártires', 'San Andresito', 4.6029421, -74.0851123),
      ('La Candelaria', 'Centro Histórico', 4.5955523, -74.0758104),
      ('Santa Fe', 'Las Aguas', 4.6092156, -74.0714567),
      ('Sumapaz', 'Nazareth', 4.1677125, -74.2905132),
      ('Usme', 'Yomasa', 4.5078125, -74.1159722),
      ('Suba', 'Suba - Calle 95', 4.68404590569, -74.0629262275);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
