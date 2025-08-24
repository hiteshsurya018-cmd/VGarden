/**
 * Backend Proxy Service for Virtual Garden
 * Proxies requests to Python FastAPI backend
 */

import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

interface BackendConfig {
  port: number;
  host: string;
  pythonPath?: string;
}

class BackendManager {
  private process: ChildProcess | null = null;
  private config: BackendConfig;
  private isStarting = false;

  constructor(config: BackendConfig) {
    this.config = config;
  }

  async startBackend(): Promise<boolean> {
    if (this.isStarting || this.process) {
      console.log('Backend already starting or running');
      return true;
    }

    this.isStarting = true;
    const backendDir = join(process.cwd(), 'ml-backend');
    
    if (!existsSync(backendDir)) {
      console.error('Backend directory not found:', backendDir);
      this.isStarting = false;
      return false;
    }

    try {
      console.log('🌱 Starting Virtual Garden Backend...');

      // Check if we're in a containerized environment without Python
      const isContainer = process.env.NODE_ENV === 'production' ||
                         process.env.RAILWAY_ENVIRONMENT ||
                         process.env.FLY_APP_NAME ||
                         !existsSync('/usr/bin/python3');

      if (isContainer) {
        console.log('⚠️ Container environment detected - Python backend not available');
        console.log('ℹ️ Virtual Garden will use enhanced fallback detection');
        this.isStarting = false;
        return false;
      }

      // Try to start Python backend
      const pythonCmd = this.config.pythonPath || 'python3';
      const args = [
        '-m', 'uvicorn',
        'main:app',
        '--host', this.config.host,
        '--port', this.config.port.toString(),
        '--reload'
      ];

      this.process = spawn(pythonCmd, args, {
        cwd: backendDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        env: {
          ...process.env,
          PYTHONPATH: backendDir,
          PYTHONUNBUFFERED: '1'
        }
      });

      // Handle process output
      this.process.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('[BACKEND]', output.trim());
      });

      this.process.stderr?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Uvicorn running')) {
          console.log('✅ Backend server started successfully');
        }
        console.log('[BACKEND]', output.trim());
      });

      this.process.on('error', (error) => {
        console.error('❌ Backend process error:', error);
        this.cleanup();
      });

      this.process.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
        this.cleanup();
      });

      // Wait a moment for startup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if backend is responding
      const isHealthy = await this.checkHealth();
      this.isStarting = false;
      
      return isHealthy;

    } catch (error) {
      console.error('Failed to start backend:', error);
      this.cleanup();
      this.isStarting = false;
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`http://${this.config.host}:${this.config.port}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend health check passed:', data);
        return true;
      }
    } catch (error) {
      console.log('⚠️ Backend not ready yet:', error.message);
    }
    return false;
  }

  cleanup() {
    if (this.process && !this.process.killed) {
      console.log('🛑 Stopping backend process...');
      this.process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill('SIGKILL');
        }
      }, 5000);
    }
    this.process = null;
    this.isStarting = false;
  }

  isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }
}

// Create backend manager instance
const backendManager = new BackendManager({
  port: 8000,
  host: 'localhost'
});

// Auto-start backend when module is loaded
let autoStartPromise: Promise<boolean> | null = null;

export const startBackendIfNeeded = async (): Promise<boolean> => {
  if (autoStartPromise) {
    return autoStartPromise;
  }
  
  autoStartPromise = backendManager.startBackend();
  return autoStartPromise;
};

export const isBackendRunning = (): boolean => {
  return backendManager.isRunning();
};

export const stopBackend = (): void => {
  backendManager.cleanup();
};

export const checkBackendHealth = async (): Promise<boolean> => {
  return backendManager.checkHealth();
};

// Cleanup on process exit
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  backendManager.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  backendManager.cleanup();
  process.exit(0);
});

// Start backend automatically
startBackendIfNeeded().then(success => {
  if (success) {
    console.log('🎉 Virtual Garden backend is ready!');
  } else {
    console.log('⚠️ Backend startup failed, using fallback detection');
  }
}).catch(error => {
  console.error('Backend startup error:', error);
});
