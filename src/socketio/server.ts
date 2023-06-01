import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import logger from '../utils/logger'
import { Types } from 'mongoose';
import cookie from 'cookie'


const httpServer = createServer();
const port = 3001

const io = new Server(httpServer, {
    cors: {
        origin: '*', // TODO: replace with actual origin
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket: Socket) => {
    logger.info(`New socket connection: ${socket.id}`);

    socket.on("joinRoom", room => {
        socket.join(room)
        logger.info(`${socket.id} has joined room ${room}`)
    })

    socket.on("leaveRoom", room => {
        socket.leave(room)
        logger.info(`${socket.id} has left room ${room}`)
    })

    socket.on('roomMessage', ({ convo_id, content }) => {
        io.to(convo_id.toString()).emit("roomMessage", content)
        logger.info(`${socket.id} sends message to room: ${convo_id.toString()}\n"${content}"`)
    })

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`)
        // Clean up any resources associated with the socket
    })
})

httpServer.listen(port, () => {
    logger.info(`Socket.io Server running on port ${port}`)
})