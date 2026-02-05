import Express from 'express'
import { createRoom, deleteRoom, getRoom, getRooms, updateRoom } from '../controllers/room.controller.js';
import { Auth } from '../middlewares/auth.middleware.js'

const Router= Express.Router();

Router.post('/',  Auth, createRoom);
Router.get('/',  Auth, getRooms);
Router.get('/:id',  Auth, getRoom);
Router.put('/:id',  Auth, updateRoom);
Router.delete('/:id',  Auth, deleteRoom);

export default Router;