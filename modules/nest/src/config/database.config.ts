import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

interface ParsedDatabaseConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

function parseDatabaseUrl(url: string | undefined): ParsedDatabaseConfig {
  if (!url) {
    return {};
  }

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 5432,
      username: parsed.username || undefined,
      password: parsed.password || undefined,
      database: parsed.pathname.slice(1), // Remove leading '/'
    };
  } catch (error) {
    console.warn(
      'Failed to parse DATABASE_URL, falling back to individual env vars',
      error,
    );
    return {};
  }
}

export default registerAs('database', (): TypeOrmModuleOptions => {
  const urlConfig = parseDatabaseUrl(process.env.DATABASE_URL);

  return {
    type: 'postgres',
    host: urlConfig.host || process.env.DB_HOST || 'localhost',
    port: urlConfig.port || parseInt(process.env.DB_PORT || '5432', 10),
    username: urlConfig.username || process.env.DB_USERNAME || 'postgres',
    password: urlConfig.password || process.env.DB_PASSWORD || 'postgres',
    database: urlConfig.database || process.env.DB_NAME || 'rbi_inventory',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  };
});
