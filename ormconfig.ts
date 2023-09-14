import { ConnectionOptions } from 'typeorm';
export default {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: 'admin',
  database: 'nestcrud',
  entities: ['dist/**/*.entity{.ts,.js}', 'src//*.entity.ts'],
  synchronize: true,
} as ConnectionOptions;
