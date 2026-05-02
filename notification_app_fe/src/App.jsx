import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Typography, Box, Tabs, Tab, Card, CardContent, 
  Chip, Pagination, CircularProgress, IconButton, Badge,
  Select, MenuItem, FormControl, InputLabel, Paper, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import { Notifications as NotificationsIcon, CheckCircleOutline } from '@mui/icons-material';
import { fetchNotifications, getTopNotifications, sortByPriority } from 'notification_app_be';
import { Log } from 'logging_middleware';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3f51b5' },
    secondary: { main: '#f50057' },
    background: { default: '#f4f6f8' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: 16,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)'
          }
        }
      }
    }
  }
});

const getTypeColor = (type) => {
  switch(type) {
    case 'Placement': return 'error';
    case 'Result': return 'primary';
    case 'Event': return 'success';
    default: return 'default';
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readStatus, setReadStatus] = useState(new Set());
  
  // URL params state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [filterType, setFilterType] = useState('All');

  // Sync URL Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPage = parseInt(params.get('page')) || 1;
    const urlLimit = parseInt(params.get('limit')) || 5;
    setPage(urlPage);
    setLimit(urlLimit);
  }, []);

  const updateUrlParams = (newPage, newLimit) => {
    const url = new URL(window.location);
    url.searchParams.set('page', newPage);
    url.searchParams.set('limit', newLimit);
    window.history.pushState({}, '', url);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Log('frontend', 'info', 'page', 'Campus Hub UI initialized, fetching notifications');
      const data = await fetchNotifications();
      setNotifications(data || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
    updateUrlParams(1, limit);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    updateUrlParams(value, limit);
  };

  const markAsRead = (id) => {
    setReadStatus(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  // Process notifications based on tab
  const processedData = useMemo(() => {
    let filtered = notifications;
    if (filterType !== 'All') {
      filtered = notifications.filter(n => n.type === filterType);
    }
    
    if (activeTab === 0) {
      // All notifications (sorted by time or priority)
      return sortByPriority(filtered);
    } else {
      // Top 10 Priority Notifications
      return getTopNotifications(filtered, 10);
    }
  }, [notifications, activeTab, filterType]);

  // Pagination slice
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return processedData.slice(startIndex, startIndex + limit);
  }, [processedData, page, limit]);

  const totalPages = Math.ceil(processedData.length / limit) || 1;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <NotificationsIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Campus Hub
          </Typography>
        </Box>

        <Paper sx={{ mb: 4, borderRadius: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
            <Tab label="All Notifications" />
            <Tab label={
              <Badge badgeContent="Top 10" color="error">
                Priority
              </Badge>
            } />
          </Tabs>
        </Paper>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
                updateUrlParams(1, limit);
              }}
            >
              <MenuItem value="All">All Categories</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedData.length} of {processedData.length}
          </Typography>
        </Box>

        {paginatedData.length === 0 ? (
          <Box py={8} textAlign="center">
            <Typography variant="h6" color="text.secondary">No notifications found.</Typography>
          </Box>
        ) : (
          paginatedData.map(notification => {
            const isRead = readStatus.has(notification.id);
            const isImportant = notification.type === 'Placement';
            return (
              <Card 
                key={notification.id} 
                sx={{ 
                  borderLeft: isImportant ? '6px solid #f50057' : '6px solid #e0e0e0',
                  opacity: isRead ? 0.7 : 1,
                  bgcolor: isRead ? '#fafafa' : '#fff'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Box display="flex" gap={1} alignItems="center" mb={1}>
                        <Chip 
                          label={notification.type} 
                          size="small" 
                          color={getTypeColor(notification.type)} 
                          variant={isRead ? "outlined" : "filled"}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                        {!isRead && (
                          <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                      <Typography variant="body1" fontWeight={isRead ? "normal" : "bold"}>
                        {notification.message}
                      </Typography>
                    </Box>
                    <IconButton 
                      onClick={() => markAsRead(notification.id)}
                      color={isRead ? "default" : "success"}
                      title={isRead ? "Marked as read" : "Mark as read"}
                    >
                      <CheckCircleOutline />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              size="large"
            />
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}
