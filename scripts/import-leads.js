
const mysql = require('mysql2/promise');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../backend/.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'support_app'
};

async function importLeads() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Read CSV file (adjust path to your lead file)
    const leads = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream('your-lead-file.csv') // Replace with your actual file path
        .pipe(csv())
        .on('data', (data) => leads.push(data))
        .on('end', async () => {
          try {
            console.log(`Processing ${leads.length} leads...`);
            
            for (const lead of leads) {
              await connection.execute(
                `INSERT IGNORE INTO leads (
                  sr_no, ckt, cust_name, address, email_id, contact_name,
                  comm_date, usable_ip_address, backup, device, bandwidth,
                  remarks, pop_name, nas_ip_1, switch_ip_1, port_no_1,
                  vlan_id_1, primary_pop, pop_name_2, nas_ip_2, switch_ip_2,
                  port_no_2, vlan_id_2, subnet_mask, gateway, sales_person,
                  testing_fe, mrtg
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  lead.sr_no, lead.ckt, lead.cust_name, lead.address, lead.email_id,
                  lead.contact_name, lead.comm_date, lead.usable_ip_address, lead.backup,
                  lead.device, lead.bandwidth, lead.remarks, lead.pop_name, lead.nas_ip_1,
                  lead.switch_ip_1, lead.port_no_1, lead.vlan_id_1, lead.primary_pop,
                  lead.pop_name_2, lead.nas_ip_2, lead.switch_ip_2, lead.port_no_2,
                  lead.vlan_id_2, lead.subnet_mask, lead.gateway, lead.sales_person,
                  lead.testing_fe, lead.mrtg
                ]
              );
            }
            
            console.log('Leads imported successfully!');
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await connection.end();
  }
}

// Run import
importLeads().catch(console.error);
