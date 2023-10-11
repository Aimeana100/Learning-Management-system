import express from 'express'
import { activateUser, loginUser, logoutUser, registerUser } from '../controllers/user.controller'
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/activate-user', activateUser)

export default router