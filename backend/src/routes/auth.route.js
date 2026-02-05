import Express from 'express'
import { login, logout, profile, register, users } from '../controllers/auth.controller.js';
import { Auth } from '../middlewares/auth.middleware.js'
const router = Express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', Auth, profile);
router.get('/users',Auth, users);
router.post('/logout',Auth, logout);

export default router;
