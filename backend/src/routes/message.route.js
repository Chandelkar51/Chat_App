import Express from 'express'
import { deleteMsg, getRoomMessage, sendMsg, uploadAndSend } from '../controllers/message.controller.js';
import { Auth } from '../middlewares/auth.middleware.js'
import {upload} from '../middlewares/upload.middleware.js'


const Router= Express.Router();

Router.post('/', Auth, sendMsg);
Router.post('/upload', Auth, upload.single('file'), uploadAndSend);
Router.get('/:roomId', Auth, getRoomMessage);
Router.delete('/:id', Auth, deleteMsg);

export default Router;
