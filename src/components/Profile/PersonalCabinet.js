import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { user } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PersonalCabinet = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await user.getProfile();
        setProfile(response.data);
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {authUser?.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
              {authUser?.username || 'User'}
            </Typography>
            <Typography color="text.secondary">
              {authUser?.email || 'No email provided'}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Member Since
              </Typography>
              <Typography>
                {new Date(profile.created_at).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Tasks
              </Typography>
              <Typography>
                {profile.task_count}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Completed Tasks
              </Typography>
              <Typography>
                {profile.completed_tasks}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Completion Rate
              </Typography>
              <Typography>
                {profile.task_count > 0
                  ? `${Math.round((profile.completed_tasks / profile.task_count) * 100)}%`
                  : '0%'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PersonalCabinet; 