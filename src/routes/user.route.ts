import express from 'express';

import {
  activateUser,
  loginUser,
  logoutUser,
  registerUser,
  updateToken,
  getUserInfo,
  socialAuth,
  UpdateUserInfo,
  updatePassword,
  updateProfilePicture
} from '../controllers/user.controller';
import { authorizeRole, isAuthenticated } from '../middleware/authMiddlware';
import { upload } from '../middleware/uploader';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', isAuthenticated, authorizeRole('User'), logoutUser);
router.post('/activate-user', isAuthenticated, authorizeRole('User'), activateUser);
router.post('/refresh', isAuthenticated, updateToken);
router.get('/me', isAuthenticated, authorizeRole('User', 'Admin'), getUserInfo);
router.post('/social-auth', socialAuth);
router.post('/update-info', isAuthenticated, UpdateUserInfo);
router.put('/update-user-password', isAuthenticated, updatePassword);
router.put('/update-user-avatar' , upload.single('avatar'), isAuthenticated, updateProfilePicture);

export default router;
