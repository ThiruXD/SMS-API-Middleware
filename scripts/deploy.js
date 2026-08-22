import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function deploy() {
  const environment = process.env.ENV || 'production';
  
  console.log(`🚀 Deploying to ${environment}...`);
  
  try {
    if (environment === 'production') {
      await execAsync('wrangler deploy --env production');
    } else {
      await execAsync('wrangler deploy --env staging');
    }
    
    console.log(`✅ Successfully deployed to ${environment}`);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deploy();