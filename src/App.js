import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Paper,
  ThemeProvider,
  createTheme,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  LinearProgress,
  Tabs,
  Tab,
  Fade,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Category as CategoryIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as SkipIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PersonalCabinet from './components/Profile/PersonalCabinet';
import { tasks } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B6B',
    },
    secondary: {
      main: '#4ECDC4',
    },
    background: {
      default: '#FFF5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
    },
  },
  typography: {
    fontFamily: '"Quicksand", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const categories = [
  'Reading',
  'Writing',
  'Math',
  'Science',
  'History',
  'Other'
];

const POMODORO_TIMES = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function MainApp() {
  const { user, logout } = useAuth();
  const [taskList, setTaskList] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [timer, setTimer] = useState(POMODORO_TIMES.work);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  // Add timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await tasks.getAll();
      if (response.data) {
        setTaskList(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Handle unauthorized access
        window.location.href = '/';
      }
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }
        
        const response = await tasks.create({
          title: newTask,
          category: selectedCategory || 'Other',
        });
        
        if (response.data) {
          setTaskList([...taskList, response.data]);
          setNewTask('');
          setSelectedCategory('');
        }
      } catch (error) {
        console.error('Failed to create task:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          // Handle unauthorized access
          window.location.href = '/';
        }
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasks.delete(taskId);
      setTaskList(taskList.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = taskList.find(t => t.id === taskId);
      await tasks.update(taskId, { 
        title: task.title,
        category: task.category,
        completed: !task.completed 
      });
      setTaskList(taskList.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    if (pomodoroMode === 'work') {
      setPomodoroCount(prev => prev + 1);
      if ((pomodoroCount + 1) % 4 === 0) {
        setPomodoroMode('longBreak');
        setTimer(POMODORO_TIMES.longBreak);
      } else {
        setPomodoroMode('shortBreak');
        setTimer(POMODORO_TIMES.shortBreak);
      }
    } else {
      setPomodoroMode('work');
      setTimer(POMODORO_TIMES.work);
    }
    // Play notification sound
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (taskList.length === 0) return 0;
    const completedTasks = taskList.filter(task => task.completed).length;
    return (completedTasks / taskList.length) * 100;
  };

  const getTimerColor = () => {
    switch (pomodoroMode) {
      case 'work': return '#FF6B6B';
      case 'shortBreak': return '#4ECDC4';
      case 'longBreak': return '#45B7D1';
      default: return '#FF6B6B';
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  if (!user) {
    return (
      <Box sx={{ py: 4 }}>
        {activeTab === 0 ? (
          <Login onToggleForm={() => setActiveTab(1)} />
        ) : (
          <Register onToggleForm={() => setActiveTab(0)} />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Study Task Manager
          </Typography>
          <IconButton
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MuiMenuItem onClick={() => { setActiveTab(2); handleMenuClose(); }}>
              <PersonIcon sx={{ mr: 1 }} /> Profile
            </MuiMenuItem>
            <MuiMenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MuiMenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        {activeTab === 0 ? (
          <>
            <Box sx={{ mb: 4 }}>
              <LinearProgress 
                variant="determinate" 
                value={getProgress()} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#FF6B6B',
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {taskList.filter(task => task.completed).length} of {taskList.length} tasks completed
              </Typography>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Add a new study task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="Category"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleAddTask}
                      startIcon={<AddIcon />}
                    >
                      Add Task
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setShowTimerDialog(true)}
                      startIcon={<TimerIcon />}
                    >
                      Timer
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
              <List>
                {taskList.map((task) => (
                  <ListItem 
                    key={task.id} 
                    divider
                    sx={{
                      bgcolor: task.completed ? 'rgba(255, 107, 107, 0.05)' : 'transparent',
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: 'rgba(255, 107, 107, 0.05)',
                      }
                    }}
                  >
                    <Checkbox
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      icon={<UncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      color="primary"
                    />
                    <ListItemText 
                      primary={task.title}
                      secondary={task.category}
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary',
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        icon={<CategoryIcon />}
                        label={task.category}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteTask(task.id)}
                        color="secondary"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {taskList.length === 0 && (
                  <ListItem>
                    <ListItemText 
                      primary="No tasks yet. Add your first study task above!"
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </>
        ) : activeTab === 2 ? (
          <PersonalCabinet />
        ) : null}
      </Container>

      <Dialog 
        open={showTimerDialog} 
        onClose={() => setShowTimerDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: getTimerColor(),
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {pomodoroMode === 'work' ? 'Focus Time' : 
           pomodoroMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress
              variant="determinate"
              value={(timer / (POMODORO_TIMES[pomodoroMode])) * 100}
              size={200}
              thickness={4}
              sx={{
                color: getTimerColor(),
              }}
            />
            <Typography variant="h1" sx={{ 
              mt: 3,
              fontWeight: 'bold',
              color: getTimerColor()
            }}>
              {formatTime(timer)}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Pomodoros completed: {pomodoroCount}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setPomodoroMode('work');
              setTimer(POMODORO_TIMES.work);
              setIsTimerRunning(false);
              setPomodoroCount(0);
            }}
            startIcon={<RefreshIcon />}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (timer === 0) {
                setTimer(POMODORO_TIMES[pomodoroMode]);
              }
              setIsTimerRunning(!isTimerRunning);
            }}
            startIcon={isTimerRunning ? <PauseIcon /> : <PlayIcon />}
            sx={{ bgcolor: getTimerColor(), '&:hover': { bgcolor: getTimerColor() } }}
          >
            {isTimerRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              handleTimerComplete();
              setIsTimerRunning(false);
            }}
            startIcon={<SkipIcon />}
          >
            Skip
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 