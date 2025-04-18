import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { auth } from '../../services/api';

const Register = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await auth.register(formData.username, formData.email, formData.password);
      onToggleForm();
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Register
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          margin="normal"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 3 }}
        >
          Register
        </Button>
        <Button
          fullWidth
          variant="text"
          onClick={onToggleForm}
          sx={{ mt: 1 }}
        >
          Already have an account? Login
        </Button>
      </Box>
    </Paper>
  );
};

export default Register; 