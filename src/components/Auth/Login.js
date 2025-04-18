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
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await auth.login(formData.username, formData.password);
      login(response.data, response.data.token);
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Invalid username or password');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Login
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
          label="Password"
          type="password"
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          sx={{ mt: 3 }}
        >
          Login
        </Button>
        <Button
          fullWidth
          variant="text"
          onClick={onToggleForm}
          sx={{ mt: 1 }}
        >
          Don't have an account? Register
        </Button>
      </Box>
    </Paper>
  );
};

export default Login; 