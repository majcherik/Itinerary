const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.zomrmjwevkbofgvjfexy:g3ML5%2FUfu_HxBQS@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const typeMapping = {
    'text': 'string',
    'character varying': 'string',
    'uuid': 'string',
    'timestamp with time zone': 'string',
    'timestamp without time zone': 'string',
    'date': 'string',
    'integer': 'number',
    'bigint': 'number',
    'numeric': 'number',
    'boolean': 'boolean',
    'jsonb': 'any',
    'json': 'any',
    'ARRAY': 'any[]'
};

async function generateTypes() {
    try {
        await client.connect();
        console.log('Connected to database...');

        const res = await client.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position;
    `);

        const tables = {};

        res.rows.forEach(row => {
            if (!tables[row.table_name]) {
                tables[row.table_name] = {};
            }
            tables[row.table_name][row.column_name] = {
                type: typeMapping[row.data_type] || 'any',
                nullable: row.is_nullable === 'YES'
            };
        });

        let output = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {\n`;

        for (const [tableName, columns] of Object.entries(tables)) {
            output += `      ${tableName}: {\n`;
            output += `        Row: {\n`;
            for (const [colName, details] of Object.entries(columns)) {
                output += `          ${colName}: ${details.type}${details.nullable ? ' | null' : ''};\n`;
            }
            output += `        };\n`;
            output += `        Insert: {\n`;
            for (const [colName, details] of Object.entries(columns)) {
                // Assume ID and created_at etc are optional on insert usually, but let's be simplistic for now
                const isOptional = details.nullable || colName === 'id' || colName === 'created_at' || colName === 'updated_at';
                output += `          ${colName}${isOptional ? '?' : ''}: ${details.type}${details.nullable ? ' | null' : ''};\n`;
            }
            output += `        };\n`;
            output += `        Update: {\n`;
            for (const [colName, details] of Object.entries(columns)) {
                output += `          ${colName}?: ${details.type}${details.nullable ? ' | null' : ''};\n`;
            }
            output += `        };\n`;
            output += `      };\n`;
        }

        output += `    };\n
    Views: {\n      [_ in never]: never\n    };\n
    Functions: {\n      [_ in never]: never\n    };\n
    Enums: {\n      [_ in never]: never\n    };\n
    CompositeTypes: {\n      [_ in never]: never\n    };\n
  };\n}\n`;

        const outputPath = path.join(__dirname, '../packages/shared/src/lib/database.types.ts');
        // Ensure dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, output);
        console.log(`Types generated at ${outputPath}`);

    } catch (err) {
        console.error('Error generating types:', err);
    } finally {
        await client.end();
    }
}

generateTypes();
