require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: process.env.NEXTJS_CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 8000;

// // Authentication middleware
// const authenticateToken = (socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//         return next(new Error('Authentication required'));
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return next(new Error('Invalid token'));
//         socket.user = decoded;
//         next();
//     });
// };

// // Apply authentication to socket connections
// io.use(authenticateToken);

// Track RPi connection and experiment status
let rpiSocket = null;
let experimentStatus = {
    isRunning: false,
    startTime: null,
    currentConfiguration: null
};

// Command validation
const validateCommand = (command, params) => {
    const validCommands = {
        'valve': (params) => params.valveId && typeof params.state === 'boolean',
        'configure': (params) => params.configuration && typeof params.configuration === 'object',
        'getReadings': (params) => true,
        'startExperiment': (params) => params.configuration && typeof params.configuration === 'object',
        'stopExperiment': (params) => true
    };

    return validCommands[command] && validCommands[command](params);
};

const registerRpi = socket=>{
    if (rpiSocket) {
        // Disconnect existing RPi connection
        rpiSocket.disconnect(true);
    }
    console.log('RPi registered:', socket.id);
    rpiSocket = socket;
    // Notify all web clients of RPi connection
    io.to('web_clients').emit('rpi_status_change', {
        status: 'connected',
        experimentStatus
    });
}

const registerWebClient = socket =>{
    console.log('Web client registered:', socket.id);
    socket.join('web_clients');
    
    // Send current status to new web client
    socket.emit('initial_state', {
        rpiConnected: !!rpiSocket,
        experimentStatus
    });
}

const parseCommands = (socket, data)=>{
    const { command, params } = data;

    // Validate command
    if (!validateCommand(command, params)) {
        socket.emit('command_error', {
            error: 'Invalid command or parameters',
            command,
            params
        });
        return;
    }

    console.log(`Command received: ${command}`, params);

    // Handle experiment-related commands
    if (command === 'startExperiment') {
        experimentStatus.isRunning = true;
        experimentStatus.startTime = new Date();
        experimentStatus.currentConfiguration = params.configuration;
    } else if (command === 'stopExperiment') {
        experimentStatus.isRunning = false;
        experimentStatus.startTime = null;
    }

    // Forward command to RPi
    rpiSocket.emit('execute_command', {
        command,
        params,
        timestamp: new Date().toISOString(),
        senderId: socket.id
    });
}

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Register client type
    socket.on('register_client', (clientType) => {
        if (clientType === 'rpi') {
            registerRpi(socket)
        } 
        else if (clientType === 'web') {
            registerWebClient(socket)
        }
    });

    // Handle commands from web client
    socket.on('command', (data) => {
        // Check if RPi is connected
        if (!rpiSocket) {
            socket.emit('command_error', {
                error: 'RPi not connected',
                command
            });
            return;
        }
       parseCommands(socket, data)
    });

    // Handle sensor data from RPi
    socket.on('sensor_data', (data) => {
        if (socket === rpiSocket && experimentStatus.isRunning) {
            // Broadcast sensor data to all web clients
            io.to('web_clients').emit('sensor_update', {
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle command responses from RPi
    socket.on('command_response', (data) => {
        const { senderId, response, status } = data;
        io.to('web_clients').emit('command_result', {
            response,
            status,
            timestamp: new Date().toISOString()
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket === rpiSocket) {
            console.log('RPi disconnected');
            rpiSocket = null;
            io.to('web_clients').emit('rpi_status_change', {
                status: 'disconnected',
                experimentStatus
            });
        }
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.emit('server_error', {
            message: 'An error occurred',
            timestamp: new Date().toISOString()
        });
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        rpiConnected: !!rpiSocket,
        experimentStatus
    });
});

http.listen(PORT, () => {
    console.log(`Bridge server running on port ${PORT}`);
});