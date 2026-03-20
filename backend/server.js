import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client } from 'ssh2';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Weboard SSH Backend Running', version: '1.0.0' });
});

// Test SSH connection endpoint
app.post('/api/test-connection', async (req, res) => {
  const { host, port, username, password, privateKey } = req.body;

  const conn = new Client();

  try {
    await new Promise((resolve, reject) => {
      conn.on('ready', () => {
        conn.end();
        resolve();
      });

      conn.on('error', (err) => {
        reject(err);
      });

      const config = {
        host,
        port: port || 22,
        username,
      };

      if (privateKey) {
        config.privateKey = privateKey;
      } else if (password) {
        config.password = password;
      }

      conn.connect(config);
    });

    res.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// WebSocket connection for SSH terminal
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  let sshClient = null;
  let sshStream = null;

  // Connect to SSH server
  socket.on('ssh-connect', (config) => {
    const { host, port, username, password, privateKey, rows, cols } = config;

    sshClient = new Client();

    sshClient.on('ready', () => {
      console.log('SSH connection ready');
      socket.emit('ssh-status', { status: 'connected' });

      sshClient.shell({ rows: rows || 24, cols: cols || 80 }, (err, stream) => {
        if (err) {
          socket.emit('ssh-error', { message: err.message });
          return;
        }

        sshStream = stream;

        // Send data from SSH to client
        stream.on('data', (data) => {
          socket.emit('ssh-data', data.toString('utf8'));
        });

        stream.on('close', () => {
          console.log('SSH stream closed');
          socket.emit('ssh-status', { status: 'disconnected' });
          sshClient.end();
        });

        stream.stderr.on('data', (data) => {
          socket.emit('ssh-data', data.toString('utf8'));
        });
      });
    });

    sshClient.on('error', (err) => {
      console.error('SSH error:', err);
      socket.emit('ssh-error', { message: err.message });
    });

    sshClient.on('close', () => {
      console.log('SSH connection closed');
      socket.emit('ssh-status', { status: 'disconnected' });
    });

    // Connect to SSH server
    const sshConfig = {
      host,
      port: port || 22,
      username,
    };

    if (privateKey) {
      sshConfig.privateKey = privateKey;
    } else if (password) {
      sshConfig.password = password;
    }

    sshClient.connect(sshConfig);
  });

  // Receive input from client
  socket.on('ssh-input', (data) => {
    if (sshStream) {
      sshStream.write(data);
    }
  });

  // Resize terminal
  socket.on('ssh-resize', ({ rows, cols }) => {
    if (sshStream) {
      sshStream.setWindow(rows, cols);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (sshStream) {
      sshStream.end();
    }
    if (sshClient) {
      sshClient.end();
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Weboard SSH Backend running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
