import { Router } from "express";
import userRoutes from './user.route'
const router = Router();

router.use('/user', userRoutes)

export default router