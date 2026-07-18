import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  List,
  ListItem,
  InputAdornment
} from '@mui/material';
import {
  Shield,
  People,
  DirectionsCar,
  Settings,
  Add,
  Check,
  Close,
  Edit,
  Save,
  Search
} from '@mui/icons-material';
import { mockApi } from '../../services/mockApi.jsx';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Employees Tab states
  const [employees, setEmployees] = useState([]);
  const [searchEmp, setSearchEmp] = useState('');
  const [openAddEmp, setOpenAddEmp] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    department: '',
    manager: '',
    officeLocation: ''
  });

  // Vehicles Tab states
  const [orgVehicles, setOrgVehicles] = useState([]);

  // Settings Tab states
  const [settings, setSettings] = useState({
    companyName: '',
    registeredOffice: '',
    industry: '',
    contactInfo: '',
    totalEmployees: 0,
    fuelCostPerLitre: 0,
    travelCostPerKm: 0,
    carpoolingPolicy: ''
  });

  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  const fetchData = async () => {
    try {
      const empRes = await mockApi.admin.getEmployees();
      setEmployees(empRes.data);
      const vehicleRes = await mockApi.admin.getOrgVehicles();
      setOrgVehicles(vehicleRes.data);
      const settingsRes = await mockApi.admin.getOrgSettings();
      setSettings(settingsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Employees actions
  const handleToggleAccess = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'revoked' : 'active';
    try {
      await mockApi.admin.updateEmployeeAccess(id, nextStatus);
      setEmployees(employees.map(e => e.id === id ? { ...e, accessStatus: nextStatus } : e));
      setToast({ open: true, msg: 'Employee platform access updated!', severity: 'success' });
    } catch (err) {
      setToast({ open: true, msg: 'Failed to update access', severity: 'error' });
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const { data } = await mockApi.admin.addEmployee(newEmp);
      setEmployees([...employees, data]);
      setOpenAddEmp(false);
      setToast({ open: true, msg: 'Employee registered & access granted!', severity: 'success' });
    } catch (err) {
      setToast({ open: true, msg: 'Failed to register employee', severity: 'error' });
    }
  };

  // Vehicles actions
  const handleApproveVehicle = async (id, status) => {
    try {
      await mockApi.admin.updateVehicleStatus(id, status);
      setOrgVehicles(orgVehicles.map(v => v.id === id ? { ...v, approvalStatus: status } : v));
      setToast({ open: true, msg: `Vehicle status set to ${status}`, severity: 'success' });
    } catch (err) {
      setToast({ open: true, msg: 'Failed to update vehicle', severity: 'error' });
    }
  };

  // Settings actions
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await mockApi.admin.saveOrgSettings(settings);
      setToast({ open: true, msg: 'Organization settings updated!', severity: 'success' });
    } catch (err) {
      setToast({ open: true, msg: 'Failed to update settings', severity: 'error' });
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.email.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.department.toLowerCase().includes(searchEmp.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h5" fontWeight={800} color="primary" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield /> Company Administration Control
      </Typography>

      <Card sx={{ borderRadius: 3.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, py: 1 }}
        >
          <Tab icon={<People sx={{ mr: 1, fontSize: '1.2rem' }} />} iconPosition="start" label="Employees Management" />
          <Tab icon={<DirectionsCar sx={{ mr: 1, fontSize: '1.2rem' }} />} iconPosition="start" label="Registered Vehicles" />
          <Tab icon={<Settings sx={{ mr: 1, fontSize: '1.2rem' }} />} iconPosition="start" label="Company Configuration" />
        </Tabs>

        {/* Tab 1: Employees Management */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search employees..."
                value={searchEmp}
                onChange={(e) => setSearchEmp(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: 260 } }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenAddEmp(true)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Add Employee
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Office Location</TableCell>
                    <TableCell align="center">Platform Access</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.manager}</TableCell>
                      <TableCell>{emp.officeLocation}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Chip
                            label={emp.accessStatus.toUpperCase()}
                            color={emp.accessStatus === 'active' ? 'success' : 'error'}
                            size="small"
                            sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                          />
                          <Switch
                            checked={emp.accessStatus === 'active'}
                            onChange={() => handleToggleAccess(emp.id, emp.accessStatus)}
                            color="success"
                            size="small"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 2: Registered Vehicles */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Registration No.</TableCell>
                    <TableCell>Vehicle Model</TableCell>
                    <TableCell>Seating Capacity</TableCell>
                    <TableCell>Assigned Driver</TableCell>
                    <TableCell>Approval Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orgVehicles.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{v.registrationNumber}</TableCell>
                      <TableCell>{v.model}</TableCell>
                      <TableCell>{v.seatingCapacity} seats</TableCell>
                      <TableCell>{v.assignedDriver}</TableCell>
                      <TableCell>
                        <Chip
                          label={v.approvalStatus.toUpperCase()}
                          color={v.approvalStatus === 'approved' ? 'success' : v.approvalStatus === 'pending' ? 'warning' : 'error'}
                          size="small"
                          sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleApproveVehicle(v.id, 'approved')}
                            disabled={v.approvalStatus === 'approved'}
                            sx={{ border: '1px solid', borderColor: 'success.light' }}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleApproveVehicle(v.id, 'rejected')}
                            disabled={v.approvalStatus === 'rejected'}
                            sx={{ border: '1px solid', borderColor: 'error.light' }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 3: Settings Config */}
        {activeTab === 2 && (
          <Box sx={{ p: 4 }}>
            <form onSubmit={handleSaveSettings}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Organization Details
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Industry Sector"
                    value={settings.industry}
                    onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Registered Office Address"
                    value={settings.registeredOffice}
                    onChange={(e) => setSettings({ ...settings, registeredOffice: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Operational Contact Info"
                    value={settings.contactInfo}
                    onChange={(e) => setSettings({ ...settings, contactInfo: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Registered Employees"
                    value={settings.totalEmployees}
                    onChange={(e) => setSettings({ ...settings, totalEmployees: parseInt(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Carpooling Policy & Cost Configurations
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Fuel Cost Per Litre (₹)"
                    value={settings.fuelCostPerLitre}
                    onChange={(e) => setSettings({ ...settings, fuelCostPerLitre: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Travel Cost Per Kilometer (₹)"
                    value={settings.travelCostPerKm}
                    onChange={(e) => setSettings({ ...settings, travelCostPerKm: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Default Carpooling Policy Statement"
                    value={settings.carpoolingPolicy}
                    onChange={(e) => setSettings({ ...settings, carpoolingPolicy: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    sx={{ borderRadius: 2, py: 1.2, px: 4, textTransform: 'none', fontWeight: 700 }}
                  >
                    Save Operational Configurations
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        )}
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={openAddEmp} onClose={() => setOpenAddEmp(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <form onSubmit={handleAddEmployee}>
          <DialogTitle sx={{ fontWeight: 700 }}>Register Organization Employee</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={newEmp.name}
              onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
            />
            <TextField
              fullWidth
              required
              type="email"
              label="Corporate Email"
              value={newEmp.email}
              onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Department"
              value={newEmp.department}
              onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Assigned Manager"
              value={newEmp.manager}
              onChange={(e) => setNewEmp({ ...newEmp, manager: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Office Location"
              value={newEmp.officeLocation}
              onChange={(e) => setNewEmp({ ...newEmp, officeLocation: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenAddEmp(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none', borderRadius: 2 }}>
              Add & Grant Access
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity="success" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
